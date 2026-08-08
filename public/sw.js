/**
 * Service worker do Meu Auxiliar.
 *
 * Faz DUAS coisas e mais nada:
 *  1. recebe push (lembrete vencido) e mostra a notificação;
 *  2. clique na notificação abre/foca o app.
 *
 * Sem cache de rede de propósito: SPA pequena atrás de CDN do GitHub Pages —
 * um cache mal invalidado aqui significaria usuário preso em versão velha,
 * que é exatamente a classe de bug mais difícil de suportar à distância.
 */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (evento) => {
  let dados = { titulo: 'Meu Auxiliar', corpo: 'Você tem um lembrete.', url: '/' }
  try {
    dados = { ...dados, ...evento.data.json() }
  } catch {
    /* payload fora do padrão: mostra o genérico */
  }
  evento.waitUntil(
    self.registration.showNotification(dados.titulo, {
      body: dados.corpo,
      icon: '/apple-touch-icon.png',
      badge: '/favicon.png',
      data: { url: dados.url },
      tag: dados.tag || undefined, // lembrete repetido substitui o aviso anterior
    })
  )
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const url = evento.notification.data?.url || '/'
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      for (const j of janelas) {
        if ('focus' in j) {
          j.navigate(url)
          return j.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
