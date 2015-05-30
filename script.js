// Get stored text
if (localStorage.getItem("type")) {
	document.getElementById("type").value = localStorage.getItem("type");
}

// Save content
function save(text) {
	console.log(text);
	localStorage.setItem('type', text);
	document.title = text.split('\n')[0];
}

// Enable tab key - see http://jsfiddle.net/2wAzx/13/
function enableTab(id) {
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
enableTab("type");