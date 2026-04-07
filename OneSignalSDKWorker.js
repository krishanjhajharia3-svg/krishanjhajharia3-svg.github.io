importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// ===== LEADO CRM Service Worker =====
let scheduledNotifs = {};

self.addEventListener('install', e => {
  console.log('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('[SW] Activate');
  e.waitUntil(self.clients.claim());
});

// App se message
self.addEventListener('message', e => {
  if(!e.data) return;
  
  if(e.data.type === 'SCHEDULE_NOTIFICATION'){
    const { leadId, title, body, scheduledTime } = e.data.data;
    const delay = scheduledTime - Date.now();
    
    console.log('[SW] Schedule karo:', leadId, 'delay:', Math.round(delay/1000)+'s');
    
    if(delay <= 0){
      // Abhi dikhao
      self.registration.showNotification(title, {
        body: body,
        icon: '/icon-192.png',
        tag: 'lead-'+leadId,
        requireInteraction: true,
        vibrate: [300, 100, 300],
        data: { leadId }
      });
      return;
    }
    
    // Cancel purana
    if(scheduledNotifs[leadId]) clearTimeout(scheduledNotifs[leadId]);
    
    // Schedule naya
    scheduledNotifs[leadId] = setTimeout(() => {
      self.registration.showNotification(title, {
        body: body,
        icon: '/icon-192.png',
        tag: 'lead-'+leadId,
        requireInteraction: true,
        vibrate: [300, 100, 300],
        data: { leadId }
      });
      delete scheduledNotifs[leadId];
      console.log('[SW] Notification shown:', leadId);
    }, delay);
  }
  
  if(e.data.type === 'CANCEL_NOTIFICATION'){
    if(scheduledNotifs[e.data.leadId]){
      clearTimeout(scheduledNotifs[e.data.leadId]);
      delete scheduledNotifs[e.data.leadId];
    }
  }
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const leadId = e.notification.data?.leadId;
  
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true})
      .then(clients => {
        for(let c of clients){
          if(c.url.includes('krishanjhajharia3-svg.github.io')){
            c.focus();
            if(leadId) c.postMessage({type:'OPEN_LEAD', leadId});
            return;
          }
        }
        return self.clients.openWindow('https://krishanjhajharia3-svg.github.io/');
      })
  );
});
