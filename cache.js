const CACHE_NAME = 'type-runtime-v2';

const isSameOriginGet = (request) => request.method === 'GET' && new URL(request.url).origin === self.location.origin;

self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil((async () => {
		const names = await caches.keys();
		await Promise.all(
			names
				.filter((name) => name.startsWith('type-') && name !== CACHE_NAME)
				.map((name) => caches.delete(name))
		);
		await self.clients.claim();
	})());
});

self.addEventListener('message', (event) => {
	// Matches app.js postMessage(1): opcode `1` means "skip waiting".
	if (event.data === 1) {
		self.skipWaiting();
	}
});

const putInCache = async (request, response) => {
	if (!response || !response.ok) {
		return;
	}

	const cache = await caches.open(CACHE_NAME);

	if (request.mode === 'navigate') {
		await cache.put(request, response.clone());
		await cache.put('index.html', response.clone());
		return;
	}

	await cache.put(request, response.clone());
};

const fallbackFromCache = async (request) => {
	const cache = await caches.open(CACHE_NAME);
	if (request.mode === 'navigate') {
		const exactMatch = await cache.match(request);
		if (exactMatch) {
			return exactMatch;
		}
		return cache.match('index.html');
	}
	return cache.match(request);
};

self.addEventListener('fetch', (event) => {
	if (!isSameOriginGet(event.request)) {
		return;
	}

	event.respondWith((async () => {
		try {
			const networkResponse = await fetch(event.request, { cache: 'no-cache' });
			await putInCache(event.request, networkResponse);
			return networkResponse;
		} catch {
			const cached = await fallbackFromCache(event.request);
			return cached || Response.error();
		}
	})());
});
