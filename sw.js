const CACHE_NAME = 're-diary-v4';
const urlsToCache = ['./', './index.html'];

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(name => {
        if (name !== CACHE_NAME) return caches.delete(name);
      })
    )).then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ✅ PUSH — App band ho tab bhi kaam karta hai!
self.addEventListener('push', function(event) {
  console.log('[SW] Push received!');

  let title = '🔔 Leado — Follow-up Reminder';
  let body = 'Aaj ke follow-ups pending hain!';
  let leadId = null;

  try {
    if (event.data) {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      leadId = data.leadId || null;
    }
  } catch(e) {
    if (event.data) body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: leadId ? 'followup-' + leadId : 'leado-notif',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: { leadId: leadId, url: 'https://krishanjhajharia3-svg.github.io/' }
    })
  );
});

// ✅ NOTIFICATION CLICK
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : 'https://krishanjhajharia3-svg.github.io/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let client of clientList) {
          if (client.url.includes('krishanjhajharia3-svg') && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

// ✅ MESSAGE (app open ho tab ke liye backup)
const scheduledNotifications = new Map();

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const data = event.data.data;
    const delay = data.scheduledTime - Date.now();
    if (delay <= 0) return;
    if (scheduledNotifications.has(data.leadId)) {
      clearTimeout(scheduledNotifications.get(data.leadId));
    }
    const timerId = setTimeout(() => {
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'followup-' + data.leadId,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: { leadId: data.leadId }
      });
    }, delay);
    scheduledNotifications.set(data.leadId, timerId);
  }
});
