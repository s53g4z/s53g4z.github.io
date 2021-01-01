//

function initBoxes() {
	let a = new Box(document.querySelector("#box1"), 0.2);
	a.pushable = true;
	let b = new Box(document.querySelector("#box2"), 0.0);
	b.behavior = "patrol";
	let c = new Box(document.querySelector("#box3"), 0.0);
	
	let d = new Box(null, 0.0, 300, 200, 50, 10, "green");
	let e = new Box(null, 0.2, 300, 190, 50, 10, "blue", "patrol");
	let f = new Box(null, 0.0, 150, 300, 50, 10, "green");
	let g = new Box(null, 0.0, 250, 350, 50, 10, "green");
	let h = new Box(null, 0.0, 275, 250, 50, 10, "green");
	let i = new Box(null, 0.0, 400, 125, 50, 10, "green");
	let j = new Box(null, 0.0, 500, 90, 50, 10, "green");
	let k = new Box(null, 0.2, 340, 100, 50, 10, "green");
}

function initBoxes2() {
	let a = new Box(document.querySelector("#box1"), 0.2);
	a.pushable = true;
}

let coinBox = "coinBox";

function Special(hndl, x, y, width, height, type) {
	this.hndl = hndl;
	if (hndl == null) {
		this.hndl = document.createElement("div");
		document.body.appendChild(this.hndl);
	}
	this.hndl.style.left = x + px;
	this.hndl.style.top = y + px;
	this.hndl.style.width = width + px;
	this.hndl.style.height = height + px;
	this.hndl.style.position = "absolute";
	this.type = type;
	this.styl = getComputedStyle(this.hndl);
	
	if (this.type == coin) {
		let text = document.createElement("div");
		text.innerText = "$";
		text.className = coin + "Text";
		this.hndl.appendChild(text);
		this.hndl.className = coin;
	} else if (this.type == coinBox) {
		let text = document.createElement("div");
		text.innerText = "?";
		text.className = "coinBoxText";
		this.hndl.appendChild(text);
		this.hndl.className = coinBox;
		this.activated = false;
	}
	
	specialsArr.push(this);
}

function initSpecials() {
	let a = new Special(null, 145, 180, 50, 50, coin);
	let b = new Special(null, 280, 80, 50, 50, coinBox);
	let c = new Special(null, 585, 20, 50, 50, coin);
}

let specialsArr = new Array();
let playerCoins = 0;

let coin = "coin";

function activateSpecial(special) {
	if (special.type == coin) {
		playerCoins++;
	} else if (special.type == coinBox && !special.activated) {
		let specialX = F(special.styl.left);
		let specialY = F(special.styl.top);
		let specialWidth = F(special.styl.width);
		let specialHeight = F(special.styl.height);
		let newCoin = new Special(null, specialX, specialY - specialHeight,
			50, 50, coin);
		
		special.hndl.style.backgroundColor = "lightgrey";
		special.activated = true;
	}
}

function anythingInterestingHappen() {
	let player = boxArr[0];
	for (let i = 0; i < specialsArr.length; i++) {
		let special = specialsArr[i];
		if (canCollideVertically(player, special, up) &&
			canCollideHorizontally(player, special, up)) {
			if (special.type != coin && !hitHead(player, special))
				continue;
			activateSpecial(special);
			if (special.type == coin) {
				special.hndl.parentNode.removeChild(special.hndl);
				specialsArr.splice(i, 1);
				i--;
			}
		}
	}
	document.querySelector("#playerCoins").innerText = "Coins: " + playerCoins;
}

function loop2() {
	handleInput();
	calculateAnimations();
	moveEverything();
	anythingInterestingHappen();
	requestAnimationFrame(loop2);
}

(function() {
	initializeInput();
	initBoxes();
	initSpecials();
	loop2();
})();
