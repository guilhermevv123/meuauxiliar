import { supabase } from '@/integrations/supabase/client'
import type { Compromisso, Nota, Lembrete } from '@/integrations/supabase/types'
import {
  cacheLer, cacheGravar, ehErroDeRede, estaOnline, filaEnfileirar, novoId, sincronizar,
  type Tabela,
} from '@/lib/offline'

/**
 * Camada única de dados. Toda tela e a própria IA (no servidor) falam com as
 * MESMAS tabelas — o que a assistente cria aparece na agenda na hora, porque
 * não existe caminho paralelo.
 *
 * `user_id` vai explícito em todo insert: a RLS exige (WITH CHECK) e o
 * supabase-js não preenche sozinho.
 *
 * OFFLINE-FIRST (ver `lib/offline.ts`): toda leitura guarda uma cópia local e
 * cai nela quando falta rede; toda escrita que não consegue subir vira item de
 * fila e é aplicada no cache na hora, então a tela nunca "perde" o que a
 * pessoa acabou de fazer. A fila sobe sozinha quando a conexão volta.
 */

async function usuarioAtual(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Sessão expirada — entre de novo.')
  return data.user.id
}

// ── Cache local das listas ───────────────────────────────────────────
/** Mescla linhas no cache da tabela por id (upsert local). */
function cacheMesclar<T extends { id: string }>(tabela: Tabela, linhas: T[]): T[] {
  const atual = cacheLer<T[]>(tabela) ?? []
  const porId = new Map(atual.map((l) => [l.id, l]))
  linhas.forEach((l) => porId.set(l.id, { ...porId.get(l.id), ...l }))
  const todas = [...porId.values()]
  cacheGravar(tabela, todas)
  return todas
}

function cacheAplicarEscrita(
  tabela: Tabela,
  tipo: 'insert' | 'update' | 'delete',
  linhaId: string,
  campos?: Record<string, unknown>
): void {
  const atual = cacheLer<Array<Record<string, unknown> & { id: string }>>(tabela) ?? []
  if (tipo === 'delete') {
    cacheGravar(tabela, atual.filter((l) => l.id !== linhaId))
    return
  }
  const i = atual.findIndex((l) => l.id === linhaId)
  if (i >= 0) atual[i] = { ...atual[i], ...campos, id: linhaId }
  else atual.push({ ...campos, id: linhaId } as Record<string, unknown> & { id: string })
  cacheGravar(tabela, atual)
}

/**
 * Escreve tentando a rede e caindo na fila quando ela falta.
 * Devolve o id da linha (gerado aqui quando é criação — ver offline.ts).
 */
async function escrever(
  tabela: Tabela,
  tipo: 'insert' | 'update' | 'delete',
  linhaId: string,
  campos: Record<string, unknown> | undefined,
  naRede: () => Promise<void>
): Promise<string> {
  // Cache primeiro: online ou offline, a tela seguinte já mostra o resultado.
  cacheAplicarEscrita(tabela, tipo, linhaId, campos)
  if (!estaOnline()) {
    filaEnfileirar({ tabela, tipo, linhaId, campos })
    return linhaId
  }
  try {
    await naRede()
  } catch (e) {
    if (!ehErroDeRede(e)) throw e // erro real do servidor: quem chamou precisa saber
    filaEnfileirar({ tabela, tipo, linhaId, campos })
  }
  return linhaId
}

/** Lê da rede, guarda no cache; sem rede, devolve o cache (filtrado por `filtro`). */
async function ler<T extends { id: string }>(
  tabela: Tabela,
  daRede: () => Promise<T[]>,
  filtro?: (linha: T) => boolean,
  ordenar?: (a: T, b: T) => number
): Promise<T[]> {
  try {
    if (!estaOnline()) throw Object.assign(new Error('offline'), { rede: true })
    const linhas = await daRede()
    cacheMesclar(tabela, linhas)
    return linhas
  } catch (e) {
    if (!ehErroDeRede(e)) throw e
    const doCache = (cacheLer<T[]>(tabela) ?? []).filter(filtro ?? (() => true))
    return ordenar ? [...doCache].sort(ordenar) : doCache
  }
}

// ── Compromissos ─────────────────────────────────────────────────────
export async function listarCompromissos(deISO: string, ateISO: string): Promise<Compromisso[]> {
  return ler<Compromisso>(
    'compromissos',
    async () => {
      const { data, error } = await supabase
        .from('compromissos').select('*')
        .gte('inicio', deISO).lt('inicio', ateISO)
        .order('inicio')
      if (error) throw error
      return data ?? []
    },
    (c) => c.inicio >= deISO && c.inicio < ateISO,
    (a, b) => a.inicio.localeCompare(b.inicio)
  )
}

export async function salvarCompromisso(
  c: Partial<Compromisso> & { titulo: string; inicio: string }
): Promise<void> {
  if (c.id) {
    const { id, ...campos } = c
    await escrever('compromissos', 'update', id, campos, async () => {
      const { error } = await supabase.from('compromissos').update(campos).eq('id', id)
      if (error) throw error
    })
    return
  }
  const id = novoId()
  const campos = { ...c, id, criado_em: new Date().toISOString() }
  await escrever('compromissos', 'insert', id, campos, async () => {
    const { error } = await supabase
      .from('compromissos').insert({ ...campos, user_id: await usuarioAtual() })
    if (error) throw error
  })
}

export async function apagarCompromisso(id: string): Promise<void> {
  await escrever('compromissos', 'delete', id, undefined, async () => {
    const { error } = await supabase.from('compromissos').delete().eq('id', id)
    if (error) throw error
  })
}

