// Edge Function `voz` — ouvido e boca da assistente.
//
//  stt: áudio do navegador → gpt-4o-mini-transcribe → texto (pt-BR)
//  tts: texto → gpt-4o-mini-tts, voz "coral" → mp3 base64
//
// Mesmos modelos e mesma voz do assistente Diamond de mesa (jarvis): quem usa
// os dois ouve a MESMA assistente. A chave da OpenAI só existe aqui.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const VOZ = 'coral'
const LIMITE_AUDIO_BYTES = 8 * 1024 * 1024 // ~8MB ≈ minutos de fala; segura abuso
const LIMITE_TTS_CHARS = 1200

function b64ParaBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function bytesParaB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  const bloco = 0x8000
  for (let i = 0; i < bytes.length; i += bloco) {
    bin += String.fromCharCode(...bytes.subarray(i, i + bloco))
  }
  return btoa(bin)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY não configurada')

    // Login obrigatório: sem isso o endpoint viraria TTS grátis pra internet
    // inteira pagando com a chave do dono.
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )
    const { data: auth } = await sb.auth.getUser()
    if (!auth.user) return Response.json({ erro: 'Não autenticado' }, { status: 401, headers: CORS })

    const corpo = await req.json()

    if (corpo.acao === 'stt') {
      const bytes = b64ParaBytes(String(corpo.audio_b64 || ''))
      if (!bytes.length) return Response.json({ erro: 'áudio vazio' }, { status: 400, headers: CORS })
      if (bytes.length > LIMITE_AUDIO_BYTES) {
        return Response.json({ erro: 'Áudio longo demais.' }, { status: 413, headers: CORS })
      }
      const mime = String(corpo.mime || 'audio/webm')
      // A extensão precisa bater com o CONTEÚDO: a OpenAI valida o container e
      // rejeita um RIFF/WAV chamado .webm (foi um bug real — o app desktop
      // manda wav e todo STT dele voltava "não consegui transcrever").
      const ext = mime.includes('mp4') ? 'mp4'
        : mime.includes('mpeg') ? 'mp3'
        : mime.includes('wav') ? 'wav'
        : mime.includes('ogg') ? 'ogg'
        : 'webm'
      const fd = new FormData()
      fd.append('file', new Blob([bytes.buffer as ArrayBuffer], { type: mime }), `fala.${ext}`)
      fd.append('model', 'gpt-4o-mini-transcribe')
      fd.append('language', 'pt')
      const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_KEY}` },
        body: fd,
      })
      if (!r.ok) {
        console.error('[voz stt]', r.status, (await r.text()).slice(0, 300))
        throw new Error('Não consegui transcrever o áudio.')
      }
      const dados = await r.json()
      return Response.json({ texto: dados.text ?? '' }, { headers: CORS })
    }

    if (corpo.acao === 'tts') {
      const texto = String(corpo.texto || '').slice(0, LIMITE_TTS_CHARS)
      if (!texto.trim()) return Response.json({ erro: 'texto vazio' }, { status: 400, headers: CORS })
      const r = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          voice: VOZ,
          input: texto,
          response_format: 'mp3',
          // Fala mais ágil — a voz padrão soa arrastada para uso de assistente.
          // 1.18 acelera sem virar "chipmunk". O front pode mandar outro valor.
          speed: typeof corpo.speed === 'number' ? Math.min(2, Math.max(0.5, corpo.speed)) : 1.25,
        }),
      })
      if (!r.ok) {
        console.error('[voz tts]', r.status, (await r.text()).slice(0, 300))
        throw new Error('Não consegui gerar a fala.')
      }
      return Response.json({ audio_b64: bytesParaB64(await r.arrayBuffer()) }, { headers: CORS })
    }

    return Response.json({ erro: 'acao deve ser stt ou tts' }, { status: 400, headers: CORS })
  } catch (e) {
    console.error('[voz]', e)
    return Response.json({ erro: (e as Error).message || 'Erro interno' }, { status: 500, headers: CORS })
  }
})
