import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Trash2, Loader2, BellRing, Repeat, ImagePlus, X, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import DiamondLoader from '@/components/DiamondLoader'
import SeletorEtiquetas, { EtiquetasDoItem, useEtiquetas } from '@/components/SeletorEtiquetas'
import AlternadorVisao, { ColunaKanban, useVisao } from '@/components/AlternadorVisao'
import type { Lembrete, Nota } from '@/integrations/supabase/types'
import { listarLembretes, salvarLembrete, alternarLembrete, apagarLembrete, listarNotas, msgErro } from '@/lib/dados'
import { subirFoto, urlDaFoto, apagarFoto } from '@/lib/fotos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const REPETICOES = [
  { valor: 'nunca', rotulo: 'Não repete' },
  { valor: 'diario', rotulo: 'Todo dia' },
  { valor: 'semanal', rotulo: 'Toda semana' },
  { valor: 'mensal', rotulo: 'Todo mês' },
] as const

const SEM_NOTA = '__nenhuma__' // o Select não aceita value="" — sentinela p/ "sem nota"

/**
 * Avisos antecipados, em minutos antes do horário.
 *
 * Vários por lembrete de propósito: o pedido era ser avisado quando chega o
 * dia E quando está perto de vencer — são disparos diferentes do mesmo item.
 */
const AVISOS = [
  { min: 0,    rotulo: 'Na hora' },
  { min: 10,   rotulo: '10 min antes' },
  { min: 30,   rotulo: '30 min antes' },
  { min: 60,   rotulo: '1 hora antes' },
  { min: 180,  rotulo: '3 horas antes' },
  { min: 1440, rotulo: '1 dia antes' },
  { min: 2880, rotulo: '2 dias antes' },
] as const

type ChaveColuna = 'atrasados' | 'hoje' | 'proximos' | 'feitos'

const COLUNAS: Array<{ chave: ChaveColuna; titulo: string; bolinha: string }> = [
  { chave: 'atrasados', titulo: 'Atrasados', bolinha: 'bg-rose-500' },
  { chave: 'hoje',      titulo: 'Hoje',      bolinha: 'bg-sky-500' },
  { chave: 'proximos',  titulo: 'Próximos',  bolinha: 'bg-violet-500' },
  { chave: 'feitos',    titulo: 'Concluídos', bolinha: 'bg-emerald-500' },
]

interface Rascunho {
  id?: string
  titulo: string
  data: string
  hora: string
  repetir: Lembrete['repetir']
  foto_url: string | null
  nota_id: string | null
  etiqueta_ids: string[]
  avisos: number[]
}

/** "1440" → "1 dia antes", pro selo do card. */
function rotuloAviso(min: number): string {
  return AVISOS.find((a) => a.min === min)?.rotulo ?? `${min} min antes`
}

/** Miniatura de foto — URL assinada cacheada. */
function FotoMini({ caminho, className }: { caminho: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => { urlDaFoto(caminho).then(setUrl) }, [caminho])
  if (!url) return <div className={`bg-slate-100 animate-pulse ${className}`} />
  return <img src={url} alt="" className={className} loading="lazy" />
}

