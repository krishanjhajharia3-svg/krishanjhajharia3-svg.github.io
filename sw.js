const CACHE_NAME = 're-diary-v3-' + Date.now();
const urlsToCache = [
  './',
  './index.html'
];

// Install - cache files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate - delete ALL old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - network first, then cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200) return response;
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
// Scheduled notifications handle karo
const scheduledNotifications = new Map();

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const data = event.data.data;
    const delay = data.scheduledTime - Date.now();
    
    if (delay <= 0) return;
    
    // Purani notification clear karo
    if (scheduledNotifications.has(data.leadId)) {
      clearTimeout(scheduledNotifications.get(data.leadId));
    }
    
    // Naya schedule karo
    const timerId = setTimeout(function() {
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
    console.log('[SW] Notification scheduled for lead:', data.leadId);
  }
});

// Notification click handle karo
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://krishanjhajharia3-svg.github.io')
  );
});
