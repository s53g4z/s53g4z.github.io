//
"use strict";

// Make the scroll-to-top button/link better.
function fixScrollTopBtn() {
	let btn = document.getElementById("topbtn");
	btn.onclick = function() {
		window.scrollTo(window.scrollX, 0);
	}
}

// Disable some links.
function disableLinks() {
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

// main()?
(function() {
	fixScrollTopBtn();
	disableLinks();
	deterPrinting();
})()
