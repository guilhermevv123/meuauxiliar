// Edge Function `ai-chat` — a assistente com as mãos no banco.
//
// Desenho de segurança que NÃO pode regredir:
//  • A chave da OpenAI vive AQUI (secret da função). O app antigo mandava a
//    chave pro navegador via VITE_OPENAI_API_KEY — qualquer um abria o
//    DevTools e saía usando a conta. Nunca mais.
//  • As ferramentas executam com o cliente do PRÓPRIO usuário (o JWT que veio
//    no header segue para o Postgres) — a RLS decide o que a IA enxerga. A IA
//    do dono não lê a agenda do amigo nem por engano de prompt, porque o
//    banco não deixa.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const MODELO = 'gpt-4o-mini' // barato e resolve tool-calling com folga

type Ferramenta = {
  name: string
  description: string
  parameters: Record<string, unknown>
}

const FERRAMENTAS: Ferramenta[] = [
  {
    name: 'criar_compromisso',
    description: 'Cria um compromisso na agenda do usuário.',
    parameters: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        inicio: { type: 'string', description: 'ISO 8601 com fuso, ex 2026-08-14T14:00:00-03:00' },
        fim: { type: 'string', description: 'ISO 8601, opcional' },
        local: { type: 'string' },
        descricao: { type: 'string' },
        dia_inteiro: { type: 'boolean' },
      },
      required: ['titulo', 'inicio'],
    },
  },
  {
    name: 'listar_compromissos',
    description: 'Lista compromissos entre duas datas.',
    parameters: {
      type: 'object',
      properties: {
        de: { type: 'string', description: 'ISO 8601 início do período' },
        ate: { type: 'string', description: 'ISO 8601 fim do período' },
      },
      required: ['de', 'ate'],
    },
  },
  {
    name: 'apagar_compromisso',
    description: 'Apaga um compromisso pelo id (liste antes para descobrir o id).',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'criar_nota',
    description: 'Guarda uma anotação. Use `topicos` (lista de bullets curtos) quando o usuário ditar itens/listas; `conteudo` para texto corrido.',
    parameters: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        conteudo: { type: 'string' },
        topicos: { type: 'array', items: { type: 'string' }, description: 'Itens/bullets da nota' },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'listar_notas',
    description: 'Lista as anotações (opcionalmente filtrando por termo).',
    parameters: {
      type: 'object',
      properties: { busca: { type: 'string' } },
    },
  },
  {
    name: 'criar_lembrete',
    description: 'Cria um lembrete que vira notificação no celular na hora marcada.',
    parameters: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        quando: { type: 'string', description: 'ISO 8601 com fuso' },
        repetir: { type: 'string', enum: ['nunca', 'diario', 'semanal', 'mensal'] },
      },
      required: ['titulo', 'quando'],
    },
  },
  {
    name: 'listar_lembretes',
    description: 'Lista os lembretes pendentes e concluídos.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'concluir_lembrete',
    description: 'Marca um lembrete como concluído pelo id.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
]

/**
 * ISO → "sábado, 09/08/2026 09:00" no fuso de São Paulo.
 *
 * Sem isto o modelo recebia `2026-08-09T12:00:00+00:00` e LIA como meio-dia —
 * dizia a hora errada (a real era 09:00 em Brasília). Toda listagem manda a
 * hora já formatada no fuso do usuário; o ISO segue junto só pra referência.
 */
