import { useCallback, useEffect, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus, Pin, PinOff, Trash2, Loader2, StickyNote, Search, ImagePlus, X, ListPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Nota } from '@/integrations/supabase/types'
import { listarNotas, salvarNota, apagarNota, msgErro } from '@/lib/dados'
import { subirFoto, urlDaFoto, apagarFoto } from '@/lib/fotos'
import DiamondLoader from '@/components/DiamondLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface Rascunho {
  id?: string
  titulo: string
  conteudo: string
  topicos: string[]
  foto_url: string | null
  fixada: boolean
}

/** Miniatura de foto de nota — resolve a URL assinada e cacheia. */
function FotoNota({ caminho, className }: { caminho: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => { urlDaFoto(caminho).then(setUrl) }, [caminho])
  if (!url) return <div className={`bg-slate-100 animate-pulse ${className}`} />
  return <img src={url} alt="" className={className} loading="lazy" />
}

export default function AbaNotas({ ativa }: { ativa: boolean }) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [subindoFoto, setSubindoFoto] = useState(false)
  const [novoTopico, setNovoTopico] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try { setNotas(await listarNotas()) }
    catch (e) { toast.error(msgErro(e)) }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { if (ativa) void carregar() }, [ativa, carregar])

  const filtradas = busca.trim()
    ? notas.filter((n) =>
        (n.titulo + ' ' + n.conteudo + ' ' + (n.topicos || []).join(' '))
          .toLowerCase().includes(busca.trim().toLowerCase()))
    : notas

  const abrirNovo = () =>
    setRascunho({ titulo: '', conteudo: '', topicos: [], foto_url: null, fixada: false })

  const abrirEdicao = (n: Nota) =>
    setRascunho({
      id: n.id, titulo: n.titulo, conteudo: n.conteudo,
      topicos: n.topicos || [], foto_url: n.foto_url, fixada: n.fixada,
    })

  const vazia = (r: Rascunho) =>
    !r.titulo.trim() && !r.conteudo.trim() && r.topicos.length === 0 && !r.foto_url

  const salvar = async () => {
    if (!rascunho) return
    if (vazia(rascunho)) { setRascunho(null); return }
    setSalvando(true)
    try {
      await salvarNota({
        id: rascunho.id,
        titulo: rascunho.titulo.trim(),
        conteudo: rascunho.conteudo,
        topicos: rascunho.topicos,
        foto_url: rascunho.foto_url,
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

  const apagar = async (n: Nota | Rascunho) => {
    if (!n.id) return
    if (!confirm('Apagar esta nota?')) return
    try {
      await apagarNota(n.id)
      if (n.foto_url) await apagarFoto(n.foto_url)
      setRascunho(null); void carregar(); toast.success('Nota apagada.')
    } catch (e) { toast.error(msgErro(e)) }
  }

  const escolherFoto = () => fileRef.current?.click()
  const aoEscolherFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher a mesma foto de novo
    if (!file || !rascunho) return
    setSubindoFoto(true)
    try {
      const caminho = await subirFoto(file)
      // troca a foto anterior (se editou): remove a órfã do Storage
      if (rascunho.foto_url) await apagarFoto(rascunho.foto_url)
      setRascunho({ ...rascunho, foto_url: caminho })
    } catch (err) { toast.error(msgErro(err)) }
    finally { setSubindoFoto(false) }
  }

  const addTopico = () => {
    const t = novoTopico.trim()
    if (!t || !rascunho) return
    setRascunho({ ...rascunho, topicos: [...rascunho.topicos, t] })
    setNovoTopico('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nas notas…"
            className="pl-9 bg-white border-slate-200 rounded-xl"
          />
        </div>
        <Button onClick={abrirNovo} className="btn-gradient px-4 shrink-0">
          <Plus size={16} /> Nova
        </Button>
      </div>

      {carregando ? (
        <div className="py-14"><DiamondLoader size={72} label="Carregando" /></div>
      ) : filtradas.length === 0 ? (
        <div className="py-14 text-center rounded-2xl border border-dashed border-slate-200">
          <StickyNote className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-400 font-medium">
            {busca ? 'Nenhuma nota bate com a busca.' : 'Nenhuma nota ainda.'}
          </p>
          {!busca && <p className="text-xs text-slate-400 mt-1">Anote qualquer coisa — ou dite pra assistente.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtradas.map((n, i) => (
            <div
              key={n.id}
              role="button" tabIndex={0}
              onClick={() => abrirEdicao(n)}
              onKeyDown={(e) => e.key === 'Enter' && abrirEdicao(n)}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              className="group card-base card-hover overflow-hidden cursor-pointer animate-rise"
            >
              {n.foto_url && <FotoNota caminho={n.foto_url} className="w-full h-32 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-navy-900 truncate">{n.titulo || 'Sem título'}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); void alternarFixada(n) }}
                    aria-label={n.fixada ? 'Desafixar' : 'Fixar'}
                    className={`p-1 rounded-lg shrink-0 ${
                      n.fixada ? 'text-primary' : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-primary'
                    } transition-opacity`}
                  >
                    {n.fixada ? <Pin size={15} /> : <PinOff size={15} />}
                  </button>
                </div>
                {n.conteudo && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-3 whitespace-pre-wrap">{n.conteudo}</p>
                )}
                {n.topicos?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {n.topicos.slice(0, 4).map((t, j) => (
                      <li key={j} className="text-sm text-slate-600 flex items-start gap-1.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="truncate">{t}</span>
                      </li>
                    ))}
                    {n.topicos.length > 4 && (
                      <li className="text-xs text-slate-400 pl-3">+{n.topicos.length - 4} tópicos</li>
                    )}
                  </ul>
                )}
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-2.5">
                  {format(parseISO(n.atualizado_em), "d MMM · HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <Dialog open={!!rascunho} onOpenChange={(aberto) => { if (!aberto) void salvar() }}>
        <DialogContent className="bg-white border-slate-200 text-navy-900 rounded-2xl max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Nota</DialogTitle>
          </DialogHeader>
          {rascunho && (
            <div className="space-y-3">
              {/* Foto (topo) */}
              {rascunho.foto_url ? (
                <div className="relative rounded-xl overflow-hidden">
                  <FotoNota caminho={rascunho.foto_url} className="w-full max-h-56 object-cover" />
                  <button
                    onClick={async () => {
                      const antiga = rascunho.foto_url
                      setRascunho({ ...rascunho, foto_url: null })
                      if (antiga) await apagarFoto(antiga)
                    }}
                    aria-label="Remover foto"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : null}

              <Input
                value={rascunho.titulo}
                onChange={(e) => setRascunho({ ...rascunho, titulo: e.target.value })}
                placeholder="Título"
                className="bg-transparent border-0 border-b border-slate-200 rounded-none text-lg font-black px-0 pb-2 focus-visible:ring-0 focus-visible:border-primary placeholder:text-slate-400"
              />

              {/* Tópicos — o formato estruturado (bullets) */}
              {rascunho.topicos.length > 0 && (
                <ul className="space-y-1.5">
                  {rascunho.topicos.map((t, i) => (
                    <li key={i} className="flex items-center gap-2 group/topico">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="flex-1 text-slate-700">{t}</span>
                      <button
                        onClick={() => setRascunho({ ...rascunho, topicos: rascunho.topicos.filter((_, j) => j !== i) })}
                        aria-label="Remover tópico"
                        className="text-slate-300 hover:text-danger opacity-0 group-hover/topico:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2">
                <ListPlus size={16} className="text-slate-400 shrink-0" />
                <Input
                  value={novoTopico}
                  onChange={(e) => setNovoTopico(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopico() } }}
                  placeholder="Adicionar tópico e Enter"
                  className="bg-transparent border-0 border-b border-dashed border-slate-200 rounded-none px-0 h-8 focus-visible:ring-0 text-sm placeholder:text-slate-400"
                />
              </div>

              <Textarea
                value={rascunho.conteudo}
                onChange={(e) => setRascunho({ ...rascunho, conteudo: e.target.value })}
                placeholder="Escreva aqui… (opcional)"
                rows={5}
                className="bg-transparent border-0 px-0 min-h-[120px] focus-visible:ring-0 resize-none text-slate-700 placeholder:text-slate-400"
              />

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={aoEscolherFoto} />
            </div>
          )}
          <DialogFooter className="flex-row items-center gap-1">
            {rascunho?.id && (
              <Button variant="ghost" size="icon" onClick={() => rascunho && apagar(rascunho)} className="text-danger hover:text-danger mr-auto" aria-label="Apagar nota">
                <Trash2 size={16} />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={escolherFoto} disabled={subindoFoto} className="text-slate-500" aria-label="Adicionar foto">
              {subindoFoto ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />}
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={() => setRascunho(rascunho ? { ...rascunho, fixada: !rascunho.fixada } : null)}
              className={rascunho?.fixada ? 'text-primary' : 'text-slate-500'}
              aria-label={rascunho?.fixada ? 'Desafixar' : 'Fixar'}
            >
              <Pin size={16} />
            </Button>
            <Button onClick={salvar} disabled={salvando} className="btn-gradient rounded-xl ml-1">
              {salvando ? <Loader2 className="animate-spin" size={16} /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
