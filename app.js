// Get textarea
const el = document.querySelector('textarea');

// Debounce helper
const debounce = (fn, delay = 200) => {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn.apply(null, args), delay);
	};
};

// Persist text and update title
const save = (text) => {
	localStorage.setItem('type', text);
	const first = (text.split('\n')[0] || '').trim();
	document.title = first || 'Type';
};

// Restore saved text (if any) and sync title
const saved = localStorage.getItem('type');
if (saved !== null) el.value = saved;
save(el.value);

// Save on input (debounced)
el.addEventListener('input', debounce(() => save(el.value), 200));

// Insert a tab character on Tab key
el.addEventListener('keydown', (e) => {
	if (e.key === 'Tab') {
		e.preventDefault();
		const { selectionStart, selectionEnd } = el;
		el.setRangeText('\t', selectionStart, selectionEnd, 'end');
	}
});
