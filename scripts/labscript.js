//

let step = 5;
let border = 0;  // width of one border = 1px, and have two borders to consider
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
	let top = F(box.styl.top);
	let height = F(box.styl.height);
	let bottom = top + height + border;
	
	box.hndl.style.top = (innerHeight - height - border) + "px";
}

function aboutEqual(val1, val2) {
	return Math.abs(val1 - val2) < 2;
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

// Make box fall.
function fall(box1) {
	if (box1.ay == 0)
		return;
	if (onOrCloseToGround(box1) && box1.vy > 0) {  // smash box into ground?
		smashIntoGround(box1);
		return;
	}
	let direction = "none";
	if (box1.vy < 0)
		direction = "up";
	else if (box1.vy >= 0)
		direction = "down";

	let surface = innerHeight;
	for (let box2 of boxArr) {  // anything obstructing the fall?
		if (box1 == box2)
			continue;

		if (canCollideVertically(box1, box2, direction) &&
			canCollideHorizontally(box1, box2, direction)) {
			if (direction == "down")
				surface = F(box2.styl.top)
			else
				surface = F(box2.styl.top) + F(box2.styl.height);
		}
	}
	
	box1.vy += box1.ay;
	if (direction == "down") {
		let bottom1 = F(box1.styl.top) + F(box1.styl.height);
		let top2 = surface;
		if (Math.abs(bottom1 - top2) < Math.abs(box1.vy)) {
			box1.vy = 0;
		}
	} else if (direction == "up") {
		let top1 = F(box1.styl.top);
		let bottom2 = surface;
		if (Math.abs(top1 - bottom2) < Math.abs(box1.vy)) {
			box1.vy = bottom2 - top1;
		}
	}
	box1.hndl.style.top = (F(box1.styl.top) + box1.vy) + "px";
	return;
}

// Is line between top and bottom?
function inBetween(line, top, bottom) {
	if (top > bottom)
		throw new Error("top must be less than bottom for inBetween()");
	return top < line && line < bottom;
}

// buggy
function moveLR(dir, box1) {
	let left = "left";
	let right = "right";
	if (dir != left && dir != right)
		throw new Error("move() unsupported direction");
	if (dir == left) {
		let moveAmount = step;
		for (let box2 of boxArr) {  // maybe reduce the move amount
			if (box1 == box2)
				continue;
			if (canCollideVertically(box1, box2, moveAmount > 0 ? left : "") &&
				canCollideHorizontally(box1, box2, moveAmount > 0 ? left : "") &&
				Math.abs((F(box1.styl.top) + F(box1.styl.height)) - F(box2.styl.top)) > 1) {
				let left1 = F(box1.styl.left);
				let right2 = F(box2.styl.left) + F(box2.styl.width);
				newMoveAmount = left1 - right2;
				if (newMoveAmount <0)
					moveAmount = 0;
				else if (newMoveAmount < moveAmount)
					moveAmount = newMoveAmount;
			}
		}
		box1.hndl.style.left = (F(box1.styl.left) - moveAmount) + "px";
	} else if (dir == right) {
		let moveAmount = step;
		for (let box2 of boxArr) {  // maybe reduce the move amount
			if (box1 == box2)
				continue;
			if (canCollideVertically(box1, box2, moveAmount > 0 ? right : "") &&
				canCollideHorizontally(box1, box2, moveAmount > 0 ? right : "") && 
				Math.abs((F(box1.styl.top) + F(box1.styl.height)) - F(box2.styl.top)) > 1) {
				let right1 = F(box1.styl.left) + F(box1.styl.width);
				let left2 = F(box2.styl.left);
				newMoveAmount = left2 - right1;
				if (newMoveAmount <0)
					moveAmount = 0;
				else if (newMoveAmount < moveAmount)
					moveAmount = newMoveAmount;
			}
		}
		box1.hndl.style.left = (F(box1.styl.left) + moveAmount) + "px";
	}
}

function jump(box1) {
	let amount = -5;
	if (onOrCloseToGround(box1)) {
		box1.vy = amount;
		return;
	}
	for (let box2 of boxArr) {
		if (box1 == box2)
			continue;
		box1Bottom = (F(box1.styl.top) + F(box1.styl.height));
		box2Top = (F(box2.styl.top));
		if (canCollideVertically(box1, box2, "down") &&
			canCollideHorizontally(box1, box2, "down") &&
			box1Bottom - box2Top <= 0.99) {
				box1.vy = amount;
				return;
		}
	}
}

function round(box) {
	box.hndl.style.top = Math.floor(F(box.styl.top)) + "px";
	box.hndl.style.left = Math.floor(F(box.styl.left)) + "px";
}

function loop() {
	if (keyDdown) {
		moveLR("right", boxArr[0]);
	} else if (keyAdown) {
		moveLR("left", boxArr[0]);
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
