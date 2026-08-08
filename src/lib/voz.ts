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
export async function falar(texto: string): Promise<HTMLAudioElement> {
  const r = await fetch(`${FUNCTIONS_URL}/voz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await tokenAtual()}` },
    body: JSON.stringify({ acao: 'tts', texto }),
  })
  if (!r.ok) throw new Error(await erroDe(r, 'Não consegui gerar a fala.'))
  const { audio_b64 } = await r.json()
  const audio = new Audio(`data:audio/mp3;base64,${audio_b64}`)
  return audio
}

/** Conversa com a assistente (Edge Function `ai-chat`, com as ferramentas). */
export async function conversar(mensagem: string): Promise<string> {
  const r = await fetch(`${FUNCTIONS_URL}/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await tokenAtual()}` },
    body: JSON.stringify({ mensagem }),
  })
  if (!r.ok) throw new Error(await erroDe(r, 'A assistente não respondeu.'))
  const { resposta } = await r.json()
  return String(resposta || '')
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
