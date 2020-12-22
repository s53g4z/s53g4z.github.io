//


function initializeSearchBox() {
	let btn = document.getElementById("go");
	let respdiv = document.getElementById("resp");
	btn.onclick = () => {
		let input = document.getElementById("input1");
		respdiv.innerHTML = "";
		fetch(`https://api.tumblr.com/v2/blog/${input.value}.tumblr.com/avatar/128`)
		.then((req) => {
			if (req.ok && req.status == 200) {
				respdiv.innerHTML = "Profile picture:<br>";
				return req.blob();
			} else { //if (req.status == 404) {
				respdiv.innerText = "Not found. Try another name?";
			}
			throw new Error(req.status);
		}).then((blob) => {
			let img = document.createElement("img");
			img.src = URL.createObjectURL(blob);
			respdiv.appendChild(img);
		}).catch((e) => {
			respdiv.innerText = "Not found. Try another name?";
			if (e.message != 404)
				console.log(e.message);
		});
		input.focus();
		input.select();
	}
	document.getElementById("input1").onkeyup = (e) => {
		if (e.keyCode == 13)
			btn.click();
	}
}

// main?
(function() {
	initializeSearchBox();
})();
