// Typing area
var type = document.getElementById("type");

// Save text
var save = function (text) {
	localStorage.setItem('type', text);
	document.title = text.split('\n')[0];
}

// Enable tab key - see http://jsfiddle.net/2wAzx/13/
var enableTab = function (id) {
	var el = document.getElementById(id);
	el.onkeydown = function(e) {
		if (e.keyCode === 9) {
			var val = this.value,
				start = this.selectionStart,
				end = this.selectionEnd;
			this.value = val.substring(0, start) + '\t' + val.substring(end);
			this.selectionStart = this.selectionEnd = start + 1;
			return false;
		}
	};
}

// Prevent saving on each keypress - see https://remysharp.com/2010/07/21/throttling-function-calls
var debounce = function (fn, delay) {
	var timer = null;
	return function () {
		var context = this, args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function () {
			fn.apply(context, args);
		}, delay);
	};
}

// Restore saved text
if (localStorage.getItem("type")) {
	type.value = localStorage.getItem("type");
	save(type.value);
}

// Save content
type.addEventListener("keyup", debounce(function () {
	save(this.value);
}, 250));

// Enable tab key
enableTab("type");
