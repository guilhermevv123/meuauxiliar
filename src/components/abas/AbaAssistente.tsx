import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Mic, Send, Square, Loader2, Volume2, VolumeX, Sparkles,
  History, Plus, Trash2, PhoneCall, PhoneOff, X, Gauge,
} from 'lucide-react'
import { toast } from 'sonner'
import { conversar, falar, gravarAudio, transcrever, ouvirAteCalar, type Gravador } from '@/lib/voz'
import {
  listarConversas, mensagensDaConversa, apagarConversa, limparConversas,
  type Conversa, type MsgChat,
} from '@/lib/conversas'
import { msgErro } from '@/lib/dados'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

/** Velocidades de fala — o pedido era poder deixar mais rápida. */
const VELOCIDADES = [1, 1.25, 1.5, 1.75] as const

/**
 * A assistente: chat de tela cheia, com microfone de primeira classe,
 * histórico de conversas (estilo ChatGPT) e MODO LIGAÇÃO.
 *
 * Modo ligação = conversa sem tocar em nada: o app ouve, detecta quando você
 * parou de falar (VAD no navegador), responde em voz alta e volta a ouvir.
 * O ciclo só para quando você desliga.
 */
export default function AbaAssistente({ ativa, nome }: { ativa: boolean; nome: string }) {
  const [msgs, setMsgs] = useState<MsgChat[]>([])
  const [conversaId, setConversaId] = useState<string | null>(null)
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [gravando, setGravando] = useState(false)
  const [transcrevendo, setTranscrevendo] = useState(false)
  const [falarRespostas, setFalarRespostas] = useState(() => localStorage.getItem('aux.mudo') !== '1')
  const [velocidade, setVelocidade] = useState(() => Number(localStorage.getItem('aux.velocidade')) || 1.25)

  // Modo ligação
  const [emLigacao, setEmLigacao] = useState(false)
  const [faseLigacao, setFaseLigacao] = useState<'ouvindo' | 'pensando' | 'falando'>('ouvindo')
  const [nivel, setNivel] = useState(0)

  const gravadorRef = useRef<Gravador | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)
  const ligacaoRef = useRef(false)         // espelho síncrono do estado (o laço lê isto)
  const cancelarOuvirRef = useRef<(() => void) | null>(null)
  const conversaIdRef = useRef<string | null>(null) // idem: o laço não vê o state novo

  useEffect(() => { conversaIdRef.current = conversaId }, [conversaId])

  const recarregarConversas = useCallback(async () => {
    try { setConversas(await listarConversas()) } catch { /* lista é conveniência */ }
  }, [])

  // Abre na conversa mais recente — continua de onde parou, em qualquer aparelho.
  const carregouRef = useRef(false)
  useEffect(() => {
    if (!ativa || carregouRef.current) return
    carregouRef.current = true
    void (async () => {
      const lista = await listarConversas().catch(() => [] as Conversa[])
      setConversas(lista)
      if (lista[0]) {
        setConversaId(lista[0].id)
        setMsgs(await mensagensDaConversa(lista[0].id).catch(() => []))
      }
    })()
  }, [ativa])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, pensando])

  // Sair da aba (ou desmontar) desliga a ligação: nada de microfone aberto
  // rodando por trás enquanto a pessoa mexe na agenda.
  useEffect(() => {
    if (!ativa && ligacaoRef.current) desligar()
    return () => { if (ligacaoRef.current) desligar() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativa])

  const alternarMudo = () => {
    const novo = !falarRespostas
    setFalarRespostas(novo)
    localStorage.setItem('aux.mudo', novo ? '0' : '1')
    if (!novo) audioRef.current?.pause()
  }

  const mudarVelocidade = () => {
    const i = VELOCIDADES.indexOf(velocidade as typeof VELOCIDADES[number])
    const nova = VELOCIDADES[(i + 1) % VELOCIDADES.length]
    setVelocidade(nova)
    localStorage.setItem('aux.velocidade', String(nova))
  }

  /** Fala um texto e resolve quando o áudio TERMINA (o laço da ligação espera). */
  const falarEsperando = useCallback(async (t: string) => {
    audioRef.current?.pause()
    const audio = await falar(t, velocidade)
    audioRef.current = audio
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve()
      audio.onerror = () => resolve()
      void audio.play().catch(() => resolve())
    })
  }, [velocidade])

  const enviar = async (m: string, veioDeVoz: boolean): Promise<string | null> => {
    const limpo = m.trim()
    if (!limpo || pensando) return null
    setTexto('')
    setMsgs((xs) => [...xs, { papel: 'user', conteudo: limpo }])
    setPensando(true)
    try {
      const { resposta, conversaId: id } = await conversar(limpo, conversaIdRef.current)
      conversaIdRef.current = id
      setConversaId(id)
      setMsgs((xs) => [...xs, { papel: 'assistant', conteudo: resposta }])
      void recarregarConversas()
      // Fala quando a pergunta veio por voz (e o som está ligado). Na ligação,
      // quem fala é o laço — ele precisa ESPERAR o áudio acabar antes de ouvir
      // de novo, senão a assistente escuta a própria voz.
      if (veioDeVoz && falarRespostas && !ligacaoRef.current) {
        try { await falarEsperando(resposta) } catch { /* fala é bônus */ }
      }
      return resposta
    } catch (e: unknown) {
      toast.error(msgErro(e))
      setMsgs((xs) => xs.slice(0, -1))
      setTexto(limpo)
      return null
    } finally {
      setPensando(false)
    }
  }

  // ── Modo ligação ────────────────────────────────────────────────────────
  const desligar = () => {
    ligacaoRef.current = false
    setEmLigacao(false)
    setNivel(0)
    cancelarOuvirRef.current?.()
    cancelarOuvirRef.current = null
    audioRef.current?.pause()
  }

  const ligar = async () => {
    if (ligacaoRef.current) return
    ligacaoRef.current = true
    setEmLigacao(true)
    try {
      // Uma saudação curta prova na hora que o áudio está liberado (iOS exige
      // gesto do usuário — este clique é o gesto).
      setFaseLigacao('falando')
      await falarEsperando(`Oi ${nome}! Pode falar.`)
    } catch {
      toast.error('Não consegui tocar o áudio — verifique o volume.')
    }

    while (ligacaoRef.current) {
      try {
        setFaseLigacao('ouvindo')
        const { audio, cancelar } = await ouvirAteCalar({
          silencioMs: 1200,
          limiteMs: 20000,
          aoNivel: setNivel,
        })
        cancelarOuvirRef.current = cancelar
        const blob = await audio
        cancelarOuvirRef.current = null
        setNivel(0)
        if (!ligacaoRef.current) break
        if (!blob) continue // ninguém falou — segue ouvindo

        setFaseLigacao('pensando')
        const dito = await transcrever(blob)
        if (!dito) continue
        if (!ligacaoRef.current) break

        // Desligar por voz — é o jeito natural de encerrar sem tocar na tela.
        if (/^(tchau|obrigado,? tchau|desliga|pode desligar|encerrar)\b/i.test(dito.trim())) {
          setMsgs((xs) => [...xs, { papel: 'user', conteudo: dito }])
          setFaseLigacao('falando')
          await falarEsperando('Até mais!')
          desligar()
          break
        }

        const resposta = await enviar(dito, true)
        if (!ligacaoRef.current || !resposta) continue
        setFaseLigacao('falando')
        await falarEsperando(resposta)
      } catch (e) {
        if (!ligacaoRef.current) break
        toast.error(msgErro(e))
        desligar()
        break
      }
    }
  }

  // ── Gravação avulsa (fora da ligação) ───────────────────────────────────
  const alternarGravacao = async () => {
    if (gravando) {
      setGravando(false)
      setTranscrevendo(true)
      try {
        const blob = await gravadorRef.current!.parar()
        gravadorRef.current = null
        const t = await transcrever(blob)
        if (!t) { toast.error('Não ouvi nada — tente de novo.'); return }
        await enviar(t, true)
      } catch (e: unknown) {
        toast.error(msgErro(e) || 'Falha ao transcrever.')
      } finally {
        setTranscrevendo(false)
      }
      return
    }
    try {
      gravadorRef.current = await gravarAudio()
      audioRef.current?.pause()
      setGravando(true)
    } catch {
      toast.error('Preciso da permissão do microfone pra te ouvir.')
    }
  }

  // ── Conversas ───────────────────────────────────────────────────────────
  const novaConversa = () => {
    audioRef.current?.pause()
    setConversaId(null); conversaIdRef.current = null
    setMsgs([]); setTexto('')
    setHistoricoAberto(false)
  }

  const abrirConversa = async (c: Conversa) => {
    setHistoricoAberto(false)
    setConversaId(c.id); conversaIdRef.current = c.id
    setMsgs(await mensagensDaConversa(c.id).catch(() => []))
  }

  const removerConversa = async (c: Conversa) => {
    try {
      await apagarConversa(c.id)
      if (c.id === conversaId) novaConversa()
      void recarregarConversas()
    } catch (e) { toast.error(msgErro(e)) }
  }

  const limparTudo = async () => {
    if (!confirm('Apagar TODAS as conversas com a assistente? Isso não volta.')) return
    try {
      await limparConversas()
      setConversas([]); novaConversa()
      toast.success('Histórico limpo.')
    } catch (e) { toast.error(msgErro(e)) }
  }

  const SUGESTOES = [
    'Marca dentista sexta às 14h',
    'Me lembra de pagar o boleto dia 15 às 9h',
    'Anota: ideia pra campanha de agosto…',
    'Como está minha semana?',
  ]

  return (
    <div className="h-[calc(100dvh-8.5rem)] lg:h-dvh max-w-3xl mx-auto flex flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
            <Sparkles size={18} />
          </span>
          <div className="leading-tight min-w-0">
            <p className="font-black text-navy-900 truncate">Assistente</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              agenda · notas · lembretes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={mudarVelocidade}
            aria-label="Velocidade da fala"
            title="Velocidade da fala"
            className="px-2 h-9 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 flex items-center gap-1 text-xs font-black"
          >
            <Gauge size={16} />{velocidade}×
          </button>
          <button
            onClick={alternarMudo}
            aria-label={falarRespostas ? 'Silenciar respostas' : 'Falar respostas'}
            className={`w-9 h-9 rounded-xl grid place-items-center ${falarRespostas ? 'text-primary bg-primary/10' : 'text-slate-400 bg-slate-100'}`}
          >
            {falarRespostas ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={novaConversa}
            aria-label="Nova conversa"
            title="Nova conversa"
            className="w-9 h-9 rounded-xl grid place-items-center text-slate-500 hover:text-primary hover:bg-primary/10"
          >
            <Plus size={18} />
          </button>
          <Sheet open={historicoAberto} onOpenChange={setHistoricoAberto}>
            <SheetTrigger asChild>
              <button
                aria-label="Histórico de conversas"
                title="Histórico"
                className="w-9 h-9 rounded-xl grid place-items-center text-slate-500 hover:text-primary hover:bg-primary/10"
              >
                <History size={18} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-slate-200 text-navy-900 w-[19rem] flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-black">Conversas</SheetTitle>
              </SheetHeader>
              <button
                onClick={novaConversa}
                className="mt-3 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl btn-gradient text-sm"
              >
                <Plus size={16} /> Nova conversa
              </button>
              <div className="flex-1 overflow-y-auto mt-3 space-y-1">
                {conversas.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Nenhuma conversa ainda.</p>
                ) : conversas.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-1 rounded-xl px-3 py-2 cursor-pointer ${
                      c.id === conversaId ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                    onClick={() => void abrirConversa(c)}
                  >
                    <span className="flex-1 truncate text-sm font-semibold">{c.titulo}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); void removerConversa(c) }}
                      aria-label="Apagar conversa"
                      className="text-slate-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {conversas.length > 0 && (
                <button
                  onClick={limparTudo}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-danger hover:bg-danger/5"
                >
                  <Trash2 size={15} /> Limpar tudo
                </button>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Conversa */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {msgs.length === 0 && !pensando && (
          <div className="pt-10 text-center space-y-5">
            <p className="text-slate-400 font-medium">
              Oi, {nome}! Me diga o que precisa — <span className="text-navy-900 font-bold">falando</span> ou
              escrevendo — que eu marco, anoto e te lembro.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s, false)}
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-400 hover:border-primary hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.papel === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.papel === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-br-md shadow-sm shadow-primary/20'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
              }`}
            >
              {m.conteudo}
            </div>
          </div>
        ))}
        {pensando && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={fimRef} />
      </div>

      {/* Entrada */}
      <div className="px-4 pb-4 pt-2">
        {gravando && (
          <p className="text-center text-xs font-bold text-danger mb-2 animate-pulse-soft">
            ● Gravando — toque no quadrado pra enviar
          </p>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl pl-4 pr-1.5 py-1.5 focus-within:border-primary/60">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar(texto, false)}
              placeholder={transcrevendo ? 'Transcrevendo…' : 'Escreva ou toque no microfone'}
              disabled={gravando || transcrevendo}
              className="flex-1 bg-transparent outline-none text-sm text-navy-900 placeholder:text-slate-400 disabled:opacity-60"
            />
            <button
              onClick={() => enviar(texto, false)}
              disabled={!texto.trim() || pensando}
              aria-label="Enviar"
              className="p-2 rounded-xl text-primary disabled:text-slate-400"
            >
              <Send size={18} />
            </button>
          </div>
          {/* Ligação: conversa contínua, sem tocar em botão */}
          <button
            onClick={ligar}
            disabled={pensando || transcrevendo || gravando}
            aria-label="Modo ligação"
            title="Modo ligação — conversa sem tocar na tela"
            className="w-12 h-12 rounded-2xl grid place-items-center shrink-0 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            <PhoneCall size={20} />
          </button>
          <button
            onClick={alternarGravacao}
            disabled={pensando || transcrevendo}
            aria-label={gravando ? 'Parar e enviar' : 'Falar com a assistente'}
            className={`w-12 h-12 rounded-2xl grid place-items-center transition-colors shrink-0 ${
              gravando
                ? 'bg-danger text-white'
                : 'bg-gradient-to-br from-primary to-primary-dark text-white'
            } disabled:opacity-50`}
          >
            {transcrevendo ? (
              <Loader2 size={20} className="animate-spin" />
            ) : gravando ? (
              <Square size={18} fill="currentColor" />
            ) : (
              <Mic size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Tela de ligação */}
      {emLigacao && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-navy-900 via-navy-900 to-[#0b2036] text-white flex flex-col items-center justify-center gap-8 animate-fade-in">
          <button
            onClick={desligar}
            aria-label="Fechar"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 grid place-items-center hover:bg-white/20"
          >
            <X size={18} />
          </button>

          {/* Bolha que respira com a sua voz */}
          <div className="relative grid place-items-center">
            <span
              className="absolute rounded-full bg-primary/25 transition-transform duration-100"
              style={{ width: 220, height: 220, transform: `scale(${1 + nivel * 0.55})` }}
            />
            <span className="absolute w-40 h-40 rounded-full bg-primary/30 animate-pulse-soft" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-dark grid place-items-center shadow-2xl shadow-primary/40">
              {faseLigacao === 'pensando'
                ? <Loader2 size={40} className="animate-spin" />
                : faseLigacao === 'falando'
                  ? <Volume2 size={40} />
                  : <Mic size={40} />}
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-2xl font-black">
              {faseLigacao === 'ouvindo' ? 'Te ouvindo…' : faseLigacao === 'pensando' ? 'Pensando…' : 'Falando'}
            </p>
            <p className="text-sm text-white/60">
              {faseLigacao === 'ouvindo'
                ? 'Fale normalmente — eu respondo quando você parar.'
                : 'Diga “tchau” pra encerrar a qualquer momento.'}
            </p>
          </div>

          <button
            onClick={desligar}
            className="w-16 h-16 rounded-full bg-danger grid place-items-center shadow-xl shadow-danger/30 hover:scale-105 transition-transform"
            aria-label="Desligar"
          >
            <PhoneOff size={26} />
          </button>
        </div>
      )}
    </div>
  )
}
