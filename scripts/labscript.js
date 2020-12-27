//

let step = 5;
let border = 1;  // width of one border = 1px, and have two borders to consider
let keyWdown = false;
let keyDdown = false;
let keyAdown = false;
let boxArr = new Array();

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

// Smash the box into the ground.
function smashIntoGround(box) {
	box.hndl.style.top = (window.innerHeight - border - F(box.styl.height)) +
		"px";
}

function canCollideVertically(box1, box2, direction) {
	let top1 = F(box1.styl.top) - border;
	let bottom1 = top1 + border + F(box1.styl.height) + border;
	let top2 = F(box2.styl.top) - border;
	let bottom2 = top2 + border + F(box2.styl.height) + border;

	if (direction == "down") {
		top1 += box1.vy;
		bottom1 += box1.vy;
	}

	return inBetween(top2, top1, bottom1) ||
		inBetween(top1, top2, bottom2) && inBetween(bottom1, top2, bottom2) ||
		inBetween(bottom2, top1, bottom1);
}

function canCollideHorizontally(box1, box2, direction) {
	let left1 = F(box1.styl.left) - border;
	let right1 = F(box1.styl.left) + F(box1.styl.width) + border;
	let left2 = F(box2.styl.left) - border;
	let right2 = F(box2.styl.left) + F(box2.styl.width) + border;
	
	if (direction == "left") {
		left1 += step;
		right1 += step;
	} else if (direction == "right") {
		left1 -= step;
		right1 -= step;
	}
	
	return (inBetween(left2, left1, right1) ||
		inBetween(left1, left2, right2) && inBetween(right1, left2, right2) ||
		inBetween(right2, left1, right1));
}

// Make box fall.
function fall(box) {
	if (onOrCloseToGround(box) && box.vy > 0) {
		smashIntoGround(box);
		return;
	}
	for (let box2 of boxArr) {
		if (box == box2)
			continue;
		let bottom1 = F(box.styl.top) + F(box.styl.height) + border;
		let top2 = F(box2.styl.top) - border;
		if (canCollideVertically(box, box2, "down") &&
			canCollideHorizontally(box, box2, "down") && 
			Math.abs(bottom1 - top2) < step)
			return;
	}
	box.vy += box.ay;
	if (F(box.styl.top) + F(box.styl.height) + border + box.vy >
		window.innerHeight) {
		box.vy = 0;
		smashIntoGround(box);
	} else {
		box.hndl.style.top = (F(box.styl.top) + box.vy) + "px";
	}
	
	return;
}

function canTouch(box1, box2) {
	return true;
}

// Is line between or equal to top and bottom?
function inBetween(line, top, bottom) {
	if (top > bottom)
		throw new Error("top must be less than bottom for inBetween()");
	return top <= line && line <= bottom;
}

function touching(box1, box2, direction) {
	let left1 = F(box1.styl.left) - border + step;
	let right1 = left1 + F(box1.styl.width) + border;
	let top1 = F(box1.styl.top) - border;
	let left2 = F(box2.styl.left) - border;
	let right2 = left2 + F(box2.styl.width) + border;
	let top2 = F(box2.styl.top) - border;
	
	if (!canTouch(box1, box2))
		return false;
	if (direction == "right" &&
		canCollideVertically(box1, box2, "right") &&
		canCollideHorizontally(box1, box2, "right")) {
		return right1 > left2;
	} else if (direction == "left" &&
		canCollideVertically(box1, box2, "left") &&
		canCollideHorizontally(box1, box2, "left")) {
		return left1 < right2;
	}
	return false;
}

function move(direction, box) {
	if (onOrCloseToGround(box) && direction == "down")
		return;
	for (let i = 0; i < boxArr.length; i++) {
		if (box == boxArr[i])
			continue;
		if (touching(box, boxArr[i], direction))
			return;
	}
	if (direction == "right")
		box.hndl.style.left = (F(box.styl.left) + step) + "px";
	if (direction == "left")
		box.hndl.style.left = (F(box.styl.left) - step) + "px";
}

function jump(box1) {
	if (onOrCloseToGround(box1)) {
		box1.vy = -5;
		return;
	}
	for (let box2 of boxArr) {
		if (box1 == box2)
			continue;
		box1Bottom = F(box1.styl.top) + F(box1.styl.height) + border;
		box2Top = F(box2.styl.top) - border;
		if (canCollideVertically(box1, box2) &&
			canCollideHorizontally(box1, box2) &&
			box1Bottom - box2Top < step) {
				box1.vy = -5;
				return;
		}
	}
}

function loop() {
	if (keyDdown) {
		move("right", boxArr[0]);
	} else if (keyAdown) {
		move("left", boxArr[0]);
	}
	if (keyWdown) {
		jump(boxArr[0]);
	}
	for (let box of boxArr) {
		fall(box)
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

function Box(hndl, ay) {
	this.hndl = hndl;
	this.styl = getComputedStyle(hndl);
	this.vx = this.vy = this.ax = 0;
	this.ay = ay;
}

function initBoxes() {
	let a = new Box(document.querySelector("#box1"), 0.2);
	let b = new Box(document.querySelector("#box2"), 0.0);
	let c = new Box(document.querySelector("#box3"), 0.0);
	boxArr.push(a);
	boxArr.push(b);
	boxArr.push(c);
}

(function() {
	initializeInput();
	initBoxes();
	loop();
})();
