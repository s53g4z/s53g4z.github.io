//
"use strict";

// Return a handle to the (first) disabled input box.
function getDisabledTxtBox() {
	let txtboxes = document.getElementsByTagName("input");
	for (let elem of txtboxes) {
		if (elem.hasAttribute("disabled")) {
			return elem;
		}
	}
	return null;
}

// Make the (first) disabled text box found blink between dis/enabled.
function makeTxtboxBlinky() {
	let txtbox = getDisabledTxtBox();
	txtbox.value = "<BLINK>";
	setInterval(function() {
		if (txtbox.hasAttribute("disabled")) {
			txtbox.disabled = false;
		} else {
			txtbox.disabled = true;
		}
	}, 500, txtbox);
}

// Add a &nbsp; to the "Enabled ..." line of inputboxes.
function fixTxtboxBlankspace() {
	let enabledTxtbox = document.getElementById("inputboxes");
	// the provided pattern is a string, so only the first match is affected
	enabledTxtbox.innerHTML = enabledTxtbox.innerHTML.replace("led", "led&nbsp;");
}

// Hide the pacman text by default.
function hidePacmanTxt() {
	let pacTxt = document.getElementById("pacman");
	pacTxt.hidden = true;
	let btn = document.getElementById("pactoggle");
	btn.onclick = function() {
		if (pacTxt.hidden) {
			pacTxt.hidden = false;
		} else if (!pacTxt.hidden) {
			pacTxt.hidden = true;
		}
	}
}

// Make the scroll-to-top button/link better.
function fixScrollTopBtn() {
	let btn = document.getElementById("topbtn");
	btn.onclick = function() {
		window.scrollTo(window.scrollX, 0);
	}
}

// Disable some links.
function disableLinks() {
	let imglink = document.getElementById("imglink");
	imglink.onclick = function() {
		return false;
	};
	let toplink = document.getElementById("toplink");
	toplink.onclick = function() {
		return false;  // JS implements the behavior better.
	};
}

// Deter printing by replacing the page contents on print.
function deterPrinting() {
	let entirePage = document.body.innerHTML;
	window.addEventListener("beforeprint", e => {
		document.body.style.border = "0px";
		document.body.innerHTML = "<div>Don't print the document, please!</div>";
	});
	window.addEventListener("afterprint", e => {
		document.body.innerHTML = entirePage;
	});
}

// Make bullets grey on hover and black on click.
function makeBulletsChangeOnMouse() {
	function changeColour(e) {
		console.log("changing bullets colour ...");
		e.stopPropagation();
		e.target.style.color = null;
		e.currentTarget.style.color = "grey";
		//let bullets = e.currentTarget;
		//bullets.removeEventListener("mouseover", changeColour);
	}
	function resetColour(e) {
		console.log("resetting bullets colour ...");
		e.stopPropagation();
		e.target.style.color = "black";
	}
	let bullets = document.querySelector("ul");
	bullets.addEventListener("mouseover", changeColour);
	bullets.addEventListener("click", resetColour);
}

// Promise testing to replace the image and print some garbage to the top div.
function pramise() {
	let url1 = "https://raw.githubusercontent.com/mdn/learning-area/master/javascript/asynchronous/promises/coffee.jpg";
	let url2 = "https://raw.githubusercontent.com/mdn/learning-area/master/javascript/asynchronous/promises/description.txt";
	Promise.all([fetch(url1), fetch(url2)])
	.then(resparr => {
		let r0 = resparr[0];
		let r1 = resparr[1];
		if (r0.ok && r1.ok) {
			return Promise.all([r0.blob(), r1.blob()]);
		} else {
			throw new Error("r: " + r0.status + " " + r1.status);
		}
	}).then(blobsarr => {
		let imgblob = blobsarr[0];
		let txtblob = blobsarr[1];
		let img = document.querySelector("img");
		img.src = URL.createObjectURL(imgblob);
		txtblob.text().then(t => {
			let div = document.querySelector("div");
			div.innerText = t;  // actual text!
		});
	}).catch(e => {
		console.log(e.message);
	});
}

// Print the cursor coordinates to a div.
function mouseTracker() {
	const mc = document.getElementById("mousecoordinates");
	
	let timer1 = Date.now();
	let mouseMoveFnRan = false;
	function mouseMoveFn(e) {
		let now = Date.now();
		if (now < timer1 + 64 && mouseMoveFnRan) {
			return;
		}
		mouseMoveFnRan = true;
		timer1 = now;
		mc.textContent = mc.textContent.replace(/is at .*\./, `is at ${e.clientX}, ${e.clientY}.`);
	}
	mouseMoveFn({clientX: "?", clientY: "?"});
	window.onmousemove = mouseMoveFn;
	
	function onScrollFn(e) {
		mc.innerText = mc.innerText.replace(/\..*$/, `. Scrolled to ${scrollX}, ${scrollY}`);
		mc.style.position = "absolute";
		mc.style.top = (window.scrollY + 5) + "px";
		mc.style.padding = "2px";
		mc.style.border = "1px solid black";
		mc.style.backgroundColor = "magenta";
	}
	onScrollFn(null);
	window.onscroll = onScrollFn;
}

function buttonSpawnCanvas() {
	var btn = document.getElementById("spawncanvas");
	btn.textContent = "Spawn <canvas>";
	btn.onclick = () => {
		const anyCanvas = document.querySelector("canvas");
		if (anyCanvas) {
			anyCanvas.parentElement.removeChild(anyCanvas);
			btn.textContent = "Spawn <canvas>";
			return;
		}
		const canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		canvas.height = canvas.width = 300;
		//const ctx = canvas.getContext("2d");
		btn.textContent = "Destroy <canvas>";
	};
}

// main()?
(function() {
	fixScrollTopBtn();
	fixTxtboxBlankspace();
	makeTxtboxBlinky();
	hidePacmanTxt();
	disableLinks();
	deterPrinting();
	makeBulletsChangeOnMouse();
	//pramise();
	mouseTracker();
	buttonSpawnCanvas();
})()
