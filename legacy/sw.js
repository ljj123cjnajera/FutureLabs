// Service Worker para PWA
const CACHE_NAME = 'futurelabs-v1';
const urlsToCache = [
    '/',
    '/index.html',
  '/products.html',
  '/blog.html',
  '/about.html',
  '/contact.html',
  '/faq.html',
    '/css/style.css',
    '/css/responsive.css',
  '/css/notifications.css',
  '/css/autocomplete.css',
  '/css/related-products.css',
  '/css/comparator.css',
  '/js/api.js',
  '/js/auth.js',
    '/js/cart.js',
  '/js/notifications.js',
  '/js/modals.js',
  '/js/home.js',
  '/js/components.js',
  '/js/comparator.js',
  '/js/autocomplete.js',
  '/js/related-products.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
    caches.keys().then((cacheNames) => {
                return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
});

// Fetch from cache or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NO interceptar peticiones al backend (API)
  if (url.hostname === 'localhost' && url.port === '3000') {
    return; // Dejar pasar la petición directamente al backend
  }
  
  // NO interceptar peticiones a APIs externas
  if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    return; // Dejar pasar la petición directamente
  }
  
  // Solo cachear archivos estáticos
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Solo cachear archivos estáticos (HTML, CSS, JS, imágenes)
          const contentType = response.headers.get('content-type');
          if (contentType && (
            contentType.includes('text/html') ||
            contentType.includes('text/css') ||
            contentType.includes('application/javascript') ||
            contentType.includes('image/')
          )) {
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        });
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  console.log('Syncing cart...');
  // Implementar sincronización del carrito
}

// Push notifications
self.addEventListener('push', (event) => {
        const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
      primaryKey: 1
    }
        };
        
        event.waitUntil(
    self.registration.showNotification('FutureLabs', options)
        );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
        event.waitUntil(
            clients.openWindow('/')
        );
});