// ── Notas ────────────────────────────────────────────────────────────
export async function listarNotas(): Promise<Nota[]> {
  return ler<Nota>(
    'notas',
    async () => {
      const { data, error } = await supabase
        .from('notas').select('*')
        .order('fixada', { ascending: false })
        .order('atualizado_em', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    undefined,
    (a, b) =>
      Number(b.fixada) - Number(a.fixada) ||
      (b.atualizado_em ?? '').localeCompare(a.atualizado_em ?? '')
  )
}

export async function salvarNota(n: Partial<Nota>): Promise<void> {
  const agora = new Date().toISOString()
  if (n.id) {
    const { id, ...resto } = n
    const campos = { ...resto, atualizado_em: agora }
    await escrever('notas', 'update', id, campos, async () => {
      const { error } = await supabase.from('notas').update(resto).eq('id', id)
      if (error) throw error
    })
    return
  }
  const id = novoId()
  const campos = { ...n, id, criado_em: agora, atualizado_em: agora, topicos: n.topicos ?? [] }
  await escrever('notas', 'insert', id, campos, async () => {
    const { error } = await supabase.from('notas').insert({ ...campos, user_id: await usuarioAtual() })
    if (error) throw error
  })
}

export async function apagarNota(id: string): Promise<void> {
  await escrever('notas', 'delete', id, undefined, async () => {
    const { error } = await supabase.from('notas').delete().eq('id', id)
    if (error) throw error
  })
}

// ── Lembretes ────────────────────────────────────────────────────────
export async function listarLembretes(): Promise<Lembrete[]> {
  return ler<Lembrete>(
    'lembretes',
    async () => {
      const { data, error } = await supabase
        .from('lembretes').select('*').order('concluido').order('quando')
      if (error) throw error
      return data ?? []
    },
    undefined,
    (a, b) => Number(a.concluido) - Number(b.concluido) || a.quando.localeCompare(b.quando)
  )
}

export async function salvarLembrete(
  l: Partial<Lembrete> & { titulo: string; quando: string }
): Promise<void> {
  if (l.id) {
    const { id, ...campos } = l
    await escrever('lembretes', 'update', id, campos, async () => {
      const { error } = await supabase.from('lembretes').update(campos).eq('id', id)
      if (error) throw error
    })
    return
  }
  const id = novoId()
  const campos = { ...l, id, criado_em: new Date().toISOString(), concluido: false }
  await escrever('lembretes', 'insert', id, campos, async () => {
    const { error } = await supabase
      .from('lembretes').insert({ ...campos, user_id: await usuarioAtual() })
    if (error) throw error
  })
}

export async function alternarLembrete(id: string, concluido: boolean): Promise<void> {
  await escrever('lembretes', 'update', id, { concluido }, async () => {
    const { error } = await supabase.from('lembretes').update({ concluido }).eq('id', id)
    if (error) throw error
  })
}

export async function apagarLembrete(id: string): Promise<void> {
  await escrever('lembretes', 'delete', id, undefined, async () => {
    const { error } = await supabase.from('lembretes').delete().eq('id', id)
    if (error) throw error
  })
}

// ── Resumo do dashboard (aba Início) ─────────────────────────────────
export interface ResumoInicio {
  hoje: Compromisso[]
  amanha: Compromisso[]
  lembretesPendentes: Lembrete[]
  concluidosHoje: number
  totalNotas: number
}

/**
 * Uma foto do dia para a tela inicial. Monta em cima das listagens (que já são
 * offline-first), então o dashboard abre igual sem internet.
 */
export async function resumoInicio(): Promise<ResumoInicio> {
  const inicioHoje = new Date(); inicioHoje.setHours(0, 0, 0, 0)
  const inicioAmanha = new Date(inicioHoje); inicioAmanha.setDate(inicioAmanha.getDate() + 1)
  const fimAmanha = new Date(inicioAmanha); fimAmanha.setDate(fimAmanha.getDate() + 1)

  // A fila sobe antes de ler: o que foi feito offline já volta refletido.
  if (estaOnline()) void sincronizar()

  const [comps, lembretes, notas] = await Promise.all([
    listarCompromissos(inicioHoje.toISOString(), fimAmanha.toISOString()),
    listarLembretes(),
    listarNotas(),
  ])

  const entre = (iso: string, ini: Date, fim: Date) => {
    const t = new Date(iso)
    return t >= ini && t < fim
  }

  return {
    hoje: comps.filter((c) => entre(c.inicio, inicioHoje, inicioAmanha)),
    amanha: comps.filter((c) => entre(c.inicio, inicioAmanha, fimAmanha)),
    lembretesPendentes: lembretes.filter((l) => !l.concluido).slice(0, 20),
    // "concluído hoje" = lembrete concluído cujo horário caiu hoje (proxy simples
    // e honesto sem uma coluna de auditoria dedicada).
    concluidosHoje: lembretes.filter(
      (l) => l.concluido && entre(l.quando, inicioHoje, inicioAmanha)
    ).length,
    totalNotas: notas.length,
  }
}

/** Mensagem de erro apresentável (Supabase fala inglês; o app, português). */
export function msgErro(e: unknown): string {
  const m = (e as { message?: string })?.message || ''
  if (m.includes('JWT') || m.includes('expirada')) return 'Sessão expirada — entre de novo.'
  if (m.includes('Failed to fetch')) return 'Sem conexão. Verifique a internet.'
  return m || 'Algo deu errado. Tente de novo.'
}
