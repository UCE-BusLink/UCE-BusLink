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

firebase.initializeApp({
  apiKey: "AIzaSyAF7aa6E8zfX1HSbj3cRiYIFRmH0U1YsVE",
  authDomain: "uce-buslink.firebaseapp.com",
  projectId: "uce-buslink",
  storageBucket: "uce-buslink.firebasestorage.app",
  messagingSenderId: "679640129459",
  appId: "1:679640129459:web:5cc1097c19b5fe910635c6"
});

firebase.messaging();
