import { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarDays, BellRing, CheckCircle2, StickyNote, Sparkles, MapPin, Clock, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { resumoInicio, type ResumoInicio } from '@/lib/dados'
import { msgErro } from '@/lib/dados'
import DiamondLoader from '@/components/DiamondLoader'

/**
 * Aba Início — o painel-resumo. Responde de relance "o que tenho hoje, amanhã,
 * o que falta e o que já fiz". É a tela que abre no app.
 */
export default function AbaInicio({
  ativa,
  nome,
  irPara,
}: {
  ativa: boolean
  nome: string
  irPara: (aba: 'agenda' | 'notas' | 'lembretes' | 'assistente') => void
}) {
  const [dados, setDados] = useState<ResumoInicio | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try { setDados(await resumoInicio()) }
    catch (e) { toast.error(msgErro(e)) }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { if (ativa) void carregar() }, [ativa, carregar])

  const saudacao = (() => {
    const h = new Date().getHours()
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  })()

  const NUMEROS = dados && [
    { rotulo: 'Hoje', valor: dados.hoje.length, Icone: CalendarDays, cor: 'text-primary', bg: 'bg-primary/10', vai: 'agenda' as const },
    { rotulo: 'Amanhã', valor: dados.amanha.length, Icone: CalendarDays, cor: 'text-violet-600', bg: 'bg-violet-100', vai: 'agenda' as const },
    { rotulo: 'Lembretes', valor: dados.lembretesPendentes.length, Icone: BellRing, cor: 'text-amber-600', bg: 'bg-amber-100', vai: 'lembretes' as const },
    { rotulo: 'Feitos hoje', valor: dados.concluidosHoje, Icone: CheckCircle2, cor: 'text-emerald-600', bg: 'bg-emerald-100', vai: 'lembretes' as const },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
      {/* Cabeçalho */}
      <div className="animate-rise">
        <p className="text-sm font-bold text-slate-400">{saudacao},</p>
        <h1 className="text-2xl font-black text-navy-900 capitalize">{nome} 👋</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5 capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {carregando || !dados ? (
        <div className="py-16"><DiamondLoader size={80} label="Carregando" /></div>
      ) : (
        <>
          {/* 4 números */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NUMEROS!.map(({ rotulo, valor, Icone, cor, bg, vai }, i) => (
              <button
                key={rotulo}
                onClick={() => irPara(vai)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="card-base card-hover p-4 text-left animate-rise"
              >
                <span className={`inline-grid place-items-center w-9 h-9 rounded-xl ${bg} ${cor} mb-2`}>
                  <Icone size={18} />
                </span>
                <p className={`text-3xl font-black tabular-nums leading-none ${cor}`}>{valor}</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mt-1">{rotulo}</p>
              </button>
            ))}
          </div>

          {/* Compromissos de hoje */}
          <Secao titulo="Sua agenda de hoje" Icone={CalendarDays} verMais={() => irPara('agenda')}>
            {dados.hoje.length === 0 ? (
              <Vazio texto="Nada marcado para hoje. Aproveite — ou peça à assistente." />
            ) : (
              dados.hoje.map((c) => (
                <div key={c.id} className="flex items-center gap-3 card-base p-3.5">
                  <span className="w-1 self-stretch rounded-full bg-gradient-to-b from-primary to-primary-dark" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-navy-900 truncate">{c.titulo}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {c.dia_inteiro ? 'Dia inteiro' : format(parseISO(c.inicio), 'HH:mm')}
                      </span>
                      {c.local && <span className="flex items-center gap-0.5 truncate"><MapPin size={11} />{c.local}</span>}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Secao>

          {/* Amanhã (só se tiver) */}
          {dados.amanha.length > 0 && (
            <Secao titulo="Amanhã" Icone={CalendarDays} verMais={() => irPara('agenda')}>
              {dados.amanha.map((c) => (
                <div key={c.id} className="flex items-center gap-3 card-base p-3.5">
                  <span className="w-1 self-stretch rounded-full bg-violet-400" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-navy-900 truncate">{c.titulo}</p>
                    <p className="text-xs text-slate-400">
                      {c.dia_inteiro ? 'Dia inteiro' : format(parseISO(c.inicio), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </Secao>
          )}

          {/* Próximos lembretes */}
          {dados.lembretesPendentes.length > 0 && (
            <Secao titulo="Próximos lembretes" Icone={BellRing} verMais={() => irPara('lembretes')}>
              {dados.lembretesPendentes.slice(0, 3).map((l) => (
                <div key={l.id} className="flex items-center gap-3 card-base p-3.5">
                  <BellRing size={16} className="text-amber-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-navy-900 truncate">{l.titulo}</p>
                    <p className="text-xs text-slate-400">
                      {format(parseISO(l.quando), "d MMM · HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </Secao>
          )}

          {/* Atalho pra assistente */}
          <button
            onClick={() => irPara('assistente')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-left text-white
                       bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/25
                       hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.99]"
          >
            <span className="w-11 h-11 rounded-xl bg-white/20 grid place-items-center shrink-0">
              <Sparkles size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-black">Fale com a assistente</p>
              <p className="text-xs text-sky-100/90">Marque, anote e lembre — por voz ou texto.</p>
            </div>
            <ArrowRight size={20} className="shrink-0" />
          </button>

          <p className="text-center text-[11px] text-slate-400 font-medium pt-1 flex items-center justify-center gap-1">
            <StickyNote size={12} /> {dados.totalNotas} {dados.totalNotas === 1 ? 'nota guardada' : 'notas guardadas'}
          </p>
        </>
      )}
    </div>
  )
}

function Secao({
  titulo, Icone, verMais, children,
}: {
  titulo: string
  Icone: typeof CalendarDays
  verMais: () => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2 animate-rise">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-navy-900 flex items-center gap-1.5">
          <Icone size={15} className="text-primary" /> {titulo}
        </h2>
        <button onClick={verMais} className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
          Ver tudo <ArrowRight size={12} />
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="py-6 text-center rounded-2xl border border-dashed border-slate-200">
      <p className="text-sm text-slate-400 font-medium">{texto}</p>
    </div>
  )
}
