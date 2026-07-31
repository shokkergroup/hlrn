"use strict";

var CACHE = "hlrn-shell-v1";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/data.js",
  "./assets/data-sources.js",
  "./assets/data-moments.js",
  "./assets/data-official.js",
  "./assets/official-ui.js",
  "./assets/analytics.js",
  "./assets/media/hlrn-avatar.jpg",
  "./assets/og-hlrn-living-wiki.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key.indexOf("hlrn-") === 0 && key !== CACHE; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
      return response;
    }).catch(function () { return caches.match(event.request).then(function (response) { return response || caches.match("./index.html"); }); }));
    return;
  }
  if (/\.(?:jpg|jpeg|png|webp|woff2?)$/i.test(url.pathname)) {
    event.respondWith(caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (response.ok) caches.open(CACHE).then(function (cache) { cache.put(event.request, response.clone()); });
        return response;
      });
    }));
    return;
  }
  event.respondWith(fetch(event.request).then(function (response) {
    if (response.ok) caches.open(CACHE).then(function (cache) { cache.put(event.request, response.clone()); });
    return response;
  }).catch(function () { return caches.match(event.request); }));
});
