const STORAGE_KEY = 'type';
const SW_URL = 'offline.js';

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

	const commitCurrentText = () => {
		saveText(textarea.value);
		syncTitle(textarea.value);
	};
	const persist = debounce(commitCurrentText, 200);

	textarea.addEventListener('input', persist);

	textarea.addEventListener('keydown', (event) => {
		if (event.key !== 'Tab') {
			return;
		}

		event.preventDefault();
		const { selectionStart, selectionEnd } = textarea;
		textarea.setRangeText('\t', selectionStart, selectionEnd, 'end');
		commitCurrentText();
	});
};

const attachControllerChangeReload = () => {
	let refreshing = false;
	let hadController = Boolean(navigator.serviceWorker.controller);
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		const isUpdate = hadController;
		hadController = true;
		if (!isUpdate) {
			return;
		}

		if (refreshing) {
			return;
		}
		refreshing = true;
		window.location.reload();
	});
};

const requestWaitingActivation = (registration) => {
	if (registration.waiting) {
		// Opcode `1` is handled in offline.js message handler as "skip waiting".
		registration.waiting.postMessage(1);
	}
};

const watchForServiceWorkerUpdates = (registration) => {
	registration.addEventListener('updatefound', () => {
		const installing = registration.installing;
		if (!installing) {
			return;
		}

		installing.addEventListener('statechange', () => {
			if (installing.state === 'installed' && navigator.serviceWorker.controller) {
				requestWaitingActivation(registration);
			}
		});
	});
};

const startServiceWorkerUpdatePolling = (registration, intervalMs = 60 * 60 * 1000) => {
	window.setInterval(() => {
		registration.update().catch(() => {
			// Keep editor usable if update checks fail temporarily.
		});
	}, intervalMs);
};

const setupServiceWorker = async () => {
	if (!('serviceWorker' in navigator)) {
		return;
	}

	attachControllerChangeReload();

	try {
		const registration = await navigator.serviceWorker.register(SW_URL);
		requestWaitingActivation(registration);
		void registration.update();
		watchForServiceWorkerUpdates(registration);
		startServiceWorkerUpdatePolling(registration);
	} catch {
		// Ignore registration failures; app continues online-only.
	}
};

attachEditor();
void setupServiceWorker();
