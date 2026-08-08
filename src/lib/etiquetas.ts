import { supabase } from '@/integrations/supabase/client'
import type { Etiqueta } from '@/integrations/supabase/types'

/**
 * Etiquetas coloridas, compartilhadas por notas, lembretes e compromissos.
 *
 * A cor é guardada como NOME ('azul'), não como hex. Assim o app pode trocar
 * a paleta inteira — clarear no tema claro, escurecer no escuro — sem migrar
 * dado nenhum. Um `#3B82F6` gravado no banco engessaria o visual pra sempre.
 */

export interface CorEtiqueta {
  id: string
  nome: string
  /** Classes Tailwind do chip: fundo, texto e borda em harmonia. */
  chip: string
  /** Bolinha sólida, pro seletor de cor e pontinhos nos cards. */
  bolinha: string
}

export const CORES: CorEtiqueta[] = [
  { id: 'azul',    nome: 'Azul',    chip: 'bg-sky-100 text-sky-700 border-sky-200',           bolinha: 'bg-sky-500' },
  { id: 'roxo',    nome: 'Roxo',    chip: 'bg-violet-100 text-violet-700 border-violet-200',  bolinha: 'bg-violet-500' },
  { id: 'verde',   nome: 'Verde',   chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', bolinha: 'bg-emerald-500' },
  { id: 'amarelo', nome: 'Amarelo', chip: 'bg-amber-100 text-amber-700 border-amber-200',     bolinha: 'bg-amber-500' },
  { id: 'laranja', nome: 'Laranja', chip: 'bg-orange-100 text-orange-700 border-orange-200',  bolinha: 'bg-orange-500' },
  { id: 'vermelho',nome: 'Vermelho',chip: 'bg-rose-100 text-rose-700 border-rose-200',        bolinha: 'bg-rose-500' },
  { id: 'rosa',    nome: 'Rosa',    chip: 'bg-pink-100 text-pink-700 border-pink-200',        bolinha: 'bg-pink-500' },
  { id: 'cinza',   nome: 'Cinza',   chip: 'bg-slate-100 text-slate-600 border-slate-200',     bolinha: 'bg-slate-400' },
]

/** Cor desconhecida (etiqueta antiga, dado corrompido) cai no cinza. */
export function corDe(id: string | undefined): CorEtiqueta {
  return CORES.find((c) => c.id === id) ?? CORES[CORES.length - 1]
}

export async function listarEtiquetas(): Promise<Etiqueta[]> {
  const { data, error } = await supabase.from('etiquetas').select('*').order('nome')
  if (error) throw error
  return data ?? []
}

export async function criarEtiqueta(nome: string, cor: string): Promise<Etiqueta> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sessão expirada — entre de novo.')
  const { data, error } = await supabase
    .from('etiquetas')
    .insert({ nome: nome.trim(), cor, user_id: auth.user.id })
    .select()
    .single()
  if (error) {
    // 23505 = índice único (user_id, lower(nome)): já existe uma com esse nome.
    if ((error as { code?: string }).code === '23505') {
      throw new Error(`Você já tem uma etiqueta "${nome.trim()}".`)
    }
    throw error
  }
  return data
}

export async function renomearEtiqueta(id: string, nome: string, cor: string): Promise<void> {
  const { error } = await supabase
    .from('etiquetas').update({ nome: nome.trim(), cor }).eq('id', id)
  if (error) throw error
}

/**
 * Apaga a etiqueta E tira a referência dela de tudo que a usava.
 *
 * `etiqueta_ids` é array, não chave estrangeira — o banco não limpa sozinho.
 * Sem esta faxina sobrariam ids órfãos e os cards mostrariam chips fantasma.
 */
export async function apagarEtiqueta(id: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sessão expirada — entre de novo.')

  for (const tabela of ['notas', 'lembretes', 'compromissos'] as const) {
    const { data: linhas } = await supabase
      .from(tabela).select('id, etiqueta_ids').contains('etiqueta_ids', [id])
    for (const l of linhas ?? []) {
      await supabase
        .from(tabela)
        .update({ etiqueta_ids: (l.etiqueta_ids as string[]).filter((e) => e !== id) })
        .eq('id', l.id)
    }
  }
  const { error } = await supabase.from('etiquetas').delete().eq('id', id)
  if (error) throw error
}
