import { supabase } from '@/integrations/supabase/client'
import type { Compromisso, Nota, Lembrete } from '@/integrations/supabase/types'

/**
 * Camada única de dados. Toda tela e a própria IA (no servidor) falam com as
 * MESMAS tabelas — o que a assistente cria aparece na agenda na hora, porque
 * não existe caminho paralelo.
 *
 * `user_id` vai explícito em todo insert: a RLS exige (WITH CHECK) e o
 * supabase-js não preenche sozinho.
 */

async function usuarioAtual(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Sessão expirada — entre de novo.')
  return data.user.id
}

// ── Compromissos ─────────────────────────────────────────────────────
export async function listarCompromissos(deISO: string, ateISO: string): Promise<Compromisso[]> {
  const { data, error } = await supabase
    .from('compromissos')
    .select('*')
    .gte('inicio', deISO)
    .lt('inicio', ateISO)
    .order('inicio')
  if (error) throw error
  return data ?? []
}

export async function salvarCompromisso(
  c: Partial<Compromisso> & { titulo: string; inicio: string }
): Promise<void> {
  if (c.id) {
    const { id, ...campos } = c
    const { error } = await supabase.from('compromissos').update(campos).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('compromissos')
      .insert({ ...c, user_id: await usuarioAtual() })
    if (error) throw error
  }
}

export async function apagarCompromisso(id: string): Promise<void> {
  const { error } = await supabase.from('compromissos').delete().eq('id', id)
  if (error) throw error
}

// ── Notas ────────────────────────────────────────────────────────────
export async function listarNotas(): Promise<Nota[]> {
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .order('fixada', { ascending: false })
    .order('atualizado_em', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function salvarNota(n: Partial<Nota>): Promise<void> {
  if (n.id) {
    const { id, ...campos } = n
    const { error } = await supabase.from('notas').update(campos).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('notas').insert({ ...n, user_id: await usuarioAtual() })
    if (error) throw error
  }
}

export async function apagarNota(id: string): Promise<void> {
  const { error } = await supabase.from('notas').delete().eq('id', id)
  if (error) throw error
}

// ── Lembretes ────────────────────────────────────────────────────────
export async function listarLembretes(): Promise<Lembrete[]> {
  const { data, error } = await supabase
    .from('lembretes')
    .select('*')
    .order('concluido')
    .order('quando')
  if (error) throw error
  return data ?? []
}

export async function salvarLembrete(
  l: Partial<Lembrete> & { titulo: string; quando: string }
): Promise<void> {
  if (l.id) {
    const { id, ...campos } = l
    const { error } = await supabase.from('lembretes').update(campos).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('lembretes')
      .insert({ ...l, user_id: await usuarioAtual() })
    if (error) throw error
  }
}

export async function alternarLembrete(id: string, concluido: boolean): Promise<void> {
  const { error } = await supabase.from('lembretes').update({ concluido }).eq('id', id)
  if (error) throw error
}

export async function apagarLembrete(id: string): Promise<void> {
  const { error } = await supabase.from('lembretes').delete().eq('id', id)
  if (error) throw error
}

/** Mensagem de erro apresentável (Supabase fala inglês; o app, português). */
export function msgErro(e: unknown): string {
  const m = (e as { message?: string })?.message || ''
  if (m.includes('JWT') || m.includes('expirada')) return 'Sessão expirada — entre de novo.'
  if (m.includes('Failed to fetch')) return 'Sem conexão. Verifique a internet.'
  return m || 'Algo deu errado. Tente de novo.'
}