function horaBR(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// deno-lint-ignore no-explicit-any
async function executarFerramenta(sb: any, userId: string, nome: string, args: any) {
  switch (nome) {
    case 'criar_compromisso': {
      const { error } = await sb.from('compromissos').insert({
        user_id: userId,
        titulo: args.titulo,
        inicio: args.inicio,
        fim: args.fim ?? null,
        local: args.local ?? null,
        descricao: args.descricao ?? null,
        dia_inteiro: !!args.dia_inteiro,
      })
      if (error) throw error
      return { ok: true, mensagem: 'Compromisso criado.' }
    }
    case 'listar_compromissos': {
      const { data, error } = await sb
        .from('compromissos')
        .select('id, titulo, inicio, fim, local, dia_inteiro')
        .gte('inicio', args.de)
        .lt('inicio', args.ate)
        .order('inicio')
        .limit(50)
      if (error) throw error
      // deno-lint-ignore no-explicit-any
      return { compromissos: (data ?? []).map((c: any) => ({ ...c, quando_br: horaBR(c.inicio) })) }
    }
    case 'apagar_compromisso': {
      const { error, count } = await sb
        .from('compromissos')
        .delete({ count: 'exact' })
        .eq('id', args.id)
      if (error) throw error
      return { ok: (count ?? 0) > 0 }
    }
    case 'criar_nota': {
      const { error } = await sb.from('notas').insert({
        user_id: userId,
        titulo: args.titulo ?? '',
        conteudo: args.conteudo ?? '',
        topicos: Array.isArray(args.topicos) ? args.topicos : [],
      })
      if (error) throw error
      return { ok: true, mensagem: 'Nota guardada.' }
    }
    case 'listar_notas': {
      let q = sb
        .from('notas')
        .select('id, titulo, conteudo, topicos, atualizado_em')
        .order('atualizado_em', { ascending: false })
        .limit(20)
      if (args.busca) q = q.or(`titulo.ilike.%${args.busca}%,conteudo.ilike.%${args.busca}%`)
      const { data, error } = await q
      if (error) throw error
      return { notas: data }
    }
    case 'criar_lembrete': {
      const { error } = await sb.from('lembretes').insert({
        user_id: userId,
        titulo: args.titulo,
        quando: args.quando,
        repetir: args.repetir ?? 'nunca',
      })
      if (error) throw error
      return { ok: true, mensagem: 'Lembrete criado — a notificação chega na hora.' }
    }
    case 'listar_lembretes': {
      const { data, error } = await sb
        .from('lembretes')
        .select('id, titulo, quando, repetir, concluido')
        .order('quando')
        .limit(50)
      if (error) throw error
      // deno-lint-ignore no-explicit-any
      return { lembretes: (data ?? []).map((l: any) => ({ ...l, quando_br: horaBR(l.quando) })) }
    }
    case 'concluir_lembrete': {
      const { error, count } = await sb
        .from('lembretes')
        .update({ concluido: true }, { count: 'exact' })
        .eq('id', args.id)
      if (error) throw error
      return { ok: (count ?? 0) > 0 }
    }
    default:
      return { erro: `ferramenta desconhecida: ${nome}` }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY não configurada')

    // Cliente com o JWT do usuário: RLS ativa em toda ferramenta.
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )
    const { data: auth } = await sb.auth.getUser()
    if (!auth.user) {
      return Response.json({ erro: 'Não autenticado' }, { status: 401, headers: CORS })
    }
    const userId = auth.user.id

    const { mensagem, conversa_id } = await req.json()
    if (!mensagem || typeof mensagem !== 'string') {
      return Response.json({ erro: 'mensagem obrigatória' }, { status: 400, headers: CORS })
    }

    // Cada conversa é separada (estilo ChatGPT). Sem `conversa_id`, cria uma
    // nova e devolve o id pro front continuar nela. O título nasce da primeira
    // frase do usuário (cortada) — some do "Nova conversa" genérico.
    let convId: string = conversa_id
    if (!convId) {
      const titulo = mensagem.trim().slice(0, 48) + (mensagem.length > 48 ? '…' : '')
      const { data: nova, error } = await sb
        .from('ai_conversas').insert({ user_id: userId, titulo }).select('id').single()
      if (error) throw error
      convId = nova.id
    }

    // Contexto: nome do perfil + histórico DESTA conversa (memória curta)
    const [{ data: perfil }, { data: historico }] = await Promise.all([
      sb.from('profiles').select('nome').eq('id', userId).maybeSingle(),
      sb.from('ai_mensagens').select('papel, conteudo')
        .eq('conversa_id', convId).order('id', { ascending: false }).limit(16),
    ])

    const agora = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const sistema = `Você é a assistente pessoal do app Diamond Lembretes. Fala português brasileiro, é direta, calorosa e resolve.
Usuário: ${perfil?.nome || 'usuário'}. Agora: ${agora} (fuso America/Sao_Paulo, use-o em TODA data que criar — sufixo -03:00).
Você organiza TRÊS coisas: compromissos (agenda), notas e lembretes (viram notificação no celular). Use as ferramentas para criar/listar/concluir — nunca finja que criou.
Regras de data: "amanhã", "sexta", "dia 15" → resolva para a data concreta a partir de hoje; sem hora dita, pergunte OU use um horário óbvio dito no contexto. Compromisso = evento com hora; lembrete = alerta pra não esquecer; nota = texto guardado.
Ao FALAR horários de volta, use SEMPRE o campo \`quando_br\` que vem nas listagens (já está no fuso de Brasília). NUNCA leia a hora do campo ISO — ele está em UTC e você diria a hora errada.
Se pedirem resumo/relatório ("como está minha semana?"), liste compromissos e lembretes do período e responda em texto corrido, curto.
Respostas curtas (1 a 4 frases), sem markdown pesado; a resposta pode ser LIDA EM VOZ ALTA, então nada de listas com asteriscos — use frases naturais.`

    type MsgOpenAI = {
      role: string
      content: string | null
      tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>
      tool_call_id?: string
    }

    const conversa: MsgOpenAI[] = [
      { role: 'system', content: sistema },
      ...(historico ?? []).reverse().map((m) => ({
        role: m.papel === 'user' ? 'user' : 'assistant',
        content: m.conteudo,
      })),
      { role: 'user', content: mensagem },
    ]

    // Laço de ferramentas: teto de 6 rodadas segura loop infinito sem
    // atrapalhar fluxos reais (criar 3 coisas numa frase usa 1-2 rodadas).
    let resposta = ''
    for (let rodada = 0; rodada < 6; rodada++) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: MODELO,
          messages: conversa,
          tools: FERRAMENTAS.map((f) => ({ type: 'function', function: f })),
          temperature: 0.4,
        }),
      })
      if (!r.ok) {
        const corpo = await r.text()
        console.error('[ai-chat] OpenAI', r.status, corpo.slice(0, 300))
        throw new Error('A IA está indisponível agora — tente em instantes.')
      }
      const dados = await r.json()
      const escolha = dados.choices?.[0]?.message
      if (!escolha) throw new Error('Resposta vazia da IA.')

      if (escolha.tool_calls?.length) {
        conversa.push(escolha)
        for (const tc of escolha.tool_calls) {
          let saida: unknown
          try {
            saida = await executarFerramenta(sb, userId, tc.function.name, JSON.parse(tc.function.arguments || '{}'))
          } catch (e) {
            saida = { erro: (e as Error).message }
          }
          conversa.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(saida) })
        }
        continue
      }

      resposta = String(escolha.content ?? '').trim()
      break
    }
    if (!resposta) resposta = 'Feito! Algo mais?'

    // Persiste o par NESTA conversa — memória entre sessões e aparelhos.
    await sb.from('ai_mensagens').insert([
      { user_id: userId, conversa_id: convId, papel: 'user', conteudo: mensagem },
      { user_id: userId, conversa_id: convId, papel: 'assistant', conteudo: resposta },
    ])
    // Sobe a conversa pro topo da lista (recentes primeiro).
    await sb.from('ai_conversas').update({ atualizado_em: new Date().toISOString() }).eq('id', convId)

    return Response.json({ resposta, conversa_id: convId }, { headers: CORS })
  } catch (e) {
    console.error('[ai-chat]', e)
    return Response.json(
      { erro: (e as Error).message || 'Erro interno' },
      { status: 500, headers: CORS }
    )
  }
})
