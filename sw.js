const CACHE = 'buget-v5';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'stats.js', 'manifest.webmanifest', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('/exec')) return;           // API calls always go to the network
  // cache first, refreshed in the background: the app opens instantly, updates arrive on the next open
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => { if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; });
    return hit ? (net.catch(() => {}), hit) : net.catch(() => caches.match('index.html'));
  }));
});
