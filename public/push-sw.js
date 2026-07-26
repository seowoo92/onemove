// 오늘만큼 — 웹 푸시 전용 서비스 워커
// 캐싱은 하지 않는다(배포 갱신 문제 방지) — 푸시 수신과 알림 클릭 처리만 담당.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  const title = data.title || '오늘만큼'
  const options = {
    body: data.body || '',
    icon: './app-icon-192.png',
    badge: './app-icon-192.png',
    data: { url: data.url || './' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// 알림 탭 → 설치된 앱(PWA)/열린 탭으로 진입
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || './', self.registration.scope).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    }),
  )
})
