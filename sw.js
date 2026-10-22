// Cambiamos a v2 para obligar a los teléfonos/navegadores a actualizar
const CACHE_NAME = 'dash-delivery-v24';

// Archivos a guardar en la caché (incluyendo las nuevas carpetas)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icono-192.png',
  './icono-512.png',
  './css/styles.css',
  './js/main.js' // Ajusta el nombre si tu archivo dentro de js/ se llama distinto
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar el Service Worker y borrar la caché v1 anterior
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Responder peticiones web (Estrategia Network First con fallback a Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si hay conexión a internet, devuelve la versión más reciente y la guarda en caché
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si el usuario no tiene internet, usa la versión guardada
        return caches.match(event.request);
      })
  );
});