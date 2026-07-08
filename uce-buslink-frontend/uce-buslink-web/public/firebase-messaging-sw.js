self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('notificationclick', (event) => {
  const url =
    event.notification.data?.FCM_MSG?.data?.url ??
    event.notification.data?.url;

  if (!url) return;

  event.stopImmediatePropagation();
  event.notification.close();

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = windows.find((w) => 'focus' in w);
    if (client) {
      await client.focus();
      client.postMessage({ type: 'PUSH_NAVIGATE', url });
    } else {
      await clients.openWindow(url);
    }
  })());
});

importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

firebase.messaging();
