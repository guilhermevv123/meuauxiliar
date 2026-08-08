import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Trash2, Loader2, BellRing, Repeat } from 'lucide-react'
import { toast } from 'sonner'
import DiamondLoader from '@/components/DiamondLoader'
import type { Lembrete } from '@/integrations/supabase/types'
import { listarLembretes, salvarLembrete, alternarLembrete, apagarLembrete, msgErro } from '@/lib/dados'
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

interface Rascunho {
  id?: string
  titulo: string
  data: string
  hora: string
  repetir: Lembrete['repetir']
}

export default function AbaLembretes({ ativa }: { ativa: boolean }) {
  const [itens, setItens] = useState<Lembrete[]>([])
  const [carregando, setCarregando] = useState(true)
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try { setItens(await listarLembretes()) }
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
    })
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
                })
              }}
            >
              <p className={`font-bold truncate ${l.concluido ? 'text-slate-400 line-through' : 'text-navy-900'}`}>
                {l.titulo}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                {format(parseISO(l.quando), "d MMM · HH:mm", { locale: ptBR })}
                {l.repetir !== 'nunca' && (
                  <span className="flex items-center gap-0.5 text-primary/80">
                    <Repeat size={11} />
                    {REPETICOES.find((r) => r.valor === l.repetir)?.rotulo}
                  </span>
                )}
              </p>
            </button>
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-navy-900">Lembretes</h2>
        <Button onClick={abrirNovo} size="sm" className="rounded-xl btn-gradient px-4 font-black">
          <Plus size={16} /> Novo
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
