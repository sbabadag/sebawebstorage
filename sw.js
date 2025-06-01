// Service Worker for SEBA Engineering Website
const CACHE_NAME = 'seba-engineering-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/projects.html',
  '/blog.html',
  '/contact.html',
  '/faq.html',
  '/manifest.json',
  '/assets/css/style.css',
  '/assets/css/social-share.css',
  '/assets/css/newsletter.css',  '/assets/css/responsive.css',
  '/assets/css/faq.css',
  '/assets/js/script.js',
  '/assets/js/translations.js',
  '/assets/js/language-init.js',
  '/assets/js/language-enhancer.js', 
  '/assets/js/language-diagnostic.js',
  '/assets/js/force-language-update.js',
  '/assets/js/social-share.js',
  '/assets/js/newsletter.js',
  '/assets/images/favicon.ico',
  '/assets/images/c4cc46a6-6116-4478-a979-e9f52d58f29e.JPEG',
  '/assets/images/2314f2e2-5780-43fc-b952-8a26e76e4b34.JPEG',
  '/assets/images/2786a985-ea94-4cd2-83bc-b427783e80ca.JPEG',
  '/assets/images/36e738dd-a3e4-40b0-bb24-8d332f238fa1.JPEG',
  '/assets/images/c7e4a198-4281-433f-934b-849b7c907062.JPEG'
];

// Install Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache opened');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Don't cache API requests or external resources
                if (!event.request.url.includes('googleanalytics') && 
                    !event.request.url.includes('googleapis') &&
                    event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          }
        );
      })
  );
});

// Update a service worker
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
