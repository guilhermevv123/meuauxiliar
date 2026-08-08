import { supabase, FUNCTIONS_URL } from '@/integrations/supabase/client'

/**
 * Voz no navegador: grava com MediaRecorder e manda pra Edge Function `voz`,
 * que fala com a OpenAI (a chave NUNCA vem pro navegador).
 *
 * Por que não Web Speech API: no iOS o reconhecimento é capenga e o pedido é
 * usar a MESMA voz do assistente Diamond de mesa (transcrição gpt-4o-mini-
 * transcribe + fala gpt-4o-mini-tts com a voz "coral") — experiência idêntica
 * no site e no desktop.
 */

async function tokenAtual(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const t = data.session?.access_token
  if (!t) throw new Error('Sessão expirada — entre de novo.')
  return t
}

export interface Gravador {
  parar: () => Promise<Blob>
  cancelar: () => void
}

/** Começa a gravar já. `parar()` devolve o áudio; `cancelar()` descarta. */
export async function gravarAudio(): Promise<Gravador> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  // O Safari não grava webm; deixar o navegador escolher o container dele e
  // mandar o mime junto resolve — o Whisper aceita os dois.
  const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
  const rec = new MediaRecorder(stream, { mimeType: mime })
  const pedacos: Blob[] = []
  rec.ondataavailable = (e) => e.data.size > 0 && pedacos.push(e.data)
  rec.start()

  const desligarMic = () => stream.getTracks().forEach((t) => t.stop())

  return {
    parar: () =>
      new Promise<Blob>((resolve) => {
        rec.onstop = () => {
          desligarMic()
          resolve(new Blob(pedacos, { type: mime }))
        }
        rec.stop()
      }),
    cancelar: () => {
      rec.onstop = null
      try { rec.stop() } catch { /* já parado */ }
      desligarMic()
    },
  }
}

/**
 * Grava "hands-free": começa a ouvir e devolve o áudio SOZINHO quando você
 * para de falar — é o que faz o modo ligação parecer uma ligação de verdade,
 * sem precisar tocar em botão entre uma fala e outra.
 *
 * VAD caseiro (AnalyserNode + RMS) em vez de biblioteca: roda no navegador,
 * não custa request e é suficiente pra "fala ↔ silêncio". Regras:
 *  • espera a pessoa COMEÇAR a falar (senão o silêncio inicial encerraria já);
 *  • depois de falar, `silencioMs` de quietude fecha a gravação;
 *  • `limiteMs` é o teto duro (ninguém fica preso gravando pra sempre).
 * Devolve `null` quando ninguém falou até o teto — o chamador tenta de novo.
 */
export async function ouvirAteCalar(opts?: {
  silencioMs?: number
  limiteMs?: number
  aoNivel?: (nivel: number) => void
  aoFalar?: () => void
}): Promise<{ audio: Promise<Blob | null>; cancelar: () => void }> {
  const silencioMs = opts?.silencioMs ?? 1100
  const limiteMs = opts?.limiteMs ?? 20000
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  })
  const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
  const rec = new MediaRecorder(stream, { mimeType: mime })
  const pedacos: Blob[] = []
  rec.ondataavailable = (e) => e.data.size > 0 && pedacos.push(e.data)

  const ctx = new AudioContext()
  const fonte = ctx.createMediaStreamSource(stream)
  const analisador = ctx.createAnalyser()
  analisador.fftSize = 1024
  fonte.connect(analisador)
  const buffer = new Float32Array(analisador.fftSize)

  let cancelado = false
  let raf = 0
  const encerrar = () => {
    cancelAnimationFrame(raf)
    stream.getTracks().forEach((t) => t.stop())
    void ctx.close().catch(() => {})
  }

  let resolverCancelado: (() => void) | null = null
  const cancelar = () => {
    cancelado = true
    rec.onstop = null
    try { rec.stop() } catch { /* já parado */ }
    encerrar()
    resolverCancelado?.() // solta quem espera o áudio, com null
  }

  // Devolve a promessa SEM esperar: o chamador precisa do `cancelar` na mão
  // enquanto a gravação ainda corre (desligar a ligação no meio da fala).
  const audio = new Promise<Blob | null>((resolve) => {
    resolverCancelado = () => resolve(null)
    let falou = false
    let ultimoSom = performance.now()
    const inicio = ultimoSom

    const parar = (comAudio: boolean) => {
      if (cancelado) return
      cancelAnimationFrame(raf)
      rec.onstop = () => { encerrar(); resolve(comAudio ? new Blob(pedacos, { type: mime }) : null) }
      try { rec.stop() } catch { encerrar(); resolve(null) }
    }

    const tick = () => {
      if (cancelado) return
      analisador.getFloatTimeDomainData(buffer)
      let soma = 0
      for (let i = 0; i < buffer.length; i++) soma += buffer[i] * buffer[i]
      const rms = Math.sqrt(soma / buffer.length)
      opts?.aoNivel?.(Math.min(1, rms * 8)) // 0..1 pra animar a bolha

      const agora = performance.now()
      // 0.015 de RMS ≈ voz normal a ~30cm; abaixo disso é ruído de sala.
      if (rms > 0.015) {
        if (!falou) { falou = true; opts?.aoFalar?.() }
        ultimoSom = agora
      }
      if (falou && agora - ultimoSom > silencioMs) return parar(true)
      if (agora - inicio > limiteMs) return parar(falou)
      raf = requestAnimationFrame(tick)
    }

    rec.start()
    raf = requestAnimationFrame(tick)
  })

  return { audio, cancelar }
}

/** Áudio gravado → texto (Whisper na Edge Function). */
export async function transcrever(audio: Blob): Promise<string> {
  const b64 = await blobParaBase64(audio)
  const r = await fetch(`${FUNCTIONS_URL}/voz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await tokenAtual()}` },
    body: JSON.stringify({ acao: 'stt', audio_b64: b64, mime: audio.type }),
  })
  if (!r.ok) throw new Error(await erroDe(r, 'Não consegui entender o áudio.'))
  const { texto } = await r.json()
  return String(texto || '').trim()
}

/** Texto → fala. Devolve um elemento de áudio pronto pra tocar. */
export async function falar(texto: string, speed?: number): Promise<HTMLAudioElement> {
  const r = await fetch(`${FUNCTIONS_URL}/voz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await tokenAtual()}` },
    body: JSON.stringify({ acao: 'tts', texto, ...(speed ? { speed } : {}) }),
  })
  if (!r.ok) throw new Error(await erroDe(r, 'Não consegui gerar a fala.'))
  const { audio_b64 } = await r.json()
  const audio = new Audio(`data:audio/mp3;base64,${audio_b64}`)
  return audio
}

/**
 * Conversa com a assistente (Edge Function `ai-chat`).
 * Passa/recebe `conversa_id`: sem ele, o servidor abre uma conversa nova e
 * devolve o id pra continuar nela.
 */
export async function conversar(
  mensagem: string,
  conversaId?: string | null
): Promise<{ resposta: string; conversaId: string }> {
  const r = await fetch(`${FUNCTIONS_URL}/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await tokenAtual()}` },
    body: JSON.stringify({ mensagem, conversa_id: conversaId ?? null }),
  })
  if (!r.ok) throw new Error(await erroDe(r, 'A assistente não respondeu.'))
  const j = await r.json()
  return { resposta: String(j.resposta || ''), conversaId: String(j.conversa_id) }
}

async function erroDe(r: Response, padrao: string): Promise<string> {
  try {
    const j = await r.json()
    return j.erro || j.message || padrao
  } catch {
    return padrao
  }
}

function blobParaBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result).split(',')[1] ?? '')
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}
