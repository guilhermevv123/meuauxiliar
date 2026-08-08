import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth,
  isToday, startOfMonth, startOfWeek, eachDayOfInterval, parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, MapPin, Trash2, Loader2, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import DiamondLoader from '@/components/DiamondLoader'
import type { Compromisso } from '@/integrations/supabase/types'
import { listarCompromissos, salvarCompromisso, apagarCompromisso, msgErro } from '@/lib/dados'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

/** Cores de compromisso — nomes em vez de hex no banco pra tema poder evoluir. */
const CORES: Record<string, string> = {
  sky: 'bg-sky-500', verde: 'bg-emerald-500', ambar: 'bg-amber-500',
  rosa: 'bg-pink-500', roxo: 'bg-violet-500',
}

interface Rascunho {
  id?: string
  titulo: string
  data: string
  hora: string
  horaFim: string
  dia_inteiro: boolean
  local: string
  descricao: string
  cor: string
}

const rascunhoVazio = (dia: Date): Rascunho => ({
  titulo: '', data: format(dia, 'yyyy-MM-dd'), hora: '09:00', horaFim: '',
  dia_inteiro: false, local: '', descricao: '', cor: 'sky',
})

export default function AbaAgenda({ ativa }: { ativa: boolean }) {
  const [mes, setMes] = useState(() => startOfMonth(new Date()))
  const [diaSel, setDiaSel] = useState(() => new Date())
  const [itens, setItens] = useState<Compromisso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [salvando, setSalvando] = useState(false)

  // A grade mostra semanas completas, então a busca cobre a grade inteira —
  // senão os dias "vazados" do mês vizinho apareceriam sem bolinha.
  const gradeIni = useMemo(() => startOfWeek(startOfMonth(mes), { weekStartsOn: 0 }), [mes])
  const gradeFim = useMemo(() => endOfWeek(endOfMonth(mes), { weekStartsOn: 0 }), [mes])
  const dias = useMemo(() => eachDayOfInterval({ start: gradeIni, end: gradeFim }), [gradeIni, gradeFim])

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      setItens(await listarCompromissos(gradeIni.toISOString(), gradeFim.toISOString()))
    } catch (e) {
      toast.error(msgErro(e))
    } finally {
      setCarregando(false)
    }
  }, [gradeIni, gradeFim])

  useEffect(() => { if (ativa) void carregar() }, [ativa, carregar])

  const porDia = useMemo(() => {
    const m = new Map<string, Compromisso[]>()
    for (const c of itens) {
      const chave = format(parseISO(c.inicio), 'yyyy-MM-dd')
      m.set(chave, [...(m.get(chave) ?? []), c])
    }
    return m
  }, [itens])

  const doDia = porDia.get(format(diaSel, 'yyyy-MM-dd')) ?? []

  const abrirNovo = () => setRascunho(rascunhoVazio(diaSel))
  const abrirEdicao = (c: Compromisso) => {
    const ini = parseISO(c.inicio)
    setRascunho({
      id: c.id, titulo: c.titulo, data: format(ini, 'yyyy-MM-dd'),
      hora: format(ini, 'HH:mm'),
      horaFim: c.fim ? format(parseISO(c.fim), 'HH:mm') : '',
      dia_inteiro: c.dia_inteiro, local: c.local ?? '',
      descricao: c.descricao ?? '', cor: c.cor,
    })
  }

  const salvar = async () => {
    if (!rascunho || !rascunho.titulo.trim()) { toast.error('Dê um título ao compromisso.'); return }
    setSalvando(true)
    try {
      const inicio = rascunho.dia_inteiro
        ? new Date(`${rascunho.data}T00:00:00`)
        : new Date(`${rascunho.data}T${rascunho.hora}:00`)
      const fim = !rascunho.dia_inteiro && rascunho.horaFim
        ? new Date(`${rascunho.data}T${rascunho.horaFim}:00`)
        : null
      if (fim && fim < inicio) { toast.error('O fim não pode vir antes do início.'); return }
      await salvarCompromisso({
        id: rascunho.id, titulo: rascunho.titulo.trim(),
        inicio: inicio.toISOString(), fim: fim ? fim.toISOString() : null,
        dia_inteiro: rascunho.dia_inteiro,
        local: rascunho.local.trim() || null,
        descricao: rascunho.descricao.trim() || null,
        cor: rascunho.cor,
      })
      toast.success(rascunho.id ? 'Compromisso atualizado.' : 'Compromisso criado.')
      setRascunho(null)
      void carregar()
    } catch (e) {
      toast.error(msgErro(e))
    } finally {
      setSalvando(false)
    }
  }

  const apagar = async () => {
    if (!rascunho?.id) return
    if (!confirm('Apagar este compromisso?')) return
    try {
      await apagarCompromisso(rascunho.id)
      toast.success('Compromisso apagado.')
      setRascunho(null)
      void carregar()
    } catch (e) {
      toast.error(msgErro(e))
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
      {/* Cabeçalho do mês */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-navy-900 capitalize">
          {format(mes, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setMes(addMonths(mes, -1))} aria-label="Mês anterior">
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="ghost"
            className="text-xs font-bold text-primary px-2"
            onClick={() => { const hoje = new Date(); setMes(startOfMonth(hoje)); setDiaSel(hoje) }}
          >
            Hoje
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMes(addMonths(mes, 1))} aria-label="Próximo mês">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Grade do calendário */}
      <div className="rounded-2xl card-base p-3">
        <div className="grid grid-cols-7 mb-1">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-center text-[10px] font-black text-slate-400 uppercase">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dias.map((dia) => {
            const doDiaAqui = porDia.get(format(dia, 'yyyy-MM-dd')) ?? []
            const selecionado = isSameDay(dia, diaSel)
            return (
              <button
                key={dia.toISOString()}
                onClick={() => { setDiaSel(dia); if (!isSameMonth(dia, mes)) setMes(startOfMonth(dia)) }}
                className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm transition-colors ${
                  selecionado ? 'bg-gradient-to-br from-primary to-primary-dark text-white font-black shadow-sm'
                  : isToday(dia) ? 'bg-primary/15 text-primary font-black'
                  : isSameMonth(dia, mes) ? 'text-slate-700 hover:bg-slate-100 font-semibold'
                  : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {format(dia, 'd')}
                <span className="flex gap-0.5 h-1.5">
                  {doDiaAqui.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      className={`w-1.5 h-1.5 rounded-full ${selecionado ? 'bg-white/70' : CORES[c.cor] ?? 'bg-sky-500'}`}
                    />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista do dia selecionado */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-400 capitalize">
            {format(diaSel, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
          <Button onClick={abrirNovo} size="sm" className="rounded-xl btn-gradient px-4 font-black">
            <Plus size={16} /> Novo
          </Button>
        </div>

        {carregando ? (
          <div className="py-10"><DiamondLoader size={72} label="Carregando" /></div>
        ) : doDia.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200">
            <CalendarDays className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-400 font-medium">Nada marcado para este dia.</p>
            <p className="text-xs text-slate-400 mt-1">Toque em “Novo” ou peça à assistente.</p>
          </div>
        ) : (
          doDia.map((c) => (
            <button
              key={c.id}
              onClick={() => abrirEdicao(c)}
              className="w-full flex items-center gap-3 rounded-2xl card-base p-3.5 text-left hover:border-primary/40 transition-colors"
            >
              <span className={`w-1 self-stretch rounded-full ${CORES[c.cor] ?? 'bg-sky-500'}`} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy-900 truncate">{c.titulo}</p>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>
                    {c.dia_inteiro
                      ? 'Dia inteiro'
                      : format(parseISO(c.inicio), 'HH:mm') + (c.fim ? ` – ${format(parseISO(c.fim), 'HH:mm')}` : '')}
                  </span>
                  {c.local && (
                    <span className="flex items-center gap-0.5 truncate"><MapPin size={11} />{c.local}</span>
                  )}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Criar / editar */}
      <Dialog open={!!rascunho} onOpenChange={(aberto) => !aberto && setRascunho(null)}>
        <DialogContent className="bg-white border-slate-200 text-navy-900 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black">
              {rascunho?.id ? 'Editar compromisso' : 'Novo compromisso'}
            </DialogTitle>
          </DialogHeader>
          {rascunho && (
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label>Título</Label>
                <Input
                  value={rascunho.titulo}
                  onChange={(e) => setRascunho({ ...rascunho, titulo: e.target.value })}
                  placeholder="Reunião com…"
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
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3">
                  <Label htmlFor="dia-inteiro" className="text-xs">Dia inteiro</Label>
                  <Switch
                    id="dia-inteiro"
                    checked={rascunho.dia_inteiro}
                    onCheckedChange={(v) => setRascunho({ ...rascunho, dia_inteiro: v })}
                  />
                </div>
              </div>
              {!rascunho.dia_inteiro && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Início</Label>
                    <Input
                      type="time"
                      value={rascunho.hora}
                      onChange={(e) => setRascunho({ ...rascunho, hora: e.target.value })}
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fim <span className="text-slate-400">(opcional)</span></Label>
                    <Input
                      type="time"
                      value={rascunho.horaFim}
                      onChange={(e) => setRascunho({ ...rascunho, horaFim: e.target.value })}
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Local <span className="text-slate-400">(opcional)</span></Label>
                <Input
                  value={rascunho.local}
                  onChange={(e) => setRascunho({ ...rascunho, local: e.target.value })}
                  placeholder="Escritório, Meet…"
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descrição <span className="text-slate-400">(opcional)</span></Label>
                <Textarea
                  value={rascunho.descricao}
                  onChange={(e) => setRascunho({ ...rascunho, descricao: e.target.value })}
                  rows={2}
                  className="bg-slate-50 border-slate-200 rounded-xl resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                {Object.entries(CORES).map(([nome, classe]) => (
                  <button
                    key={nome}
                    onClick={() => setRascunho({ ...rascunho, cor: nome })}
                    aria-label={`Cor ${nome}`}
                    className={`w-7 h-7 rounded-full ${classe} ${
                      rascunho.cor === nome ? 'ring-2 ring-white ring-offset-2 ring-offset-white' : 'opacity-60'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="flex-row gap-2">
            {rascunho?.id && (
              <Button variant="ghost" onClick={apagar} className="text-danger hover:text-danger mr-auto">
                <Trash2 size={16} />
              </Button>
            )}
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
