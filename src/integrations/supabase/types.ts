/**
 * Tipos do banco — escritos à mão a partir da migration
 * `supabase/migrations/20260808_schema_auxiliar.sql` (fonte da verdade).
 */

export interface Compromisso {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  local: string | null
  inicio: string
  fim: string | null
  dia_inteiro: boolean
  cor: string
  criado_em: string
  atualizado_em: string
  etiqueta_ids: string[]
  avisos: number[]
  avisos_enviados: number[]
}

export interface Nota {
  id: string
  user_id: string
  titulo: string
  conteudo: string
  topicos: string[]
  foto_url: string | null
  fixada: boolean
  cor: string
  etiqueta_ids: string[]
  criado_em: string
  atualizado_em: string
}

export interface Lembrete {
  id: string
  user_id: string
  titulo: string
  quando: string
  repetir: 'nunca' | 'diario' | 'semanal' | 'mensal'
  concluido: boolean
  notificado_em: string | null
  foto_url: string | null
  nota_id: string | null
  etiqueta_ids: string[]
  /** Minutos ANTES de `quando` em que avisar. 0 = na hora, 1440 = 1 dia. */
  avisos: number[]
  avisos_enviados: number[]
  criado_em: string
}

/** Etiqueta colorida, compartilhada por notas, lembretes e compromissos. */
export interface Etiqueta {
  id: string
  user_id: string
  nome: string
  cor: string
  criado_em: string
}

export interface Perfil {
  id: string
  nome: string | null
  criado_em: string
}

export interface AiMensagem {
  id: number
  user_id: string
  papel: 'user' | 'assistant'
  conteudo: string
  criado_em: string
}
