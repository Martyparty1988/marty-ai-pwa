const CACHE_NAME = 'marty-ai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache-first for static assets, network-first for API calls
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // For API calls, use network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  } 
  // For iCal URLs, use stale-while-revalidate
  else if (url.pathname.includes('ical')) {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
  // For static assets, use cache-first strategy
  else {
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Cache-first strategy for static assets
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then(response => {
        // Cache the response if it's valid
        if (response && response.status === 200 && response.type === 'basic') {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clonedResponse);
          });
        }
        
        return response;
      }).catch(() => {
        // If fetch fails (offline), return the offline page
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    });
}

// Network-first strategy for API calls
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      const clonedResponse = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, clonedResponse);
      });
      
      return response;
    })
    .catch(() => {
      return caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return new Response(JSON.stringify({ error: 'Network error' }), {
          status: 408,
          headers: { 'Content-Type': 'application/json' }
        });
      });
    });
}

// Stale-while-revalidate strategy for iCal and other frequently updated resources
function staleWhileRevalidateStrategy(request) {
  return caches.open(CACHE_NAME).then(cache => {
    return cache.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      });
      
      return cachedResponse || fetchPromise;
    });
  });
}

// Background sync for tasks
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  } else if (event.tag === 'sync-ical') {
    event.waitUntil(syncIcal());
  }
});

// Function to sync tasks when online
function syncTasks() {
  return self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      // Get pending tasks from IndexedDB
      return getTasksFromIndexedDB().then(pendingTasks => {
        if (pendingTasks.length === 0) return;
        
        // Send tasks to server
        return fetch('/api/tasks/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks: pendingTasks })
        })
        .then(response => response.json())
        .then(data => {
          // Notify client that tasks were synced
          client.postMessage({
            type: 'TASKS_SYNCED',
            tasks: data
          });
          
          // Clear pending tasks
          return clearPendingTasks();
        });
      });
    });
  });
}

// Function to sync iCal calendars
function syncIcal() {
  return getIcalUrlsFromStorage().then(urls => {
    if (!urls || !urls.length) return;
    
    const promises = urls.map(url => 
      fetch(url).then(response => response.text())
    );
    
    return Promise.all(promises).then(results => {
      // Process iCal data
      return processIcalData(results);
    });
  });
}

// Placeholder functions for IndexedDB operations
function getTasksFromIndexedDB() {
  return Promise.resolve([]);
}

function clearPendingTasks() {
  return Promise.resolve();
}

function getIcalUrlsFromStorage() {
  return Promise.resolve([]);
}

function processIcalData(data) {
  return Promise.resolve();
}

// Push notification event handler
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        // Check if a window is already open
        for (const client of clients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});