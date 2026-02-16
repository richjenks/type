const STORAGE_KEY = 'type';

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

attachEditor();
