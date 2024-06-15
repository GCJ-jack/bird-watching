
const CACHE_NAME = "app_cache_25";
const STATIC_ASSETS = [
  '/',
  '/add_sight',
  '/javascripts/add_bird.js',
  '/javascripts/bird_sight.js',
  '/javascripts/identify_bird_sight.js',
  '/javascripts/index.js',
  '/javascripts/index_db.js',
  '/stylesheets/style.css',
];

/**
 * Pre-cache the static assets
 */
async function preCache() {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(STATIC_ASSETS);
}

// Event listener for the 'activate' event
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(preCache());
});

async function cleanupCache() {
  const keys = await caches.keys();
  const keysToDelete = keys.map(key => {
    if (key !== CACHE_NAME) {
      return caches.delete(key);
    }
  });

  return Promise.all(keysToDelete);
}

self.addEventListener('activate', event => {
  event.waitUntil(cleanupCache())
})

/**
 * Fetch assets from cache or network
 * @param {FetchEvent} event - The fetch event
 * @returns {Promise<Response>}
 */
async function fetchAssets(event) {
  try {
    caches.match(event.request)
      .then(function (resp) {
        return resp || fetch(event.request).then(function (response) {
          return caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, response.clone());
            return response
          })
        })
      });
  } catch (err) {
    // Handle errors
  }

  try {
    // Try to fetch the request from the network
    const response = await fetch(event.request);
    return response;
  } catch (err) {
    // If network fetch fails, return the cached response
    const cache = await caches.open(CACHE_NAME);
    return cache.match(event.request);
  }
}

// Event listener for the 'fetch' event
self.addEventListener('fetch', async event => {
  // const requestUrl = new URL(event.request.url);
  //
  // // // Check if the request is for a bird page
  // // if (requestUrl.pathname.includes('/bird_sight')) {
  // //   const cache = await caches.open(CACHE_NAME);
  // //   return cache.add(requestUrl.pathname)
  // // }
  event.respondWith(fetchAssets(event))
})





