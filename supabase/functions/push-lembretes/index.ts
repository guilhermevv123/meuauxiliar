// Edge Function `push-lembretes` — o carteiro dos lembretes.
//
// Chamada a cada minuto pelo pg_cron (via pg_net). Fluxo:
//  1. pega lembretes vencidos ainda não notificados;
//  2. manda web-push pra TODOS os aparelhos do dono do lembrete;
//  3. carimba `notificado_em`; se repete, reagenda `quando` e desarma o
//     carimbo — o mesmo lembrete toca de novo no próximo ciclo.
//
// Roda com service_role (precisa varrer lembretes de todo mundo), por isso é
// deployada com --no-verify-jwt e protegida por segredo próprio no header —
// sem ele, qualquer um na internet dispararia o carteiro.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as webpush from 'jsr:@negrel/webpush@0.3.0'

const LOTE = 50 // teto por ciclo: atraso longo não vira rajada infinita

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

    const { data: vencidos, error } = await sb
      .from('lembretes')
      .select('id, user_id, titulo, quando, repetir')
      .lte('quando', new Date().toISOString())
      .is('notificado_em', null)
      .eq('concluido', false)
      .limit(LOTE)
    if (error) throw error
    if (!vencidos?.length) return Response.json({ enviados: 0 })

    // Servidor de aplicação VAPID (chaves em JWK nos secrets)
    const vapidKeys = await webpush.importVapidKeys(
      JSON.parse(Deno.env.get('VAPID_KEYS_JWK')!),
      { extractable: false }
    )
    const appServer = await webpush.ApplicationServer.new({
      contactInformation: 'mailto:contato@meuauxiliar.com',
      vapidKeys,
    })

    let enviados = 0
    for (const l of vencidos) {
      const { data: inscricoes } = await sb
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('user_id', l.user_id)

      for (const s of inscricoes ?? []) {
        try {
          const assinante = appServer.subscribe({
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          })
          await assinante.pushTextMessage(
            JSON.stringify({
              titulo: '⏰ Lembrete',
              corpo: l.titulo,
              url: '/',
              tag: `lembrete-${l.id}`,
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

      if (l.repetir !== 'nunca') {
        await sb
          .from('lembretes')
          .update({
            quando: proximaOcorrencia(new Date(l.quando), l.repetir).toISOString(),
            notificado_em: null, // rearma pro próximo ciclo
          })
          .eq('id', l.id)
      } else {
        await sb.from('lembretes').update({ notificado_em: new Date().toISOString() }).eq('id', l.id)
      }
    }

    return Response.json({ enviados, lembretes: vencidos.length })
  } catch (e) {
    console.error('[push-lembretes]', e)
    return Response.json({ erro: (e as Error).message }, { status: 500 })
  }
})
