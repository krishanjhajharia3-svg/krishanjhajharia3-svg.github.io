// ============================================
// firebase-messaging-sw.js
// FCM Background Notifications — App band ho tab bhi aayegi!
// GitHub pe ROOT mein upload karo
// ============================================

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDUd4baHAJqsgjzod7wviM0TgLRR2ugNmg",
  authDomain: "leado-crm.firebaseapp.com",
  projectId: "leado-crm",
  storageBucket: "leado-crm.firebasestorage.app",
  messagingSenderId: "897766415254",
  appId: "1:897766415254:web:cc23a6ca9046ab7e97dbb7"
});

const messaging = firebase.messaging();

// App band ho tab bhi yeh fire hoga!
messaging.onBackgroundMessage(function(payload) {
  console.log('[FCM SW] Background message received!', payload);

  const title = (payload.notification && payload.notification.title)
    ? payload.notification.title
    : '📞 Leado — Follow-up Reminder';

  const body = (payload.notification && payload.notification.body)
    ? payload.notification.body
    : 'Aaj ke follow-ups pending hain!';

  const leadId = (payload.data && payload.data.leadId) ? payload.data.leadId : null;

  self.registration.showNotification(title, {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: leadId ? 'followup-' + leadId : 'leado-fcm',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      leadId: leadId,
      url: 'https://krishanjhajharia3-svg.github.io/'
    }
  });
});

// Notification click
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
