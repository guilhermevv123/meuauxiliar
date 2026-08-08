import { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Pin, PinOff, Trash2, Loader2, StickyNote, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { Nota } from '@/integrations/supabase/types'
import { listarNotas, salvarNota, apagarNota, msgErro } from '@/lib/dados'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

interface Rascunho { id?: string; titulo: string; conteudo: string; fixada: boolean }

export default function AbaNotas({ ativa }: { ativa: boolean }) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try { setNotas(await listarNotas()) }
    catch (e) { toast.error(msgErro(e)) }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { if (ativa) void carregar() }, [ativa, carregar])

  const filtradas = busca.trim()
    ? notas.filter((n) =>
        (n.titulo + ' ' + n.conteudo).toLowerCase().includes(busca.trim().toLowerCase()))
    : notas

  const salvar = async () => {
    if (!rascunho) return
    if (!rascunho.titulo.trim() && !rascunho.conteudo.trim()) { setRascunho(null); return }
    setSalvando(true)
    try {
      await salvarNota({
        id: rascunho.id,
        titulo: rascunho.titulo.trim(),
        conteudo: rascunho.conteudo,
        fixada: rascunho.fixada,
      })
      setRascunho(null)
      void carregar()
    } catch (e) { toast.error(msgErro(e)) }
    finally { setSalvando(false) }
  }

  const alternarFixada = async (n: Nota) => {
    try { await salvarNota({ id: n.id, fixada: !n.fixada }); void carregar() }
    catch (e) { toast.error(msgErro(e)) }
  }

  const apagar = async (id: string) => {
    if (!confirm('Apagar esta nota?')) return
    try { await apagarNota(id); setRascunho(null); void carregar(); toast.success('Nota apagada.') }
    catch (e) { toast.error(msgErro(e)) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nas notas…"
            className="pl-9 bg-navy-900 border-navy-700 rounded-xl"
          />
        </div>
        <Button
          onClick={() => setRascunho({ titulo: '', conteudo: '', fixada: false })}
          className="rounded-xl bg-primary text-navy-950 font-black hover:bg-primary/90 shrink-0"
        >
          <Plus size={16} /> Nova
        </Button>
      </div>

      {carregando ? (
        <div className="py-14 grid place-items-center text-slate-500"><Loader2 className="animate-spin" /></div>
      ) : filtradas.length === 0 ? (
        <div className="py-14 text-center rounded-2xl border border-dashed border-navy-700">
          <StickyNote className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 font-medium">
            {busca ? 'Nenhuma nota bate com a busca.' : 'Nenhuma nota ainda.'}
          </p>
          {!busca && <p className="text-xs text-slate-600 mt-1">Anote qualquer coisa — ou dite pra assistente.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtradas.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => setRascunho({ id: n.id, titulo: n.titulo, conteudo: n.conteudo, fixada: n.fixada })}
              onKeyDown={(e) => e.key === 'Enter' && setRascunho({ id: n.id, titulo: n.titulo, conteudo: n.conteudo, fixada: n.fixada })}
              className="group rounded-2xl bg-navy-900/70 border border-navy-800 p-4 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-white truncate">{n.titulo || 'Sem título'}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); void alternarFixada(n) }}
                  aria-label={n.fixada ? 'Desafixar' : 'Fixar'}
                  className={`p-1 rounded-lg shrink-0 ${
                    n.fixada ? 'text-primary' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-primary'
                  } transition-opacity`}
                >
                  {n.fixada ? <Pin size={15} /> : <PinOff size={15} />}
                </button>
              </div>
              {n.conteudo && (
                <p className="text-sm text-slate-400 mt-1 line-clamp-4 whitespace-pre-wrap">{n.conteudo}</p>
              )}
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600 mt-2.5">
                {format(parseISO(n.atualizado_em), "d MMM · HH:mm", { locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!rascunho} onOpenChange={(aberto) => { if (!aberto) void salvar() }}>
        <DialogContent className="bg-navy-900 border-navy-700 text-white rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">Nota</DialogTitle>
            {/* Fechar = salvar (estilo Keep): nota não tem "cancelar", tem rascunho que persiste. */}
          </DialogHeader>
          {rascunho && (
            <div className="space-y-2">
              {/* Título e corpo eram os dois `bg-transparent border-0`, sem
                  divisa: quem clicava no meio caía no título e o texto do corpo
                  ia parar colado no título. Uma linha separadora embaixo do
                  título deixa os dois alvos inequívocos, no mouse e no toque. */}
              <Input
                value={rascunho.titulo}
                onChange={(e) => setRascunho({ ...rascunho, titulo: e.target.value })}
                placeholder="Título"
                className="bg-transparent border-0 border-b border-navy-700 rounded-none text-lg font-black px-0 pb-2 focus-visible:ring-0 focus-visible:border-primary placeholder:text-slate-600"
              />
              <Textarea
                value={rascunho.conteudo}
                onChange={(e) => setRascunho({ ...rascunho, conteudo: e.target.value })}
                placeholder="Escreva aqui…"
                rows={10}
                autoFocus={!rascunho.id}
                className="bg-transparent border-0 px-0 min-h-[220px] focus-visible:ring-0 resize-none text-slate-200 placeholder:text-slate-600"
              />
            </div>
          )}
          <DialogFooter className="flex-row items-center gap-2">
            {rascunho?.id && (
              <Button
                variant="ghost"
                onClick={() => rascunho.id && apagar(rascunho.id)}
                className="text-danger hover:text-danger mr-auto"
              >
                <Trash2 size={16} />
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setRascunho(rascunho ? { ...rascunho, fixada: !rascunho.fixada } : null)}
              className={rascunho?.fixada ? 'text-primary' : 'text-slate-400'}
            >
              <Pin size={16} className="mr-1" /> {rascunho?.fixada ? 'Fixada' : 'Fixar'}
            </Button>
            <Button onClick={salvar} disabled={salvando} className="bg-primary text-navy-950 font-black rounded-xl">
              {salvando ? <Loader2 className="animate-spin" size={16} /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
