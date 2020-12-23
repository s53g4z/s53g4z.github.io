//

// Prepend number with leading zero when n < 10
function lz(num) {
	if (num >= 10)
		return num;
	return "0" + num;
}

// Initialize the date input with the current date.
function initDateInput() {
	let dateInput = document.getElementById("dateInput");
	let d = new Date();
	dateInput.value = d.getFullYear() + "-" +
		lz(Number(d.getMonth()+1)) + "-" +
		lz(d.getDate());
}

// Handle the promise from fetch();
function respHandler(fromFetch) {
	return fromFetch.then((resp) => {
		if (!resp.ok || resp.status != 200)
			throw new Error(resp.statusText);
		return resp.json();
	});
}

// Handle the promised JSON.
function promjsonHandler(promjson) {
	return promjson.then((json) => {
		let msg = document.getElementById("textarea");
		let url = json.url;
		document.body.style.backgroundImage = "url('" + url + "')";
		msg.innerText = json.explanation;
	});
}

// Set up the Go button.
function initGo() {
	document.getElementById("go").onclick = function() {
		document.getElementById("textarea").innerText = "Loading ...";
		let url = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
		url += "&date=" + document.getElementById("dateInput").value;
		let promjson = respHandler(fetch(url));
		promjsonHandler(promjson).catch((e) => {
			document.getElementById("textarea").innerText = e.message;
		});
	}
}

// main?
(function() {
	initDateInput();
	initGo();
})();

