//
"use strict";

// Make the scroll-to-top button/link better.
function fixScrollTopBtn(): void {
	let btn = document.getElementById("topbtn");
	if (!btn) throw new Error("unrecognized DOM");
	btn.onclick = function() {
		window.scrollTo(window.scrollX, 0);
	}
}

// Disable some links.
function disableLinks() {
	let toplink = document.getElementById("toplink");
	if (!toplink) throw new Error("unrecognized DOM");
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
function quickLinksTabify(): void {
	let tab1 = document.querySelector(".tab1") as HTMLElement;
	let tab2 = document.querySelector(".tab2") as HTMLElement;
	let tab3 = document.querySelector(".tab3") as HTMLElement;
	if (!tab1) throw new Error("unrecognized DOM");
	if (!tab2) throw new Error("unrecognized DOM");
	if (!tab3) throw new Error("unrecognized DOM");

	let links = document.getElementsByClassName("links") as HTMLCollectionOf<HTMLElement>;
	if (!links) throw new Error("unrecognized DOM");
	for (let link of links) {
		link.onclick = function() {
			tab1.style.display = "";
			tab2.style.display = "none";
			tab3.style.display = "none";
			return true;
		}
	}
	let whoLink = document.getElementById("whoanchorlink");  // last link is new tab
	if (!whoLink) throw new Error("unrecognized DOM");
	whoLink.onclick = function() {
		tab1.style.display = "none";
		tab2.style.display = "inherit";
		tab3.style.display = "none";
		return true;
	}
	let rl = document.getElementById("reactanchorlink");
	if (!rl) throw new Error("unrecognized DOM");
	rl.onclick = function() {
		tab1.style.display = "none";
		tab2.style.display = "none";
		tab3.style.display = "inherit";
		return true;
	}
}

// main()?
(function(): void {
	fixScrollTopBtn();
	disableLinks();
	deterPrinting();
	quickLinksTabify();
})()
