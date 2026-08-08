import { useEffect, useState } from 'react'
import { Tag, Plus, Check, X, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Etiqueta } from '@/integrations/supabase/types'
import {
  CORES, corDe, listarEtiquetas, criarEtiqueta, renomearEtiqueta, apagarEtiqueta,
} from '@/lib/etiquetas'
import { msgErro } from '@/lib/dados'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

/**
 * Chip de etiqueta. Usado nos cards e dentro dos editores.
 * `onRemover` opcional: com ele o chip ganha o "x" (modo edição).
 */
export function ChipEtiqueta({
  etiqueta, onRemover, tamanho = 'md',
}: {
  etiqueta: Etiqueta
  onRemover?: () => void
  tamanho?: 'sm' | 'md'
}) {
  const cor = corDe(etiqueta.cor)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold ${cor.chip} ${
        tamanho === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      }`}
    >
      {etiqueta.nome}
      {onRemover && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemover() }}
          aria-label={`Remover etiqueta ${etiqueta.nome}`}
          className="opacity-60 hover:opacity-100 -mr-0.5"
        >
          <X size={tamanho === 'sm' ? 10 : 12} />
        </button>
      )}
    </span>
  )
}

/** Lista de chips só-leitura, pros cards. Nada renderiza se não houver etiqueta. */
export function EtiquetasDoItem({
  ids, todas, tamanho = 'sm', max,
}: {
  ids: string[] | null | undefined
  todas: Etiqueta[]
  tamanho?: 'sm' | 'md'
  max?: number
}) {
  const encontradas = (ids ?? [])
    .map((id) => todas.find((e) => e.id === id))
    .filter((e): e is Etiqueta => !!e)
  if (encontradas.length === 0) return null
  const mostrar = max ? encontradas.slice(0, max) : encontradas
  const resto = encontradas.length - mostrar.length
  return (
    <div className="flex flex-wrap items-center gap-1">
      {mostrar.map((e) => <ChipEtiqueta key={e.id} etiqueta={e} tamanho={tamanho} />)}
      {resto > 0 && <span className="text-[10px] font-bold text-slate-400">+{resto}</span>}
    </div>
  )
}

/**
 * Seletor: mostra as etiquetas escolhidas e abre um popover pra marcar,
 * criar (com cor), renomear e apagar.
 *
 * O popover é `w-[min(20rem,calc(100vw-2rem))]`: em telas estreitas ele
 * encolhe em vez de vazar pra fora e criar rolagem horizontal na página.
 */
export default function SeletorEtiquetas({
  selecionadas, onMudar, etiquetas, onRecarregar,
}: {
  selecionadas: string[]
  onMudar: (ids: string[]) => void
  etiquetas: Etiqueta[]
  onRecarregar: () => void
}) {
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(CORES[0].id)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)

  const alternar = (id: string) =>
    onMudar(selecionadas.includes(id) ? selecionadas.filter((x) => x !== id) : [...selecionadas, id])

  const criar = async () => {
    const n = nome.trim()
    if (!n) return
    setSalvando(true)
    try {
      const nova = await criarEtiqueta(n, cor)
      setNome('')
      onRecarregar()
      onMudar([...selecionadas, nova.id]) // criou aqui = já quer usar
    } catch (e) { toast.error(msgErro(e)) }
    finally { setSalvando(false) }
  }

  const remover = async (et: Etiqueta) => {
    if (!confirm(`Apagar a etiqueta "${et.nome}"? Ela sai de todos os itens que a usam.`)) return
    try {
      await apagarEtiqueta(et.id)
      onMudar(selecionadas.filter((x) => x !== et.id))
      onRecarregar()
    } catch (e) { toast.error(msgErro(e)) }
  }

  const escolhidas = selecionadas
    .map((id) => etiquetas.find((e) => e.id === id))
    .filter((e): e is Etiqueta => !!e)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {escolhidas.map((e) => (
        <ChipEtiqueta key={e.id} etiqueta={e} onRemover={() => alternar(e.id)} />
      ))}

      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2 py-1 text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-colors"
          >
            <Tag size={12} />
            {escolhidas.length === 0 ? 'Etiqueta' : ''}
            <Plus size={12} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[min(20rem,calc(100vw-2rem))] bg-white border-slate-200 text-navy-900 p-3 space-y-3"
        >
          {/* Criar */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nova etiqueta</p>
            <div className="flex gap-1.5">
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void criar() } }}
                placeholder="Nome"
                className="h-8 text-sm bg-slate-50 border-slate-200 rounded-lg"
              />
              <button
                onClick={criar}
                disabled={!nome.trim() || salvando}
                aria-label="Criar etiqueta"
                className="w-8 h-8 shrink-0 rounded-lg btn-gradient grid place-items-center disabled:opacity-40"
              >
                {salvando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CORES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCor(c.id)}
                  aria-label={`Cor ${c.nome}`}
                  className={`w-6 h-6 rounded-full ${c.bolinha} grid place-items-center ring-offset-1 transition-all ${
                    cor === c.id ? 'ring-2 ring-navy-900 scale-110' : 'hover:scale-110'
                  }`}
                >
                  {cor === c.id && <Check size={12} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Existentes */}
          {etiquetas.length > 0 && (
            <div className="space-y-1 border-t border-slate-100 pt-2 max-h-56 overflow-y-auto">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Suas etiquetas</p>
              {etiquetas.map((et) => {
                const marcada = selecionadas.includes(et.id)
                if (editando === et.id) {
                  return (
                    <EditorEtiqueta
                      key={et.id}
                      etiqueta={et}
                      onPronto={() => { setEditando(null); onRecarregar() }}
                    />
                  )
                }
                return (
                  <div key={et.id} className="group flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-50">
                    <button
                      onClick={() => alternar(et.id)}
                      className="flex flex-1 items-center gap-2 min-w-0 text-left"
                    >
                      <span className={`w-4 h-4 rounded grid place-items-center shrink-0 ${
                        marcada ? corDe(et.cor).bolinha : 'border border-slate-300'
                      }`}>
                        {marcada && <Check size={11} className="text-white" />}
                      </span>
                      <span className="truncate text-sm font-semibold">{et.nome}</span>
                    </button>
                    <button
                      onClick={() => setEditando(et.id)}
                      aria-label={`Editar ${et.nome}`}
                      className="text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => remover(et)}
                      aria-label={`Apagar ${et.nome}`}
                      className="text-slate-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

/** Renomear + trocar cor de uma etiqueta existente, no lugar. */
function EditorEtiqueta({ etiqueta, onPronto }: { etiqueta: Etiqueta; onPronto: () => void }) {
  const [nome, setNome] = useState(etiqueta.nome)
  const [cor, setCor] = useState(etiqueta.cor)
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    if (!nome.trim()) return
    setSalvando(true)
    try { await renomearEtiqueta(etiqueta.id, nome, cor); onPronto() }
    catch (e) { toast.error(msgErro(e)); setSalvando(false) }
  }

  return (
    <div className="rounded-lg bg-slate-50 p-2 space-y-2">
      <div className="flex gap-1.5">
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void salvar() } }}
          autoFocus
          className="h-7 text-sm bg-white border-slate-200 rounded-md"
        />
        <button
          onClick={salvar}
          disabled={salvando}
          aria-label="Salvar etiqueta"
          className="w-7 h-7 shrink-0 rounded-md btn-gradient grid place-items-center"
        >
          {salvando ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {CORES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCor(c.id)}
            aria-label={`Cor ${c.nome}`}
            className={`w-5 h-5 rounded-full ${c.bolinha} ${cor === c.id ? 'ring-2 ring-navy-900 ring-offset-1' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

/** Carrega as etiquetas uma vez e devolve com um recarregador. */
export function useEtiquetas(ativa: boolean) {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const carregar = () => { listarEtiquetas().then(setEtiquetas).catch(() => {}) }
  useEffect(() => { if (ativa) carregar() }, [ativa])
  return { etiquetas, recarregar: carregar }
}