export default function AbaLembretes({ ativa }: { ativa: boolean }) {
  const [itens, setItens] = useState<Lembrete[]>([])
  const [notas, setNotas] = useState<Nota[]>([])
  const [carregando, setCarregando] = useState(true)
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [subindoFoto, setSubindoFoto] = useState(false)
  const { etiquetas, recarregar: recarregarEtiquetas } = useEtiquetas(ativa)
  const { visao, setVisao } = useVisao('lembretes')
  const fileRef = useRef<HTMLInputElement>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [ls, ns] = await Promise.all([listarLembretes(), listarNotas()])
      setItens(ls); setNotas(ns)
    }
    catch (e) { toast.error(msgErro(e)) }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { if (ativa) void carregar() }, [ativa, carregar])

  // Agrupamento que responde "o que eu preciso ver primeiro": atrasado no
  // topo, depois hoje, depois o resto; concluídos por último, apagáveis.
  const grupos = useMemo(() => {
    const pend = itens.filter((l) => !l.concluido)
    return {
      atrasados: pend.filter((l) => isPast(parseISO(l.quando)) && !isToday(parseISO(l.quando))),
      hoje: pend.filter((l) => isToday(parseISO(l.quando))),
      proximos: pend.filter((l) => !isPast(parseISO(l.quando)) && !isToday(parseISO(l.quando))),
      feitos: itens.filter((l) => l.concluido),
    }
  }, [itens])

  const abrirNovo = () => {
    const agora = new Date(Date.now() + 60 * 60 * 1000) // daqui 1h, minuto redondo
    agora.setMinutes(0, 0, 0)
    setRascunho({
      titulo: '', data: format(agora, 'yyyy-MM-dd'),
      hora: format(agora, 'HH:mm'), repetir: 'nunca',
      foto_url: null, nota_id: null, etiqueta_ids: [], avisos: [0],
    })
  }

  const escolherFoto = () => fileRef.current?.click()
  const aoEscolherFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !rascunho) return
    setSubindoFoto(true)
    try {
      const caminho = await subirFoto(file)
      if (rascunho.foto_url) await apagarFoto(rascunho.foto_url)
      setRascunho({ ...rascunho, foto_url: caminho })
    } catch (err) { toast.error(msgErro(err)) }
    finally { setSubindoFoto(false) }
  }

  const salvar = async () => {
    if (!rascunho || !rascunho.titulo.trim()) { toast.error('Do que devo te lembrar?'); return }
    setSalvando(true)
    try {
      await salvarLembrete({
        id: rascunho.id,
        titulo: rascunho.titulo.trim(),
        quando: new Date(`${rascunho.data}T${rascunho.hora}:00`).toISOString(),
        repetir: rascunho.repetir,
        foto_url: rascunho.foto_url,
        nota_id: rascunho.nota_id,
        etiqueta_ids: rascunho.etiqueta_ids,
        avisos: rascunho.avisos.length ? rascunho.avisos : [0],
        // Mexeu no lembrete: os avisos já enviados voltam à estaca zero,
        // senão mudar a data de amanhã pra semana que vem nunca mais avisaria.
        avisos_enviados: [],
        // Editar um lembrete re-arma a notificação dele
        notificado_em: null,
        concluido: false,
      })
      toast.success(rascunho.id ? 'Lembrete atualizado.' : 'Lembrete criado.')
      setRascunho(null)
      void carregar()
    } catch (e) { toast.error(msgErro(e)) }
    finally { setSalvando(false) }
  }

  const alternar = async (l: Lembrete) => {
    // otimista: a caixinha responde na hora, o servidor confirma depois
    setItens((xs) => xs.map((x) => (x.id === l.id ? { ...x, concluido: !l.concluido } : x)))
    try { await alternarLembrete(l.id, !l.concluido) }
    catch (e) { toast.error(msgErro(e)); void carregar() }
  }

  const apagar = async (id: string) => {
    try { await apagarLembrete(id); void carregar() }
    catch (e) { toast.error(msgErro(e)) }
  }

  /**
   * Arrastar entre colunas do kanban REAGENDA o lembrete — não é enfeite:
   *  • soltar em Concluídos marca como feito (e o contrário reabre);
   *  • soltar em Hoje/Próximos move a data mantendo a HORA original, que é o
   *    que a pessoa quer ao adiar ("mesma coisa, amanhã"), e zera os avisos
   *    já enviados pra a notificação valer de novo na data nova.
   */
  const arrastando = useRef<string | null>(null)

  const moverPara = async (destino: ChaveColuna) => {
    const id = arrastando.current
    arrastando.current = null
    if (!id) return
    const l = itens.find((x) => x.id === id)
    if (!l) return

    if (destino === 'feitos') {
      if (l.concluido) return
      return void alternar(l)
    }
    if (l.concluido) await alternarLembrete(l.id, false) // saiu de Concluídos

    const atual = parseISO(l.quando)
    const nova = new Date(atual)
    const hoje = new Date()
    if (destino === 'hoje') {
      nova.setFullYear(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    } else if (destino === 'proximos') {
      // "Próximos" = a partir de amanhã; só mexe se já não estiver no futuro.
      if (!isPast(atual) && !isToday(atual)) { void carregar(); return }
      nova.setFullYear(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)
    } else if (destino === 'atrasados') {
      return // ninguém arrasta algo PARA atrasado de propósito
    }

    try {
      await salvarLembrete({
        id: l.id, titulo: l.titulo, quando: nova.toISOString(),
        repetir: l.repetir, concluido: false,
        avisos_enviados: [], notificado_em: null,
      })
      void carregar()
    } catch (e) { toast.error(msgErro(e)); void carregar() }
  }

  const CardKanban = ({ l }: { l: Lembrete }) => (
    <div
      draggable
      onDragStart={() => { arrastando.current = l.id }}
      onDragEnd={() => { arrastando.current = null }}
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={l.concluido}
          onCheckedChange={() => alternar(l)}
          aria-label={`Concluir ${l.titulo}`}
          className="mt-0.5 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <button
          onClick={() => {
            const q = parseISO(l.quando)
            setRascunho({
              id: l.id, titulo: l.titulo, data: format(q, 'yyyy-MM-dd'),
              hora: format(q, 'HH:mm'), repetir: l.repetir,
              foto_url: l.foto_url, nota_id: l.nota_id,
              etiqueta_ids: l.etiqueta_ids || [], avisos: l.avisos?.length ? l.avisos : [0],
            })
          }}
          className="min-w-0 flex-1 text-left"
        >
          <p className={`truncate text-sm font-bold ${l.concluido ? 'text-slate-400 line-through' : 'text-navy-900'}`}>
            {l.titulo}
          </p>
          <p className="text-[11px] text-slate-400">
            {format(parseISO(l.quando), "d MMM · HH:mm", { locale: ptBR })}
          </p>
        </button>
      </div>
      <div className="mt-1.5 pl-6">
        <EtiquetasDoItem ids={l.etiqueta_ids} todas={etiquetas} max={2} />
      </div>
    </div>
  )

  const Grupo = ({ titulo, cor, lista }: { titulo: string; cor: string; lista: Lembrete[] }) =>
    lista.length === 0 ? null : (
      <div className="space-y-2">
        <h3 className={`text-[11px] font-black uppercase tracking-wider ${cor}`}>{titulo}</h3>
        {lista.map((l) => (
          <div
            key={l.id}
            className="flex items-center gap-3 rounded-2xl card-base px-3.5 py-3"
          >
            <Checkbox
              checked={l.concluido}
              onCheckedChange={() => alternar(l)}
              aria-label={`Concluir ${l.titulo}`}
              className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <button
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                const q = parseISO(l.quando)
                setRascunho({
                  id: l.id, titulo: l.titulo, data: format(q, 'yyyy-MM-dd'),
                  hora: format(q, 'HH:mm'), repetir: l.repetir,
                  foto_url: l.foto_url, nota_id: l.nota_id,
                  etiqueta_ids: l.etiqueta_ids || [], avisos: l.avisos?.length ? l.avisos : [0],
                })
              }}
            >
              <p className={`font-bold truncate ${l.concluido ? 'text-slate-400 line-through' : 'text-navy-900'}`}>
                {l.titulo}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                {format(parseISO(l.quando), "d MMM · HH:mm", { locale: ptBR })}
                {l.repetir !== 'nunca' && (
                  <span className="flex items-center gap-0.5 text-primary/80">
                    <Repeat size={11} />
                    {REPETICOES.find((r) => r.valor === l.repetir)?.rotulo}
                  </span>
                )}
                {l.nota_id && (
                  <span className="flex items-center gap-0.5 text-violet-500">
                    <Link2 size={11} />
                    {notas.find((n) => n.id === l.nota_id)?.titulo || 'nota'}
                  </span>
                )}
                {l.avisos?.some((a) => a > 0) && (
                  <span className="flex items-center gap-0.5 text-primary/80">
                    <BellRing size={11} />
                    {rotuloAviso(Math.max(...l.avisos))}
                  </span>
                )}
              </p>
              <div className="mt-1"><EtiquetasDoItem ids={l.etiqueta_ids} todas={etiquetas} max={3} /></div>
            </button>
            {l.foto_url && <FotoMini caminho={l.foto_url} className="w-10 h-10 rounded-lg object-cover shrink-0" />}
            <button
              onClick={() => apagar(l.id)}
              aria-label="Apagar lembrete"
              className="text-slate-400 hover:text-danger p-1.5"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-black text-navy-900">Lembretes</h2>
        <AlternadorVisao visao={visao} onMudar={setVisao} />
        <Button onClick={abrirNovo} size="sm" className="rounded-xl btn-gradient px-3 font-black">
          <Plus size={16} /> <span className="hidden sm:inline">Novo</span>
        </Button>
      </div>

      {carregando ? (
        <div className="py-14"><DiamondLoader size={72} label="Carregando" /></div>
      ) : itens.length === 0 ? (
        <div className="py-14 text-center rounded-2xl border border-dashed border-slate-200">
          <BellRing className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-400 font-medium">Nenhum lembrete.</p>
          <p className="text-xs text-slate-400 mt-1">
            Crie um e receba a notificação na hora certa — até com o app fechado.
          </p>
        </div>
      ) : visao === 'kanban' ? (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
          {COLUNAS.map((col) => {
            const lista = grupos[col.chave]
            return (
              <ColunaKanban
                key={col.chave}
                titulo={col.titulo}
                cor={col.bolinha}
                contagem={lista.length}
                onSoltar={() => void moverPara(col.chave)}
              >
                {lista.map((l) => <CardKanban key={l.id} l={l} />)}
              </ColunaKanban>
            )
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <Grupo titulo="Atrasados" cor="text-danger" lista={grupos.atrasados} />
          <Grupo titulo="Hoje" cor="text-primary" lista={grupos.hoje} />
          <Grupo titulo="Próximos" cor="text-slate-400" lista={grupos.proximos} />
          <Grupo titulo="Concluídos" cor="text-slate-400" lista={grupos.feitos} />
        </div>
      )}

      <Dialog open={!!rascunho} onOpenChange={(aberto) => !aberto && setRascunho(null)}>
        <DialogContent className="bg-white border-slate-200 text-navy-900 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black">{rascunho?.id ? 'Editar lembrete' : 'Novo lembrete'}</DialogTitle>
          </DialogHeader>
          {rascunho && (
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label>Me lembre de…</Label>
                <Input
                  value={rascunho.titulo}
                  onChange={(e) => setRascunho({ ...rascunho, titulo: e.target.value })}
                  placeholder="Pagar o boleto, ligar pro cliente…"
                  autoFocus
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={rascunho.data}
                    onChange={(e) => setRascunho({ ...rascunho, data: e.target.value })}
                    className="bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    value={rascunho.hora}
                    onChange={(e) => setRascunho({ ...rascunho, hora: e.target.value })}
                    className="bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Repetir</Label>
                <Select
                  value={rascunho.repetir}
                  onValueChange={(v) => setRascunho({ ...rascunho, repetir: v as Rascunho['repetir'] })}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-navy-900">
                    {REPETICOES.map((r) => (
                      <SelectItem key={r.valor} value={r.valor}>{r.rotulo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Avisos: dá pra marcar vários (1 dia antes E na hora) */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><BellRing size={13} /> Me avise</Label>
                <div className="flex flex-wrap gap-1.5">
                  {AVISOS.map((a) => {
                    const marcado = rascunho.avisos.includes(a.min)
                    return (
                      <button
                        key={a.min}
                        type="button"
                        onClick={() => setRascunho({
                          ...rascunho,
                          avisos: marcado
                            ? rascunho.avisos.filter((m) => m !== a.min)
                            : [...rascunho.avisos, a.min].sort((x, y) => y - x),
                        })}
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${
                          marcado
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {a.rotulo}
                      </button>
                    )
                  })}
                </div>
                {rascunho.avisos.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-semibold">
                    Sem nenhum aviso marcado, você não recebe notificação — vou usar “Na hora”.
                  </p>
                )}
              </div>

              {/* Etiquetas */}
              <div className="space-y-1.5">
                <Label>Etiquetas</Label>
                <SeletorEtiquetas
                  selecionadas={rascunho.etiqueta_ids}
                  onMudar={(ids) => setRascunho({ ...rascunho, etiqueta_ids: ids })}
                  etiquetas={etiquetas}
                  onRecarregar={recarregarEtiquetas}
                />
              </div>

              {/* Vincular a uma nota (opcional) */}
              {notas.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Link2 size={13} /> Vincular a uma nota</Label>
                  <Select
                    value={rascunho.nota_id ?? SEM_NOTA}
                    onValueChange={(v) => setRascunho({ ...rascunho, nota_id: v === SEM_NOTA ? null : v })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl">
                      <SelectValue placeholder="Nenhuma" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-navy-900">
                      <SelectItem value={SEM_NOTA}>Nenhuma</SelectItem>
                      {notas.map((n) => (
                        <SelectItem key={n.id} value={n.id}>{n.titulo || 'Sem título'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Foto (opcional) */}
              {rascunho.foto_url ? (
                <div className="relative rounded-xl overflow-hidden">
                  <FotoMini caminho={rascunho.foto_url} className="w-full max-h-48 object-cover" />
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
              ) : (
                <button
                  onClick={escolherFoto}
                  disabled={subindoFoto}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-primary hover:text-primary transition-colors"
                >
                  {subindoFoto ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />}
                  {subindoFoto ? 'Enviando…' : 'Adicionar foto'}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={aoEscolherFoto} />
            </div>
          )}
          <DialogFooter className="flex-row gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRascunho(null)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando} className="btn-gradient rounded-xl">
              {salvando ? <Loader2 className="animate-spin" size={16} /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
