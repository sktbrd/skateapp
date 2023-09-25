// service-worker.js

// Define the name of your cache
const cacheName = 'skatehive-cache-v1';

// List of files to cache
const filesToCache = [
  '/',
  '/index.html',
  '/public/',
  '/assets/skatehive-logo.png', // Add paths to individual assets you want to cache
  // Include paths to other assets (images, stylesheets, scripts, etc.)
  // Add paths to all the files you want to cache
  // Include paths to other assets (images, stylesheets, scripts, etc.)
];

// Install event: Cache all the necessary assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

// Fetch event: Serve cached content or fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});