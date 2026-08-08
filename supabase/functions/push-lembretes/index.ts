// Edge Function `push-lembretes` — o carteiro de lembretes E compromissos.
//
// Chamada a cada minuto pelo pg_cron (via pg_net).
//
// O que mudou e por quê: antes só existia "avisar na hora exata", e a AGENDA
// era muda — você marcava dentista sexta 14h e não recebia nada. Agora cada
// item tem `avisos` (minutos ANTES: 0 = na hora, 60 = 1h, 1440 = 1 dia) e
// `avisos_enviados`, que registra quais já dispararam. Sem esse registro, o
// cron de 1 em 1 minuto mandaria o MESMO aviso 60 vezes por hora.
//
// Roda com service_role (precisa varrer itens de todo mundo), por isso é
// deployada com --no-verify-jwt e protegida por segredo próprio no header —
// sem ele, qualquer um na internet dispararia o carteiro.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as webpush from 'jsr:@negrel/webpush@0.3.0'

const LOTE = 100 // teto por ciclo: atraso longo não vira rajada infinita

function proximaOcorrencia(quando: Date, repetir: string): Date {
  const d = new Date(quando)
  const agora = new Date()
  // Avança até ficar no futuro: se o app ficou dias fora, não dispara N vezes
  // acumuladas — notifica uma vez e agenda a PRÓXIMA de verdade.
  do {
    if (repetir === 'diario') d.setDate(d.getDate() + 1)
    else if (repetir === 'semanal') d.setDate(d.getDate() + 7)
    else if (repetir === 'mensal') d.setMonth(d.getMonth() + 1)
    else return d
  } while (d <= agora)
  return d
}

/** "1 dia antes", "1h antes", "agora" — o texto que a pessoa lê na tela. */
function comoAvisar(min: number, quandoBR: string): string {
  if (min === 0) return `agora — ${quandoBR}`
  if (min < 60) return `em ${min} min — ${quandoBR}`
  if (min < 1440) {
    const h = Math.round(min / 60)
    return `em ${h} hora${h > 1 ? 's' : ''} — ${quandoBR}`
  }
  const d = Math.round(min / 1440)
  return `${d === 1 ? 'amanhã' : `em ${d} dias`} — ${quandoBR}`
}

