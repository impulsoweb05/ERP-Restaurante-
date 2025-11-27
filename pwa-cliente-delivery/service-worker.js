// ═══════════════════════════════════════════════════════════════════════════
// Service Worker - PWA Cliente Delivery
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `delivery-static-${CACHE_VERSION}`;
const API_CACHE = `delivery-api-${CACHE_VERSION}`;
const IMAGES_CACHE = `delivery-images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app.js',
  '/api.js',
  '/auth.js',
  '/cart.js',
  '/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const API_ENDPOINTS = [
  '/api/menu',
  '/api/menu/categories'
];

// ═══════════════════════════════════════════════════════════════════════════
// INSTALL
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVATE
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('delivery-') && !key.endsWith(CACHE_VERSION))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// FETCH
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests del mismo origen
  if (url.origin !== self.location.origin) {
    // Cache First para imágenes externas
    if (isImageRequest(url)) {
      event.respondWith(handleImageRequest(request));
    }
    return;
  }
  
  // API requests - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
  
  // Static assets - Cache First
  event.respondWith(handleStaticRequest(request));
});

// ═══════════════════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

async function handleAPIRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok && isCacheableAPI(request.url)) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    return new Response(JSON.stringify({ error: 'Offline' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback a index.html para navegación SPA
    const fallback = await caches.match('/index.html');
    if (fallback) return fallback;
    
    return new Response('Offline', { status: 503 });
  }
}

async function handleImageRequest(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(IMAGES_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function isImageRequest(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const isUnsplash = url.hostname === 'unsplash.com' || 
                     url.hostname === 'images.unsplash.com' ||
                     url.hostname.endsWith('.unsplash.com');
  
  return isUnsplash || imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

function isCacheableAPI(url) {
  return API_ENDPOINTS.some(endpoint => url.includes(endpoint));
}
