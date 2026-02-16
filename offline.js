(() => {
	const isServiceWorkerContext =
		typeof ServiceWorkerGlobalScope !== 'undefined' &&
		self instanceof ServiceWorkerGlobalScope;

	if (!isServiceWorkerContext) {
		if (!('serviceWorker' in navigator)) {
			return;
		}

		const workerUrl = document.currentScript?.src || new URL('offline.js', window.location.href).href;
		void navigator.serviceWorker.register(workerUrl).catch(() => {});
		return;
	}

	const CACHE_NAME = 'offline-runtime-v1';

	const isSameOriginGet = (request) =>
		request.method === 'GET' &&
		new URL(request.url).origin === self.location.origin;

	self.addEventListener('install', () => {
		self.skipWaiting();
	});

	self.addEventListener('activate', (event) => {
		event.waitUntil(self.clients.claim());
	});

	self.addEventListener('fetch', (event) => {
		if (!isSameOriginGet(event.request)) {
			return;
		}

		event.respondWith((async () => {
			try {
				const networkResponse = await fetch(event.request, { cache: 'no-cache' });
				if (networkResponse.ok) {
					const cache = await caches.open(CACHE_NAME);
					await cache.put(event.request, networkResponse.clone());
				}
				return networkResponse;
			} catch {
				const cache = await caches.open(CACHE_NAME);
				const cached = await cache.match(event.request);
				return cached || Response.error();
			}
		})());
	});
})();
