const CACHE_NAME = 'storify-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/services/supabaseService.ts',
  '/components/AddNovel.tsx',
  '/components/Achievements.tsx',
  '/components/BookDetails.tsx',
  '/components/BottomNavBar.tsx',
  '/components/ChatInterface.tsx',
  '/components/JournalView.tsx',
  '/components/LoginScreen.tsx',
  '/components/StoryView.tsx',
  '/components/ThemeToggle.tsx',
  '/components/TopHeader.tsx',
  '/components/Typewriter.tsx',
  '/components/UserStoryView.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap',
  'https://unpkg.com/systemjs@6.15.1/dist/s.min.js',
  'https://unpkg.com/systemjs-plugin-babel@latest/plugin-babel.js',
  'https://unpkg.com/systemjs-plugin-babel@latest/systemjs-babel-browser.js',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/@supabase/supabase-js@2.45.0',
  '/manifest.webmanifest',
  '/pwa/icons/icon-192.svg',
  '/pwa/icons/icon-512.svg',
  '/pwa/icons/maskable-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add all URLs to cache, but don't fail the install if one of them fails
        // This is safer for external resources
        const promises = urlsToCache.map(url => {
            return cache.add(url).catch(err => {
                console.warn(`Failed to cache ${url}:`, err);
            });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }
            // We don't cache POST requests or chrome extensions
            if(response.type !== 'basic' && response.type !== 'cors') {
                return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
