//

// Process the promise returned by fetch().
function processFetchProm(promReq) {
	return promReq.then((req) => {
		let respdiv = document.getElementById("resp");
		if (req.ok && req.status == 200) {
			respdiv.innerHTML = "Profile picture:<br>";
			return req.blob();
		} else { //if (req.status == 404) {
			respdiv.innerText = "Not found. Try another name?";
		}
		throw new Error(req.status);
	});
}

// Place the promised image onto the page.
function processPromBlob(promBlob) {
	return promBlob.then((blob) => {
		let img = document.createElement("img");
		img.src = URL.createObjectURL(blob);
		document.getElementById("resp").appendChild(img);
	});
}

function errHandler(e) {
	let respdiv = document.getElementById("resp");
	if (e.message == 404)
		respdiv.innerText = "Not found. Try another name?";
	else if (e.message == 401)
		respdiv.innerText = "401 Unauthorized :(";
	else if (e.message == 403)
		respdiv.innerText = "403 Forbidden :(";
	else {
		respdiv.innerText = "Unexpected error occurred:"
		respdiv.innerText += " " + e.message.toString();
	}
}

function initializeSearchBox() {
	let btn = document.getElementById("go");
	btn.onclick = () => {  // clicked, now go fetch the profile picture
		let respdiv = document.getElementById("resp");
		respdiv.innerHTML = "Loading ...";
		let input = document.getElementById("input1");
		let url = `https://api.tumblr.com/v2/blog/${input.value}.tumblr.com/avatar/128`;
		let promBlob = processFetchProm(fetch(url));
		processPromBlob(promBlob).catch(errHandler);
		input.focus();  // search again?
		input.select();  // ibid
	}
	document.getElementById("input1").onkeyup = (e) => {
		if (e.keyCode == 13)  // return key
			btn.click();
	}
}

// main?
(function() {
	initializeSearchBox();
})();
