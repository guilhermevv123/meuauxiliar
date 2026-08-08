import { supabase } from '@/integrations/supabase/client'

/**
 * Notificações push. O caminho inteiro:
 *  1. o navegador assina com a chave VAPID pública (abaixo — é pública mesmo);
 *  2. a inscrição vai pra tabela `push_subscriptions` (uma por aparelho);
 *  3. um cron no banco roda a cada minuto e dispara a Edge Function
 *     `push-lembretes`, que empurra a notificação dos lembretes vencidos.
 *
 * iPhone: push de site SÓ funciona com o app instalado pela tela de início
 * (Compartilhar → Adicionar à Tela de Início, iOS 16.4+). A mensagem de erro
 * explica isso em vez de só falhar.
 */
const CHAVE_PUBLICA_VAPID =
  'BJMYLoLojp8vsrdX-rPDBAvqeghN9T5BJT19TEx4CpFb0LJCGnum_lVChbadbr5G4bvJulJRjcSGEe0vrZY_nPc'

function b64UrlParaBytes(b64url: string): Uint8Array {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4)
  const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

const ehIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const instaladoComoApp = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true

/** Já existe inscrição de push neste aparelho? (null = ainda apurando) */
export async function statusNotificacoes(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    const reg = await navigator.serviceWorker.ready
    return !!(await reg.pushManager.getSubscription())
  } catch {
    return false
  }
}

/** Pede permissão, assina e grava no banco. Lança erro com mensagem clara. */
export async function ativarNotificacoes(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    if (ehIos() && !instaladoComoApp()) {
      throw new Error(
        'No iPhone: toque em Compartilhar → "Adicionar à Tela de Início" e ative por lá — o iOS só permite notificação de app instalado.'
      )
    }
    throw new Error('Este navegador não suporta notificações push.')
  }
  if (ehIos() && !instaladoComoApp()) {
    throw new Error(
      'Instale primeiro: Compartilhar → "Adicionar à Tela de Início". Depois abra pelo ícone e ative aqui.'
    )
  }

  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') {
    throw new Error('Permissão negada — libere as notificações nas configurações do navegador.')
  }

  const reg = await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64UrlParaBytes(CHAVE_PUBLICA_VAPID) as unknown as BufferSource,
    }))

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sessão expirada — entre de novo.')

  const json = sub.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('Inscrição de push incompleta — tente de novo.')
  }

  // upsert por endpoint: reativar no mesmo aparelho não duplica linha
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: auth.user.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      { onConflict: 'endpoint' }
    )
  if (error) throw new Error('Não consegui salvar a inscrição: ' + error.message)
}