function horaBR(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

interface Item {
  id: string
  user_id: string
  titulo: string
  /** `quando` no lembrete, `inicio` no compromisso — normalizado aqui. */
  horario: string
  avisos: number[] | null
  avisos_enviados: number[] | null
  repetir?: string
  tabela: 'lembretes' | 'compromissos'
}

Deno.serve(async (req) => {
  try {
    const segredo = Deno.env.get('CRON_SECRET')
    if (!segredo || req.headers.get('x-cron-secret') !== segredo) {
      return Response.json({ erro: 'não autorizado' }, { status: 401 })
    }

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const agora = new Date()
    // Janela de busca: do passado recente (pra não perder quem venceu enquanto
    // a função estava fora do ar) até 8 dias à frente (cobre o aviso mais
    // antecipado disponível na interface, que é de 2 dias, com folga).
    const de = new Date(agora.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const ate = new Date(agora.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString()

    const [lembretesRes, compromissosRes] = await Promise.all([
      sb.from('lembretes')
        .select('id, user_id, titulo, quando, repetir, avisos, avisos_enviados')
        .eq('concluido', false).gte('quando', de).lte('quando', ate).limit(LOTE),
      sb.from('compromissos')
        .select('id, user_id, titulo, inicio, avisos, avisos_enviados')
        .gte('inicio', de).lte('inicio', ate).limit(LOTE),
    ])
    if (lembretesRes.error) throw lembretesRes.error
    if (compromissosRes.error) throw compromissosRes.error

    const itens: Item[] = [
      ...(lembretesRes.data ?? []).map((l) => ({
        id: l.id, user_id: l.user_id, titulo: l.titulo, horario: l.quando,
        avisos: l.avisos, avisos_enviados: l.avisos_enviados,
        repetir: l.repetir, tabela: 'lembretes' as const,
      })),
      ...(compromissosRes.data ?? []).map((c) => ({
        id: c.id, user_id: c.user_id, titulo: c.titulo, horario: c.inicio,
        avisos: c.avisos, avisos_enviados: c.avisos_enviados,
        tabela: 'compromissos' as const,
      })),
    ]

    // Decide o que disparar ANTES de montar o servidor VAPID: na maioria dos
    // ciclos (roda 1440x por dia) não há nada a enviar, e aí a função sai
    // barata, sem importar chave nem abrir conexão.
    const disparos: Array<{ item: Item; aviso: number }> = []
    for (const item of itens) {
      const avisos = item.avisos?.length ? item.avisos : [0]
      const enviados = item.avisos_enviados ?? []
      const alvo = new Date(item.horario).getTime()
      for (const min of avisos) {
        if (enviados.includes(min)) continue
        const momento = alvo - min * 60_000
        if (momento > agora.getTime()) continue // ainda não chegou a hora
        disparos.push({ item, aviso: min })
      }
    }

    if (disparos.length === 0) return Response.json({ enviados: 0, avaliados: itens.length })

    const vapidKeys = await webpush.importVapidKeys(
      JSON.parse(Deno.env.get('VAPID_KEYS_JWK')!),
      { extractable: false }
    )
    const appServer = await webpush.ApplicationServer.new({
      contactInformation: 'mailto:contato@meuauxiliar.com',
      vapidKeys,
    })

    // Um cache de inscrições por usuário: vários avisos do mesmo dono no mesmo
    // ciclo não viram várias consultas iguais ao banco.
    const inscricoesPorDono = new Map<string, Array<{ id: string; endpoint: string; p256dh: string; auth: string }>>()
    const inscricoesDe = async (userId: string) => {
      if (!inscricoesPorDono.has(userId)) {
        const { data } = await sb
          .from('push_subscriptions')
          .select('id, endpoint, p256dh, auth')
          .eq('user_id', userId)
        inscricoesPorDono.set(userId, data ?? [])
      }
      return inscricoesPorDono.get(userId)!
    }

    let enviados = 0
    // Acumula por item pra gravar `avisos_enviados` UMA vez por linha, mesmo
    // quando dois avisos do mesmo item vencem no mesmo ciclo.
    const marcados = new Map<string, { item: Item; avisos: number[] }>()

    for (const { item, aviso } of disparos) {
      const ehCompromisso = item.tabela === 'compromissos'
      const quandoTexto = horaBR(item.horario)
      const corpo = `${item.titulo} — ${comoAvisar(aviso, quandoTexto)}`

      for (const s of await inscricoesDe(item.user_id)) {
        try {
          const assinante = appServer.subscribe({
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          })
          await assinante.pushTextMessage(
            JSON.stringify({
              titulo: ehCompromisso ? '📅 Compromisso' : '⏰ Lembrete',
              corpo,
              url: '/',
              // Tag inclui o aviso: o de "1 dia antes" NÃO pode substituir na
              // bandeja o de "na hora" — são avisos diferentes do mesmo item.
              tag: `${item.tabela}-${item.id}-${aviso}`,
            }),
            { urgency: webpush.Urgency.High }
          )
          enviados++
        } catch (e) {
          const status = (e as { response?: { status?: number } })?.response?.status
          // 404/410 = aparelho desinscreveu (app removido, permissão revogada).
          // Linha morta sai da tabela — senão todo ciclo tenta pra sempre.
          if (status === 404 || status === 410) {
            await sb.from('push_subscriptions').delete().eq('id', s.id)
          } else {
            console.error('[push] falha no envio', s.endpoint.slice(0, 40), e)
          }
        }
      }

      const acc = marcados.get(item.id) ?? { item, avisos: [] }
      acc.avisos.push(aviso)
      marcados.set(item.id, acc)
    }

    for (const { item, avisos } of marcados.values()) {
      const jaEnviados = [...(item.avisos_enviados ?? []), ...avisos]
      const passouDaHora = new Date(item.horario) <= agora

      if (item.tabela === 'lembretes' && item.repetir && item.repetir !== 'nunca' && passouDaHora) {
        // Repetente que já venceu: reagenda e zera os avisos pra próxima volta.
        await sb.from('lembretes').update({
          quando: proximaOcorrencia(new Date(item.horario), item.repetir).toISOString(),
          avisos_enviados: [],
          notificado_em: null,
        }).eq('id', item.id)
      } else {
        await sb.from(item.tabela).update({
          avisos_enviados: jaEnviados,
          ...(item.tabela === 'lembretes' && passouDaHora
            ? { notificado_em: agora.toISOString() }
            : {}),
        }).eq('id', item.id)
      }
    }

    return Response.json({ enviados, disparos: disparos.length, avaliados: itens.length })
  } catch (e) {
    console.error('[push-lembretes]', e)
    return Response.json({ erro: (e as Error).message }, { status: 500 })
  }
})
