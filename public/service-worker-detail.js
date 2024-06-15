//define the cahce name and static assets
const CACHE_NAME = "app_cache_detail_2";
const STATIC_ASSETS = [];

/**
 * Pre-cache the static assets
 * @returns {Promise<void>}
 */
async function preCache() {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(STATIC_ASSETS);
}

// Event listener for the 'install' event
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(preCache());
});


/**
 * Cleanup old caches
 * @returns {Promise<void>}
 */
async function cleanupCache() {
  const keys = await caches.keys();
  const keysToDelete = keys.map(key => {
    if (key !== CACHE_NAME) {
      return caches.delete(key);
    }
  });

  return Promise.all(keysToDelete);
}

//Event listener for the 'active' event
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
    //fetch the request from the network
    const response = await fetch(event.request);
    return response;
  } catch (err) {
    //if network fetch fails,
    const cache = await caches.open(CACHE_NAME);
    return cache.match(event.request);
  }
}

self.addEventListener('fetch', async event => {
  const requestUrl = new URL(event.request.url);

  // Check if the request is for a bird page
  if (requestUrl.pathname.includes('/bird_sight')) {
    const cache = await caches.open(CACHE_NAME);
    return cache.add(requestUrl.pathname)
  }


  event.respondWith(fetchAssets(event))
})





