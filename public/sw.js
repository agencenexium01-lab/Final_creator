// Service worker de Creator Booster IA.
// Rôle volontairement limité : afficher une page « Pas de connexion » quand le réseau coupe.
// Aucune mise en cache des pages ou des fichiers du site : chaque mise en ligne est visible immédiatement.
const CACHE = 'cb-offline-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' }))));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  // Seulement la navigation entre pages ; tout le reste (API, images, scripts) passe sans intervention.
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
  );
});
