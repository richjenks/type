// Cache name (increment to invalidate)
const CACHE = 'type-v10';

// Files to cache (relative to SW scope)
const ASSETS = [
	'index.html',
	'style.css',
	'app.js',
	'favicon.ico',
	'favicon.png',
	'favicon-16x16.png',
	'favicon-32x32.png',
	'android-chrome-192x192.png',
	'android-chrome-512x512.png',
	'apple-touch-icon.png',
	'manifest.webmanifest'
];

// Cache the assets
self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// Serve from cache
self.addEventListener('fetch', (e) => {
	const url = new URL(e.request.url);
	e.respondWith(caches.match(e.request).then((res) => res || caches.match('index.html')));
});
