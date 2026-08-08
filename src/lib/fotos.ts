import { supabase } from '@/integrations/supabase/client'

/**
 * Fotos de notas/lembretes no bucket privado `anexos`.
 *
 * O arquivo é sempre gravado em `<user_id>/<uuid>.<ext>` — a RLS do Storage
 * (política anexos_dono) só deixa cada um mexer na própria pasta, então mesmo
 * um caminho forjado não alcança a foto de outro.
 *
 * O bucket é PRIVADO: a leitura usa URL assinada de curta duração, não um link
 * público — foto pessoal não fica exposta na internet.
 */

/** Reduz a imagem no navegador antes de subir (economia de banda e Storage). */
async function comprimir(file: File, maxLado = 1280, qualidade = 0.82): Promise<Blob> {
  // Sem canvas (svg/gif) ou arquivo pequeno: sobe como está.
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * escala)
  const h = Math.round(bitmap.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, w, h)
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', qualidade)
  )
}

/** Sobe a foto e devolve o CAMINHO (não a URL) — é o que vai no banco. */
export async function subirFoto(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sessão expirada — entre de novo.')
  const blob = await comprimir(file)
  const caminho = `${auth.user.id}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('anexos').upload(caminho, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw new Error('Não consegui enviar a foto: ' + error.message)
  return caminho
}

/** Caminho → URL assinada (1h) pra exibir. Cacheada em memória por sessão. */
const _cacheUrl = new Map<string, { url: string; exp: number }>()
export async function urlDaFoto(caminho: string | null | undefined): Promise<string | null> {
  if (!caminho) return null
  const agora = Date.now()
  const hit = _cacheUrl.get(caminho)
  if (hit && hit.exp > agora) return hit.url
  const { data, error } = await supabase.storage.from('anexos').createSignedUrl(caminho, 3600)
  if (error || !data) return null
  _cacheUrl.set(caminho, { url: data.signedUrl, exp: agora + 55 * 60_000 })
  return data.signedUrl
}

/** Apaga a foto do Storage (ao remover a foto de uma nota/lembrete). */
export async function apagarFoto(caminho: string | null | undefined): Promise<void> {
  if (!caminho) return
  await supabase.storage.from('anexos').remove([caminho]).catch(() => {})
  _cacheUrl.delete(caminho)
}
