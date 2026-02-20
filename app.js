// Local storage key name
const STORAGE_KEY = 'type';

// Delay frequent calls until typing pauses
const debounce = (fn, delay = 200) => {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
};

// Load saved text from local storage
const loadText = () => {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
};

// Save current text to local storage
const saveText = (text) => {
	try {
		localStorage.setItem(STORAGE_KEY, text);
	} catch {
		// Ignore storage failures (privacy mode, full quota, disabled storage)
	}
};

// Sync page title with first non-empty line
const syncTitle = (text) => {
	const firstLine = (text.split('\n')[0] || '').trim();
	document.title = firstLine || 'Type';
};

// Launch!
(() => {

	// Get the editor element
	const editor = document.querySelector('textarea');

	// Load saved text
	const stored = loadText();
	if (stored !== null) {
		editor.value = stored;
	}

	// Set initial title and reveal editor (prevents default text flash)
	syncTitle(editor.value);
	editor.classList.remove('hidden');

	// Persist and retitle
	const commitCurrentText = () => {
		saveText(editor.value);
		syncTitle(editor.value);
	};

	// Save changes as the user types
	editor.addEventListener('input', debounce(commitCurrentText, 200));

	// Insert tabs instead of changing focus
	editor.addEventListener('keydown', (event) => {
		if (event.key !== 'Tab') return;
		event.preventDefault();
		const { selectionStart, selectionEnd } = editor;
		editor.setRangeText('\t', selectionStart, selectionEnd, 'end');
		commitCurrentText();
	});
})();
