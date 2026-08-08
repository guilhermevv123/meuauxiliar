import { supabase } from '@/integrations/supabase/client'

/** Uma conversa da assistente (estilo ChatGPT: histórico separado). */
export interface Conversa {
  id: string
  titulo: string
  atualizado_em: string
}

export interface MsgChat {
  papel: 'user' | 'assistant'
  conteudo: string
}

/** Lista as conversas, mais recentes primeiro. */
export async function listarConversas(): Promise<Conversa[]> {
  const { data, error } = await supabase
    .from('ai_conversas')
    .select('id, titulo, atualizado_em')
    .order('atualizado_em', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Mensagens de uma conversa, em ordem. */
export async function mensagensDaConversa(conversaId: string): Promise<MsgChat[]> {
  const { data, error } = await supabase
    .from('ai_mensagens')
    .select('papel, conteudo')
    .eq('conversa_id', conversaId)
    .order('id', { ascending: true })
  if (error) throw error
  return (data ?? []) as MsgChat[]
}

/** Apaga uma conversa (as mensagens caem por ON DELETE CASCADE). */
export async function apagarConversa(conversaId: string): Promise<void> {
  const { error } = await supabase.from('ai_conversas').delete().eq('id', conversaId)
  if (error) throw error
}

/** Limpa TODAS as conversas do usuário (o "resetar tudo"). */
export async function limparConversas(): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sessão expirada — entre de novo.')
  const { error } = await supabase.from('ai_conversas').delete().eq('user_id', auth.user.id)
  if (error) throw error
}
