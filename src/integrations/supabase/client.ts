import { createClient } from '@supabase/supabase-js'

/**
 * A URL e a chave `anon` ficam NO CÓDIGO de propósito: a anon é pública por
 * desenho (vai para todo navegador que abrir o site) e quem protege os dados
 * é a RLS no banco — cada linha tem dono e a política só devolve as do
 * usuário logado. O que NUNCA pode aparecer aqui é a service_role ou a chave
 * da OpenAI; essas moram nas Edge Functions, do lado do servidor.
 *
 * Hardcode também elimina a dependência de secrets no build do GitHub Pages
 * (o workflow antigo injetava até a chave da OpenAI no bundle — corrigido).
 */
const SUPABASE_URL = 'https://zxaiearxsuulhkfyybke.supabase.co'
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YWllYXJ4c3V1bGhrZnl5YmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMDMxNTQsImV4cCI6MjEwMTc3OTE1NH0.CGuTksoOASF4sJc6s8bz_sXFndXThuZBRwibchcONp4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})

/** Base das Edge Functions (IA, voz, push). */
export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
