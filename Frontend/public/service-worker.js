const CACHE_NAME = 'bloop-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon.svg',
  '/icons.svg'
];

// Install Event - Pre-cache critical static shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache store:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache-first with stale-while-revalidate for assets, network-first bypasses for WebRTC/Sockets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass socket connections and API requests so WebRTC, Socket.IO, and auth routes function normally
  if (
    request.url.includes('/socket.io') ||
    url.pathname.startsWith('/api') ||
    request.method !== 'GET'
  ) {
    return; // Let the browser fetch directly from network
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to keep cache fresh
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Silence network failures in background
          });
        return cachedResponse;
      }

      // Network first with cache fallback
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is HTML document, return index.html as fallback shell
          if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
    })
  );
});

// ==========================================
// PUSH NOTIFICATIONS & CALL SIGNALS
// ==========================================

// Handle push notification events from server
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received:', event);

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: 'Bloop Notification',
      body: event.data ? event.data.text() : 'You have a new message'
    };
  }

  const title = data.title || 'New Message from Bloop';
  const options = {
    body: data.body || 'You have received an incoming call or message.',
    icon: data.icon || '/icon-192.png',
    badge: '/favicon.ico',
    vibrate: data.type === 'call' ? [200, 100, 200, 100, 200, 100, 200] : [100, 50, 100],
    data: {
      url: data.url || '/chat',
      type: data.type // 'call' or 'message'
    },
    // For incoming call push: show action buttons directly in notification drawer
    actions: data.type === 'call' ? [
      { action: 'accept', title: 'Accept Call', icon: '/favicon.ico' },
      { action: 'decline', title: 'Decline', icon: '/favicon.ico' }
    ] : []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle user clicking the push notification banner or actions
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Find if we already have a window open for our app
      for (const client of clientList) {
        if (client.url.includes('/chat') || client.url.includes('/')) {
          if (action === 'accept') {
            client.postMessage({ type: 'CALL_NOTIFICATION_ACCEPT', data: notificationData });
          } else if (action === 'decline') {
            client.postMessage({ type: 'CALL_NOTIFICATION_DECLINE', data: notificationData });
          }
          return client.focus();
        }
      }
      
      // If no open client window, open a new one
      if (clients.openWindow) {
        const urlToOpen = notificationData.url || '/chat';
        return clients.openWindow(urlToOpen).then((newClient) => {
          if (newClient && action) {
            // Wait brief moment for client to initialize before posting messages
            setTimeout(() => {
              newClient.postMessage({ type: 'CALL_NOTIFICATION_ACTION', action, data: notificationData });
            }, 1000);
          }
        });
      }
    })
  );
});
