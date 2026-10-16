// Service worker - Mapa CORE. Cambiar VERSION fuerza la actualización del caché.
const VERSION = 'core-v1';
const SHELL = `${VERSION}-shell`;
const DATA = `${VERSION}-data`;
const SHELL_FILES = ['./', 'index.html', 'app.js', 'logo_data.js', 'logo.ico', 'mobile.css', 'mobile.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => Promise.all(SHELL_FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const isShell = url => /\/(index\.html|app\.js|mobile\.js|mobile\.css|logo_data\.js|manifest\.webmanifest)?$/.test(url.pathname);

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Nunca cachear: API privada, teselas del mapa, geocodificación
  if (url.pathname.startsWith('/api/') || url.hostname.endsWith('cartocdn.com') ||
      url.hostname.includes('nominatim') || url.hostname.includes('overpass')) return;

  const sameOrigin = url.origin === location.origin;
  if (sameOrigin && (req.mode === 'navigate' || isShell(url))) {
    // Cáscara: primero red, caché si no hay conexión
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(SHELL).then(ch => ch.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  // Datos pesados y librerías CDN: caché primero, se actualiza en segundo plano
  e.respondWith(caches.open(DATA).then(async ch => {
    const hit = await ch.match(req);
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) ch.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
