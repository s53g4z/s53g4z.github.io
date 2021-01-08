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

// Make the link bar show and hide page elements on click.
function quickLinksTabify() {
	let links = document.getElementsByClassName("links");
	for (let link of links) {
		link.onclick = function() {
			let tab1 = document.querySelector(".tab1");
			tab1.style.display = "";
			let tab2 = document.querySelector(".tab2");
			tab2.style.display = "none";
			return true;
		}
	}
	let whoLink = document.getElementById("whoanchorlink");  // last link is new tab
	whoLink.onclick = function() {
		let tab1 = document.querySelector(".tab1");
		tab1.style.display = "none";
		let tab2 = document.querySelector(".tab2");
		tab2.style.display = "inherit";
		return true;
	}
}

// main()?
(function() {
	fixScrollTopBtn();
	disableLinks();
	deterPrinting();
	quickLinksTabify();
})()
