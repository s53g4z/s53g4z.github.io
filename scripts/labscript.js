//

let step = 5;
let keyWdown = false;
let keyDdown = false;
let keyAdown = false;
let boxArr = new Array();

function onSurface(box) {
	let styles = getComputedStyle(box.handle);
	let onGround = Math.ceil(parseFloat(styles.top) + parseFloat(styles.height) +
		parseFloat(box.vy)) >= window.innerHeight;
	if (onGround)
		return true;
	for (let i = 0; i < boxArr.length; i++) {
		if (box == boxArr[i])
			continue;
		let styles1 = box.st;
		let bot1 = Math.ceil(parseFloat(styles1.top) + parseFloat(styles1.height));
		let styles2 = boxArr[i].st;
		let top2 = Math.ceil(parseFloat(styles2.top));
		if (canCollideHorizontally(styles1, styles2, "down") &&
			canCollideVertically(styles1, styles2, "down") &&
			bot1 + parseFloat(box.vy) >= top2)
				return true;
	}
	return false;;
}

function fall(box) {
	let styles = getComputedStyle(box.handle);
	box.vy += box.ay;
	box.style.top = Math.ceil(parseFloat(styles.top) + box.vy) + "px";
}

function jump(box) {
	let styles = getComputedStyle(box.handle);
	if (onSurface(box))
		box.vy = -5;
}

// Return if a is between x and y.
function isBetween(a, x, y) {
	if (x > y)
		throw new Error("x must be <= y");
	return x < a && a < y;
}

function canCollideHorizontally(styles1, styles2, direction) {
	let top1 = Math.ceil(parseFloat(styles1.top));
	let bot1 = top1 + Math.ceil(parseFloat(styles1.height));
	let top2 = Math.ceil(parseFloat(styles2.top));
	let bot2 = top2 + Math.ceil(parseFloat(styles2.height));
	
	if (direction == "down") {
		top1 += step;  // bad approximation, should use vy instead
		bot1 += step;  // ibid
	} else if (direction == "up") {
		top1 -= step;
		bot1 -= step;
	}
	
	let ret = isBetween(top2, top1, bot1) ||
		isBetween(top1, top2, bot2) && isBetween(bot1, top2, bot2) ||
		isBetween(bot2, top1, bot1);
	
	return ret;
}

function canCollideVertically(styles1, styles2, direction) {
	let left1 = Math.ceil(parseFloat(styles1.left));
	let right1 = left1 + Math.ceil(parseFloat(styles1.width));
	let left2 = Math.ceil(parseFloat(styles2.left));
	let right2 = left2 + Math.ceil(parseFloat(styles2.width));
	
	if (direction == "left") {
		left1 -= step;
		right1 -= step;
	} else if (direction == "right") {
		left1 += step;
		right1 += step;
	}
	
	let ret = isBetween(left2, left1, right1) ||
		isBetween(left1, left2, right2) && isBetween(right1, left2, right2) ||
		isBetween(right2, left1, right1);
		
	return ret;
}

function handleLeft(styles1, styles2, item1) {
	let left1 = Math.ceil(parseFloat(styles1.left));
	let right2 = Math.ceil(parseFloat(styles2.left) +
		parseFloat(styles2.width));
	let canHitHoriz = canCollideHorizontally(styles1, styles2);
	let canHitVert = canCollideVertically(styles1, styles2, "left");
	let canHit = canHitHoriz && canHitVert;
	if (!canHit ||
		canHit && left1 - step > right2)
		item1.style.left = (left1 - step) + "px";
}

function move (direction, item1) {
	for (let item2 of boxArr) {
		if (item1 == item2)
			continue;
		let styles1 = getComputedStyle(item1.handle);
		let styles2 = getComputedStyle(item2.handle);
		if (direction == "left") {
			handleLeft(styles1, styles2, item1);
		} else
			throw new Error("unknown direction to move()");
	}
}

function loop() {
	let styles = getComputedStyle(boxArr[0].handle);
	if (keyDdown) {
		boxArr[0].style.left = (parseFloat(styles.left) + step) + "px";
	} else if (keyAdown) {
		move("left", boxArr[0]);
	}
	if (keyWdown) {
		jump(boxArr[0]);
	}
	for (let box of boxArr) {
		if (!onSurface(box))
			fall(box);
	}
	requestAnimationFrame(loop);
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

function Box(handle, vx, vy, ax, ay) {
	this.handle = handle;
	this.style = handle.style;
	this.st = getComputedStyle(handle);
	this.vx = vx;
	this.vy = vy;
	this.ax = ax;
	this.ay = ay;
}

// Initialize the boxes.
function initializeBoxes() {
	let box1 = new Box(document.getElementById("box1"), 0, 0, 0, 0.2);
	boxArr.push(box1);
	let box2 = new Box(document.getElementById("box2"), 0, 0, 0, 0);
	boxArr.push(box2);
}

(function() {
	initializeInput();
	initializeBoxes();
	loop();
})();
