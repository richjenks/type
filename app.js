const STORAGE_KEY = 'type';
const SW_URL = 'cache.js';

const debounce = (fn, delay = 200) => {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
};

const loadText = () => {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
};

const saveText = (text) => {
	try {
		localStorage.setItem(STORAGE_KEY, text);
	} catch {
		// Ignore storage failures (privacy mode, full quota, disabled storage).
	}
};

const syncTitle = (text) => {
	const firstLine = (text.split('\n')[0] || '').trim();
	document.title = firstLine || 'Type';
};

const attachEditor = () => {
	const textarea = document.querySelector('textarea');
	if (!textarea) {
		return;
	}

	const stored = loadText();
	if (stored !== null) {
		textarea.value = stored;
	}

	syncTitle(textarea.value);

	const persist = debounce(() => {
		saveText(textarea.value);
		syncTitle(textarea.value);
	}, 200);

	textarea.addEventListener('input', persist);

	textarea.addEventListener('keydown', (event) => {
		if (event.key !== 'Tab') {
			return;
		}

		event.preventDefault();
		const { selectionStart, selectionEnd } = textarea;
		textarea.setRangeText('\t', selectionStart, selectionEnd, 'end');
	});
};

const setupServiceWorker = async () => {
	if (!('serviceWorker' in navigator)) {
		return;
	}

	let refreshing = false;
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (refreshing) {
			return;
		}
		refreshing = true;
		window.location.reload();
	});

	const requestActivation = (registration) => {
		if (registration.waiting) {
			registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		}
	};

	try {
		const registration = await navigator.serviceWorker.register(SW_URL);
		requestActivation(registration);
		void registration.update();

		registration.addEventListener('updatefound', () => {
			const installing = registration.installing;
			if (!installing) {
				return;
			}

			installing.addEventListener('statechange', () => {
				if (installing.state === 'installed' && navigator.serviceWorker.controller) {
					requestActivation(registration);
				}
			});
		});

		window.setInterval(() => {
			registration.update().catch(() => {
				// Keep editor usable if update checks fail temporarily.
			});
		}, 60 * 60 * 1000);
	} catch {
		// Ignore registration failures; app continues online-only.
	}
};

attachEditor();
void setupServiceWorker();
