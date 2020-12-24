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

function isAtBottomEdgeOfScreen(box) {
	let boxBottom = F(box.styl.top) + F(box.styl.height);
	return boxBottom == innerHeight;
}

function isAtTopEdgeOfScreen(box) {
	return F(box.styl.top) == zero;
}

function isCloseToTopEdgeOfScreen(box) {
	return F(box.styl.top) < step;
}

function isCloseToBottomEdgeOfScreen(box) {
	let boxBottom = F(box.styl.top) + F(box.styl.height);
	return innerHeight - boxBottom < Math.abs(box.vy);
}

function areTouching(box1, box2) {
	return canCollideHorizontally(box1, box2) &&
		canCollideVertically(box1, box2);
}

function distanceBetween(a, b) {
	let xx2 = (b.x-a.x) * (b.x-a.x);
	let yy2 = (b.y-a.y) * (b.y-a.y);
	return Math.sqrt(xx2 + yy2);
}

function getRadius(A) {
	let upperLeft = new Point(F(A.styl.left), F(A.styl.top));
	let lowerRight = new Point(F(A.styl.left) + F(A.styl.width),
		F(A.styl.top) + F(A.styl.height));
	let dist = distanceBetween(upperLeft, lowerRight);
	return dist / 2;
}

function getCenter(A) {
	let point = new Point(F(A.styl.left), F(A.styl.top));
	point.x += F(A.styl.width) / 2;
	point.y += F(A.styl.height) / 2;
	return point;
}

function areCloseToTouching(box1, box2, dir) {
	let A = box1;
	let B = box2;
	let Aradius = getRadius(A) + 2;  // arbitrary offset to include corners
	let Bradius = getRadius(B) + 2;
	let Acenterpoint = getCenter(A);
	let Bcenterpoint = getCenter(B);
	let distanceBetweenCircles = distanceBetween(Acenterpoint, Bcenterpoint);
	return distanceBetweenCircles + 1 < Aradius + Bradius;
}

function vertDistBetween(A, B, dir) {
	let Atop = F(A.styl.top);
	let Btop = F(B.styl.top);
	let Abottom = Atop + F(A.styl.height);
	let Bbottom = Btop + F(B.styl.height);
	
	if (Atop < Btop) {  // A is above B
		let dist = Btop - Abottom;
		if (dist < 0)
			return zero;
		return dist;
	} else if (Atop > Btop) {  // B is above A
		let dist = Atop - Bbottom;
		if (dist < 0)
			return zero;
		return dist;
	} else
		return zero;
}

function horizDistBetween(A, B, dir) {
	let Aleft = F(A.styl.left);
	let Bleft = F(B.styl.left);
	let Aright = Aleft + F(A.styl.width);
	let Bright = Bleft + F(B.styl.width);
	
	if (Aleft < Bleft) {  // A before B
		let dist = Bleft - Aright;
		if (dist < 0)
			return zero;
		return dist;
	} else if (Bleft < Aleft) { // B before A
		let dist = Aleft - Bright;
		if (dist < 0)
			return zero;
		return dist;
	} else
		return zero;
}

function distBetween(box1, box2, dir) {
	if (dir == up || dir == down)
		return verticalDistance = vertDistBetween(box1, box2, dir);
	if (dir == left || dir == right)
		return horizontalDistance = horizDistBetween(box1, box2, dir);
}

function isAtLeftEdgeOfScreen(box) {
	let boxLeft = F(box.styl.left);
	return boxLeft == zero;
}

function isAtRightEdgeOfScreen(box) {
	let boxRight = F(box.styl.left) + F(box.styl.width);
	return boxRight == innerWidth;
}

function isCloseToLeftEdgeOfScreen(box) {
	let boxLeft = F(box.styl.left);
	return boxLeft < step;
}

function isCloseToRightEdgeOfScreen(box) {
	let boxRight = F(box.styl.left) + F(box.styl.width);
    return innerWidth - boxRight < step;
}

// float-ify
function F(item) {
	return parseFloat(item);
}

function aboutEqual(val1, val2) {
	return false;
	//return Math.abs(val1 - val2) < 1;
}

// Is line between top and bottom? Helper for canCollideVert/Horiz-ally.
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
		(top1 == top2 || bottom1 == bottom2) ||
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
		if (e.key == "w" || e.key == "ArrowUp")
			keyWdown = true;
		else if (e.key == "d" || e.key == "ArrowRight")
			keyDdown = true;
		else if (e.key == "a" || e.key == "ArrowLeft")
			keyAdown = true;
	};
	window.onkeyup = (e) => {
		if (e.key == "w" || e.key == "ArrowUp")
			keyWdown = false;
		else if (e.key == "d" || e.key == "ArrowRight")
			keyDdown = false;
		else if (e.key == "a" || e.key == "ArrowLeft")
			keyAdown = false;
	};
}

// Input is either an existing handle and vertical acceleration
// or null and the rest of the parameters (behavior is optional).
function Box(hndl, ay, x, y, width, height, color, behavior) {
	if (hndl == null) {
		hndl = document.createElement("div");
		hndl.style.left = x + px;
		hndl.style.top = y + px;
		hndl.style.width = width + px;
		hndl.style.height = height + px;
		hndl.style.backgroundColor = color;
		hndl.style.position = "absolute";
		document.body.appendChild(hndl);
	}
	this.hndl = hndl;
	this.styl = getComputedStyle(hndl);
	this.vx = this.vy = this.ax = 0;
	if (isNaN(ay))
		throw new Error("Box.ay must be a number");
	this.ay = ay;
	this.direction = right;
	this.behavior = behavior;
	
	return this;
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function initBoxes() {
	let a = new Box(document.querySelector("#box1"), 0.2);
	let b = new Box(document.querySelector("#box2"), 0.0);
	b.behavior = "patrol";
	let c = new Box(document.querySelector("#box3"), 0.0);
	
	let d = new Box(null, 0.0, 300, 200, 50, 10, "green");
	let e = new Box(null, 0.2, 300, 190, 50, 10, "blue", "patrol");
	let f = new Box(null, 0.0, 150, 300, 50, 10, "green");
	let g = new Box(null, 0.0, 250, 350, 50, 10, "green");
	let h = new Box(null, 0.0, 275, 250, 50, 10, "green");
	let i = new Box(null, 0.0, 400, 150, 50, 10, "green");
	let j = new Box(null, 0.0, 500, 90, 50, 10, "green");
	
	boxArr.push(a);
	boxArr.push(b);
	boxArr.push(c);
	boxArr.push(d);
	boxArr.push(e);
	boxArr.push(f);
	boxArr.push(g);
	boxArr.push(h);
	boxArr.push(i);
	boxArr.push(j);
}
