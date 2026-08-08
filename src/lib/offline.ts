/**
 * Offline-first: o app continua funcionando sem internet.
 *
 * Duas peças, e o mínimo possível de mágica:
 *
 *  1. **Cache de leitura** — toda listagem bem-sucedida é gravada no
 *     localStorage. Sem rede, a tela pinta com o último estado conhecido em
 *     vez de erro vermelho.
 *  2. **Fila de escrita** — criar/editar/apagar sem rede entra numa fila e é
 *     aplicado no cache na hora (a coisa APARECE na tela). Quando a conexão
 *     volta, a fila é enviada em ordem.
 *
 * Decisão que faz o resto funcionar: o **id é gerado no cliente** (uuid) já no
 * insert offline. Assim o item tem identidade estável — dá pra editar e até
 * apagar algo que ainda nem chegou no servidor, e quando a fila sobe o id é o
 * mesmo que a tela já mostra. Sem isso, cada edição offline viraria um item
 * duplicado depois da sincronização.
 *
 * localStorage e não IndexedDB de propósito: o volume aqui é de dezenas de
 * linhas por usuário (agenda pessoal), cabe folgado, é síncrono e não traz a
 * complexidade de migração de schema do IDB.
 */
import { supabase } from '@/integrations/supabase/client'

const PREFIXO_CACHE = 'aux.cache.'
const CHAVE_FILA = 'aux.fila'
const MAX_TENTATIVAS = 5

export type Tabela = 'compromissos' | 'notas' | 'lembretes'

export interface OpPendente {
  id: string                       // id da operação (não da linha)
  tabela: Tabela
  tipo: 'insert' | 'update' | 'delete'
  linhaId: string                  // id da linha alvo (uuid do cliente no insert)
  campos?: Record<string, unknown>
  criadoEm: number
  tentativas: number
}

/** UUID v4 — `crypto.randomUUID` existe em todo navegador que roda este app. */
export function novoId(): string {
  return crypto.randomUUID()
}

export function estaOnline(): boolean {
  return navigator.onLine
}

// ── Cache de leitura ──────────────────────────────────────────────────
export function cacheLer<T>(chave: string): T | null {
  try {
    const bruto = localStorage.getItem(PREFIXO_CACHE + chave)
    return bruto ? (JSON.parse(bruto) as T) : null
  } catch { return null }
}

export function cacheGravar(chave: string, dados: unknown): void {
  try {
    localStorage.setItem(PREFIXO_CACHE + chave, JSON.stringify(dados))
  } catch { /* cota cheia: cache é conveniência, não pode derrubar o app */ }
}

/** Limpa tudo — usado no logout, pra não vazar dado entre contas no aparelho. */
export function cacheLimpar(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIXO_CACHE) || k === CHAVE_FILA)
      .forEach((k) => localStorage.removeItem(k))
  } catch { /* nada a fazer */ }
}

// ── Fila de escrita ───────────────────────────────────────────────────
export function filaLer(): OpPendente[] {
  try {
    const bruto = localStorage.getItem(CHAVE_FILA)
    return bruto ? (JSON.parse(bruto) as OpPendente[]) : []
  } catch { return [] }
}

function filaGravar(ops: OpPendente[]): void {
  try { localStorage.setItem(CHAVE_FILA, JSON.stringify(ops)) } catch { /* idem */ }
  avisar()
}

export function filaTamanho(): number {
  return filaLer().length
}

