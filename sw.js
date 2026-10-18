// sw.js — v11 cinematic. Cache jj-v16.
var CACHE = 'jj-v16';
var STATIC = [
  './',
  './index.html',
  './404.html',
  './css/style.css',
  './js/main.js',
  './fonts/space-grotesk-var.woff2',
  './fonts/jetbrains-mono-var.woff2',
  './fonts/noto-sans-devanagari.woff2',
  './assets/icon-32.png',
  './assets/icon-512.png',
  './manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(STATIC.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return res;
      });
    }).catch(function () {
      if (e.request.mode === 'navigate') return caches.match('./404.html');
    })
  );
});
