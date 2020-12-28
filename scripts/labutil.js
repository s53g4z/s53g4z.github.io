//

let zero = 0;
let exact = "exact";
let left = "left";
let right = "right";
let up = "up";
let down = "down";
let px = "px";
let step = 5;
let border = 0;
let keyWdown = false;
let keyDdown = false;
let keyAdown = false;
let boxArr = new Array();

// float-ify
function F(item) {
	return parseFloat(item);
}

function onOrCloseToGround(box) {
	let boxBottom = F(box.styl.top) + F(box.styl.height) + border;
	if (window.innerHeight > boxBottom && window.innerHeight - boxBottom < step ||
		boxBottom >= window.innerHeight)
		return true;
	return false;
}

function aboutEqual(val1, val2) {
	return Math.abs(val1 - val2) < 1;
}

function round(box) {
	box.hndl.style.top = Math.floor(F(box.styl.top)) + "px";
	box.hndl.style.left = Math.floor(F(box.styl.left)) + "px";
}

// Is line between top and bottom?
function inBetween(line, top, bottom) {
	if (top > bottom)
		throw new Error("top must be less than bottom for inBetween()");
	return top < line && line < bottom;
}

function canCollideHorizontally(box1, box2, direction) {
	let top1 = F(box1.styl.top) - border;
	let bottom1 = top1 + border + F(box1.styl.height) + border;
	let top2 = F(box2.styl.top) - border;
	let bottom2 = top2 + border + F(box2.styl.height) + border;

	if (direction == "down") {
		top1 += box1.vy;
		bottom1 += box1.vy;
	} else if (direction == "up") {
		top1 += box1.vy;
		bottom1 += box1.vy;
	}

	let ret = inBetween(top2, top1, bottom1) ||
		inBetween(top1, top2, bottom2) && inBetween(bottom1, top2, bottom2) ||
		inBetween(bottom2, top1, bottom1) ||
		(top1 == top2 && bottom1 == bottom2) ||
		aboutEqual(top1, bottom2) ||
		aboutEqual(bottom1, top2);
	return ret;
}

function canCollideVertically(box1, box2, direction) {
	let left1 = F(box1.styl.left) - border;
	let right1 = F(box1.styl.left) + F(box1.styl.width) + border;
	let left2 = F(box2.styl.left) - border;
	let right2 = F(box2.styl.left) + F(box2.styl.width) + border;
	
	if (direction == "left") {
		left1 -= step;
		right1 -= step;
	} else if (direction == "right") {
		left1 += step;
		right1 += step;
	}
	
	return (inBetween(left2, left1, right1) ||
		(inBetween(left1, left2, right2) && inBetween(right1, left2, right2)) ||
		inBetween(right2, left1, right1) ||
		(left1 == left2 && right1 == right2));
}

// Register the input handlers.
function initializeInput() {
	window.onkeydown = (e) => {
		if (e.key == "w")
			keyWdown = true;
		else if (e.key == "d")
			keyDdown = true;
		else if (e.key == "a")
			keyAdown = true;
	};
	window.onkeyup = (e) => {
		if (e.key == "w")
			keyWdown = false;
		else if (e.key == "d")
			keyDdown = false;
		else if (e.key == "a")
			keyAdown = false;
	};
}

function Box(hndl, ay) {
	this.hndl = hndl;
	this.styl = getComputedStyle(hndl);
	this.vx = this.vy = this.ax = 0;
	this.ay = ay;
	this.direction = right;
}

function initBoxes() {
	let a = new Box(document.querySelector("#box1"), 0.2);
	let b = new Box(document.querySelector("#box2"), 0.0);
	let c = new Box(document.querySelector("#box3"), 0.0);
	boxArr.push(a);
	boxArr.push(b);
	boxArr.push(c);
}
