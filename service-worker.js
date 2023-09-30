// service-worker.js

// Define the name of your cache
const cacheName = 'skatehive-cache-v1';

// List of files to cache
const filesToCache = [
  '/',
  '/index.html',
  '/public/',
  '/assets/skatehive.jpeg', // Add paths to individual assets you want to cache
  // Include paths to other assets (images, stylesheets, scripts, etc.)
  // Add paths to all the files you want to cache
  // Include paths to other assets (images, stylesheets, scripts, etc.)
];

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Serve the cached response if available
      } else {
        return fetch(event.request)
          .then((fetchResponse) => {
            // Cache the fetched response for future use
            return caches.open(cacheName).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            throw error; // Rethrow the error to propagate it further
          });
      }
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