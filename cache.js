const CACHE_NAME = 'type-offline';

const OFFLINE_ASSETS = [
	'index.html',
	'style.css',
	'app.js',
	'manifest.webmanifest',
	'favicon.ico',
	'favicon-32x32.png',
	'favicon-16x16.png',
	'apple-touch-icon.png'
];

const OFFLINE_PATHS = new Set(OFFLINE_ASSETS.map((asset) => `/${asset.replace(/^\.\//, '')}`));

const isSameOriginGet = (request) => request.method === 'GET' && new URL(request.url).origin === self.location.origin;

const isCacheableRequest = (request) => {
	if (request.mode === 'navigate') {
		return true;
	}

	const url = new URL(request.url);
	return OFFLINE_PATHS.has(url.pathname);
};

self.addEventListener('install', (event) => {
	event.waitUntil((async () => {
		const cache = await caches.open(CACHE_NAME);
		await cache.addAll(OFFLINE_ASSETS);
	})());
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
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

const putInCache = async (request, response) => {
	if (!response || !response.ok || !isCacheableRequest(request)) {
		return;
	}

	const cache = await caches.open(CACHE_NAME);

	if (request.mode === 'navigate') {
		await cache.put('index.html', response.clone());
		return;
	}

	await cache.put(request, response.clone());
};

const fallbackFromCache = async (request) => {
	if (!isCacheableRequest(request)) {
		return null;
	}

	const cache = await caches.open(CACHE_NAME);
	if (request.mode === 'navigate') {
		return cache.match('index.html');
	}
	return cache.match(request);
};

self.addEventListener('fetch', (event) => {
	if (!isSameOriginGet(event.request) || !isCacheableRequest(event.request)) {
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
