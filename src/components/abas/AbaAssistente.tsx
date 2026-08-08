import { useEffect, useRef, useState } from 'react'
import { Mic, Send, Square, Loader2, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { conversar, falar, gravarAudio, transcrever, type Gravador } from '@/lib/voz'

interface Msg { papel: 'user' | 'assistant'; conteudo: string }

/**
 * A assistente: chat de tela cheia com microfone de primeira classe.
 *
 * Fluxo de voz: segura/toca o microfone → grava → solta → Whisper transcreve
 * → a IA responde (criando compromisso/nota/lembrete quando for o caso) → a
 * resposta é FALADA de volta. Quem pergunta por voz recebe por voz; quem
 * digita, lê — e o alto-falante no topo desliga a fala de vez.
 */
export default function AbaAssistente({ ativa, nome }: { ativa: boolean; nome: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [gravando, setGravando] = useState(false)
  const [transcrevendo, setTranscrevendo] = useState(false)
  const [falarRespostas, setFalarRespostas] = useState(() => localStorage.getItem('aux.mudo') !== '1')
  const gravadorRef = useRef<Gravador | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)
  const carregouRef = useRef(false)

  // Histórico: a conversa continua de onde parou, em qualquer aparelho.
  useEffect(() => {
    if (!ativa || carregouRef.current) return
    carregouRef.current = true
    supabase
      .from('ai_mensagens')
      .select('papel, conteudo')
      .order('id', { ascending: false })
      .limit(40)
      .then(({ data }) => {
        if (data) setMsgs(data.reverse() as Msg[])
      })
  }, [ativa])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, pensando])

  const alternarMudo = () => {
    const novo = !falarRespostas
    setFalarRespostas(novo)
    localStorage.setItem('aux.mudo', novo ? '0' : '1')
    if (!novo) audioRef.current?.pause()
  }

  const enviar = async (m: string, veioDeVoz: boolean) => {
    const limpo = m.trim()
    if (!limpo || pensando) return
    setTexto('')
    setMsgs((xs) => [...xs, { papel: 'user', conteudo: limpo }])
    setPensando(true)
    try {
      const resposta = await conversar(limpo)
      setMsgs((xs) => [...xs, { papel: 'assistant', conteudo: resposta }])
      // Fala a resposta quando a pergunta veio por voz (e o som está ligado) —
      // é o "conversar com ela" do pedido, sem soltar áudio em quem digita.
      if (veioDeVoz && falarRespostas) {
        try {
          audioRef.current?.pause()
          const audio = await falar(resposta)
          audioRef.current = audio
          void audio.play()
        } catch { /* fala é bônus; o texto já está na tela */ }
      }
    } catch (e: unknown) {
      toast.error((e as Error).message)
      setMsgs((xs) => xs.slice(0, -1)) // devolve a pergunta pro campo
      setTexto(limpo)
    } finally {
      setPensando(false)
    }
  }

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
        toast.error((e as Error).message || 'Falha ao transcrever.')
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

  const SUGESTOES = [
    'Marca dentista sexta às 14h',
    'Me lembra de pagar o boleto dia 15 às 9h',
    'Anota: ideia pra campanha de agosto…',
    'Como está minha semana?',
  ]

  return (
    <div className="h-[calc(100dvh-8.5rem)] lg:h-dvh max-w-3xl mx-auto flex flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-primary/15 text-primary grid place-items-center">
            <Sparkles size={18} />
          </span>
          <div className="leading-tight">
            <p className="font-black text-white">Assistente</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              agenda · notas · lembretes
            </p>
          </div>
        </div>
        <button
          onClick={alternarMudo}
          aria-label={falarRespostas ? 'Silenciar respostas' : 'Falar respostas'}
          className={`p-2 rounded-xl ${falarRespostas ? 'text-primary bg-primary/10' : 'text-slate-500 bg-navy-800'}`}
        >
          {falarRespostas ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Conversa */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {msgs.length === 0 && !pensando && (
          <div className="pt-10 text-center space-y-5">
            <p className="text-slate-400 font-medium">
              Oi, {nome}! Me diga o que precisa — <span className="text-white font-bold">falando</span> ou
              escrevendo — que eu marco, anoto e te lembro.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s, false)}
                  className="px-3 py-1.5 rounded-full border border-navy-700 text-xs font-bold text-slate-300 hover:border-primary hover:text-primary transition-colors"
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
                  ? 'bg-primary text-navy-950 font-semibold rounded-br-md'
                  : 'bg-navy-800 text-slate-100 rounded-bl-md'
              }`}
            >
              {m.conteudo}
            </div>
          </div>
        ))}
        {pensando && (
          <div className="flex justify-start">
            <div className="bg-navy-800 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
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
          <div className="flex-1 flex items-center bg-navy-900 border border-navy-700 rounded-2xl pl-4 pr-1.5 py-1.5 focus-within:border-primary/60">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar(texto, false)}
              placeholder={transcrevendo ? 'Transcrevendo…' : 'Escreva ou toque no microfone'}
              disabled={gravando || transcrevendo}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500 disabled:opacity-60"
            />
            <button
              onClick={() => enviar(texto, false)}
              disabled={!texto.trim() || pensando}
              aria-label="Enviar"
              className="p-2 rounded-xl text-primary disabled:text-slate-600"
            >
              <Send size={18} />
            </button>
          </div>
          <button
            onClick={alternarGravacao}
            disabled={pensando || transcrevendo}
            aria-label={gravando ? 'Parar e enviar' : 'Falar com a assistente'}
            className={`w-12 h-12 rounded-2xl grid place-items-center transition-colors shrink-0 ${
              gravando
                ? 'bg-danger text-white'
                : 'bg-gradient-to-br from-primary to-primary-dark text-navy-950'
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
    </div>
  )
}
