/**
 * Service worker do Diamond Lembretes.
 *
 * Faz TRÊS coisas:
 *  1. recebe push (lembrete vencido) e mostra a notificação;
 *  2. clique na notificação abre/foca o app;
 *  3. serve o app offline (app shell em cache).
 *
 * A estratégia de cache foi escolhida pra NÃO prender ninguém em versão velha
 * — o medo legítimo que mantinha este SW sem cache até agora:
 *  • **HTML/navegação: rede primeiro.** Com internet, sempre a versão nova.
 *    O cache do index só entra em cena quando a rede falhou de verdade.
 *  • **Assets com hash no nome (/assets/index-AbC123.js): cache primeiro.**
 *    O nome muda a cada build, então cache velho nunca é servido pra código
 *    novo — o index novo simplesmente pede outro arquivo.
 *  • **API do Supabase: nunca cacheada.** Dado fresco é problema da camada
 *    offline do app (lib/offline.ts), que sabe o que é fila e o que é cache.
 */
const CACHE = 'diamond-lembretes-v1'
const ESSENCIAIS = ['/', '/index.html', '/manifest.webmanifest', '/icon-diamond.svg', '/favicon.png']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ESSENCIAIS)).catch(() => {}).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (evento) => {
  const req = evento.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // Supabase/OpenAI passam direto

  // Navegação: rede primeiro, cache como rede de segurança.
  if (req.mode === 'navigate') {
    evento.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put('/index.html', copia)).catch(() => {})
          return r
        })
        .catch(() => caches.match('/index.html').then((r) => r || Response.error()))
    )
    return
  }

  // Estáticos: cache primeiro (nome com hash torna isto seguro).
  evento.respondWith(
    caches.match(req).then((emCache) => {
      if (emCache) return emCache
      return fetch(req).then((r) => {
        if (r.ok && (url.pathname.startsWith('/assets/') || ESSENCIAIS.includes(url.pathname))) {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {})
        }
        return r
      })
    })
  )
})

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