export function filaEnfileirar(op: Omit<OpPendente, 'id' | 'criadoEm' | 'tentativas'>): void {
  const ops = filaLer()
  // Um insert ainda não enviado + uma edição do mesmo item = um insert só, já
  // com os campos novos. Evita mandar duas operações e "piscar" o valor velho.
  if (op.tipo === 'update') {
    const insertPendente = ops.find((o) => o.linhaId === op.linhaId && o.tipo === 'insert')
    if (insertPendente) {
      insertPendente.campos = { ...insertPendente.campos, ...op.campos }
      return filaGravar(ops)
    }
  }
  // Apagar algo que nunca subiu: some da fila e pronto, nada vai pro servidor.
  if (op.tipo === 'delete') {
    const nunicaSubiu = ops.some((o) => o.linhaId === op.linhaId && o.tipo === 'insert')
    const semEsseItem = ops.filter((o) => o.linhaId !== op.linhaId)
    if (nunicaSubiu) return filaGravar(semEsseItem)
    return filaGravar([...semEsseItem, { ...op, id: novoId(), criadoEm: Date.now(), tentativas: 0 }])
  }
  filaGravar([...ops, { ...op, id: novoId(), criadoEm: Date.now(), tentativas: 0 }])
}

// Quem quiser mostrar "N pendentes" se inscreve aqui.
const ouvintes = new Set<() => void>()
function avisar() { ouvintes.forEach((f) => f()) }
export function aoMudarFila(f: () => void): () => void {
  ouvintes.add(f)
  return () => ouvintes.delete(f)
}

let sincronizando = false

/**
 * Sobe a fila, em ordem. Erro de REDE para o loop (tenta de novo depois);
 * erro do SERVIDOR (linha rejeitada) conta tentativa e, no limite, descarta —
 * uma operação inválida não pode travar a fila inteira pra sempre.
 */
export async function sincronizar(): Promise<{ enviadas: number; restantes: number }> {
  if (sincronizando || !estaOnline()) return { enviadas: 0, restantes: filaTamanho() }
  sincronizando = true
  let enviadas = 0
  try {
    for (;;) {
      const ops = filaLer()
      if (ops.length === 0) break
      const op = ops[0]
      try {
        await aplicarNoServidor(op)
        filaGravar(ops.slice(1))
        enviadas++
      } catch (e) {
        if (ehErroDeRede(e)) break // sem internet de novo: mantém a fila intacta
        op.tentativas++
        if (op.tentativas >= MAX_TENTATIVAS) {
          console.error('[offline] descartando operação inválida', op, e)
          filaGravar(ops.slice(1))
        } else {
          filaGravar([...ops.slice(1), op]) // manda pro fim e segue
        }
      }
    }
  } finally {
    sincronizando = false
  }
  return { enviadas, restantes: filaTamanho() }
}

async function aplicarNoServidor(op: OpPendente): Promise<void> {
  if (op.tipo === 'delete') {
    const { error } = await supabase.from(op.tabela).delete().eq('id', op.linhaId)
    if (error) throw error
    return
  }
  if (op.tipo === 'update') {
    const { error } = await supabase.from(op.tabela).update(op.campos!).eq('id', op.linhaId)
    if (error) throw error
    return
  }
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw Object.assign(new Error('sem sessão'), { rede: true })
  // upsert e não insert: se a operação subiu e a resposta se perdeu no meio do
  // caminho, a repetição não estoura conflito de chave — o id é o mesmo.
  const { error } = await supabase
    .from(op.tabela)
    .upsert({ ...op.campos, id: op.linhaId, user_id: data.user.id })
  if (error) throw error
}

/** `fetch` que morreu = rede. Erro do PostgREST tem `code` e veio do servidor. */
export function ehErroDeRede(e: unknown): boolean {
  if (!estaOnline()) return true
  const err = e as { rede?: boolean; message?: string; code?: string }
  if (err?.rede) return true
  if (err?.code) return false
  return /fetch|network|failed to fetch|load failed/i.test(err?.message ?? '')
}

/** Liga a sincronização automática: ao voltar a rede e ao abrir o app. */
export function iniciarSincronizacaoAutomatica(): void {
  const tentar = () => { void sincronizar() }
  window.addEventListener('online', tentar)
  // Voltar pro app depois de um tempo com a tela apagada também é hora de subir.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tentar() })
  tentar()
}
