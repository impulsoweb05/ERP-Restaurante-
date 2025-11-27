// ═══════════════════════════════════════════════════════════════════════════
// SERVICE WORKER - PWA Cliente Restaurante
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const IMAGES_CACHE = `images-cache-${CACHE_VERSION}`;

// Assets estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app.js',
  '/api.js',
  '/auth.js',
  '/menu3d.js',
  '/cart.js',
  '/styles.css'
];

// Endpoints de API que se pueden cachear
const CACHEABLE_API_ENDPOINTS = [
  '/api/menu',
  '/api/menu/categories',
  '/api/schedule/is-open'
];

// IndexedDB para pedidos pendientes
const DB_NAME = 'RestauranteClienteDB';
const DB_VERSION = 1;
const PENDING_ORDERS_STORE = 'pendingOrders';

// ═══════════════════════════════════════════════════════════════════════════
// INSTALL EVENT - Cachear assets estáticos
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVATE EVENT - Limpiar cachés antiguos
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('static-cache-') ||
                     name.startsWith('api-cache-') ||
                     name.startsWith('images-cache-');
            })
            .filter((name) => {
              return !name.endsWith(CACHE_VERSION);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// FETCH EVENT - Estrategias de caché
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determinar estrategia según el tipo de request
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request, url));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ESTRATEGIAS DE CACHÉ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detectar si es una request API
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

/**
 * Detectar si es una request de imagen (incluyendo Unsplash)
 */
function isImageRequest(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  // Use strict hostname check for Unsplash to prevent hostname spoofing
  const isUnsplash = url.hostname === 'unsplash.com' || 
                     url.hostname === 'images.unsplash.com' ||
                     url.hostname.endsWith('.unsplash.com');
  const hasImageExtension = imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
  
  return isUnsplash || hasImageExtension;
}

/**
 * Network First para datos de API (pedidos, disponibilidad en tiempo real)
 * Con fallback a caché para endpoints cacheables
 */
async function handleAPIRequest(request, url) {
  const isCacheableEndpoint = CACHEABLE_API_ENDPOINTS.some(endpoint => 
    url.pathname === endpoint || url.pathname.startsWith(endpoint)
  );

  try {
    const response = await fetch(request);
    
    if (response.ok && isCacheableEndpoint) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', url.pathname);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Devolver respuesta de error para API
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'No hay conexión a internet',
        offline: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache First para imágenes (incluyendo Unsplash)
 */
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(IMAGES_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Failed to fetch image:', request.url);
    // Retornar placeholder o respuesta vacía
    return new Response('', { status: 404 });
  }
}

/**
 * Stale While Revalidate para assets estáticos
 */
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cachedResponse || fetchPromise || caches.match('/index.html');
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND SYNC - Sincronización de pedidos offline
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

/**
 * Sincronizar pedidos pendientes con el servidor
 */
async function syncPendingOrders() {
  console.log('[SW] Syncing pending orders...');
  
  const db = await openDB();
  const pendingOrders = await getAllPendingOrders(db);
  
  for (const order of pendingOrders) {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${order.token}`
        },
        body: JSON.stringify(order.data)
      });
      
      if (response.ok) {
        await deleteOrder(db, order.id);
        
        // Notificar al cliente
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'ORDER_SYNCED',
            orderId: order.id,
            success: true
          });
        });
        
        console.log('[SW] Order synced successfully:', order.id);
      }
    } catch (error) {
      console.error('[SW] Failed to sync order:', order.id, error);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INDEXED DB HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(PENDING_ORDERS_STORE)) {
        db.createObjectStore(PENDING_ORDERS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllPendingOrders(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PENDING_ORDERS_STORE, 'readonly');
    const store = transaction.objectStore(PENDING_ORDERS_STORE);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteOrder(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PENDING_ORDERS_STORE, 'readwrite');
    const store = transaction.objectStore(PENDING_ORDERS_STORE);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLER - Comunicación con el cliente
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SAVE_PENDING_ORDER') {
    savePendingOrder(event.data.order, event.data.token)
      .then(() => {
        event.ports[0]?.postMessage({ success: true });
      })
      .catch((error) => {
        event.ports[0]?.postMessage({ success: false, error: error.message });
      });
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function savePendingOrder(orderData, token) {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PENDING_ORDERS_STORE, 'readwrite');
    const store = transaction.objectStore(PENDING_ORDERS_STORE);
    const request = store.add({
      data: orderData,
      token: token,
      timestamp: Date.now(),
      status: 'pending_sync'
    });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (para futuras implementaciones)
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Restaurante', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(urlToOpen);
      })
  );
});
