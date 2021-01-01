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
	return val1 == val2;
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
	if (behavior == "vertPatrol")  // note: vertpatrol is buggy
		this.direction = up;
	this.behavior = behavior;
	this.pushable = false;
	
	boxArr.push(this);
	return this;
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function helper_canMoveHorizHowMuch(box1, box2, dir, canMove) {
	if (box2.type == coin)
		return canMove;
	if (box1 == box2 || !areCloseToTouching(box1, box2, dir) ||
		!canCollideHorizontally(box1, box2, dir))
		return canMove;
	let box1Top = F(box1.styl.top);
	let box1Bottom = F(box1.styl.top) + F(box1.styl.height);
	let box2Top = F(box2.styl.top);
	let box2Bottom = F(box2.styl.top) + F(box2.styl.height);
	if (box1Bottom == box2Top || box1Top == box2Bottom)
		return canMove;
	let ret = Math.abs(distBetween(box1, box2, dir));
	if (dir == right) {
		if (F(box1.styl.left) < F(box2.styl.left) &&
			Math.abs(ret) < Math.abs(canMove))  // box1->   box2
			canMove = +ret;
	} else if (dir == left) {
		if (F(box2.styl.left) < F(box1.styl.left) &&
			Math.abs(ret) < Math.abs(canMove))  // box2    <-box1
			canMove = -ret;
	} else
		console.log("WARN: unexpected dir for canMoveHorizHowMuch()");
	return canMove;
}

function canMoveHorizHowMuch(box1, dir) {
	if (isAtLeftEdgeOfScreen(box1) && dir == left ||
		isAtRightEdgeOfScreen(box1) && dir == right)
		return zero;
	let canMove = step;
	if (dir == left)
		canMove = -step;
	for (box2 of boxArr) {  // maybe reduce canMove
		canMove = helper_canMoveHorizHowMuch(box1, box2, dir, canMove);
	}
	for (box2 of specialsArr) {
		canMove = helper_canMoveHorizHowMuch(box1, box2, dir, canMove);
	}
	if (isCloseToLeftEdgeOfScreen(box1) && dir == left)
		return Math.min(canMove, F(box1.styl.left) - zero);
	else if (isCloseToRightEdgeOfScreen(box1) && dir == right) {
		let distToScreenEdge = innerWidth - F(box1.styl.left) - F(box1.styl.width);
		return Math.min(canMove, distToScreenEdge);
	}
	return canMove;
}

function hitHead(box1, box2) {
	let Atop = F(box1.styl.top);
	let Btop = F(box2.styl.top);
	let Abottom = Atop + F(box1.styl.height);
	let Bbottom = Btop + F(box2.styl.height);
	return Math.abs(Atop - Bbottom) < 2;
}

function helper_canMoveVertHowMuch(box1, box2, dir, canMove) {
	if (box2.type == coin)
		return canMove;
	if (box1 == box2 || !areCloseToTouching(box1, box2, dir) ||
		!canCollideVertically(box1, box2, dir))
		return canMove;
	if (hitHead(box1, box2) && dir == up)
		return zero;
	let mini = distBetween(box1, box2, dir);
	let Atop = F(box1.styl.top);
	let Btop = F(box2.styl.top);
	let Abottom = Atop + F(box1.styl.height);
	let Bbottom = Btop + F(box2.styl.height);
	if (Atop <= Btop) {  // A is above B. hack: A == B, too.
		if (dir == down && Math.abs(mini) < Math.abs(canMove))
			canMove = mini;
		if (dir == up && Abottom >= Btop &&
			/*Math.abs(mini) < Math.abs(canMove)*/true)
			canMove = -step;
	} else if (Btop < Atop) {  // B is above A
		if (dir == down)
			return canMove;
		if (dir == up && Math.abs(mini) < Math.abs(canMove))
			canMove = -mini;
	} else
		throw new Error("unexpected box stacking");
	return canMove;
}

// return possible vertical movement
function canMoveVertHowMuch(box1, dir) {
	if (isAtBottomEdgeOfScreen(box1) && dir == down ||
		isAtTopEdgeOfScreen(box1) && dir == up)
		return zero;
	
	let canMove = innerHeight;
	for (box2 of boxArr) {
		canMove = helper_canMoveVertHowMuch(box1, box2, dir, canMove);
	}
	for (box2 of specialsArr) {
		canMove = helper_canMoveVertHowMuch(box1, box2, dir, canMove);
	}

	if (isCloseToTopEdgeOfScreen(box1) && dir == up) {
		let ret = -F(box1.styl.top);
		if (Math.abs(ret) < Math.abs(canMove))
			return ret;
	} else if (isCloseToBottomEdgeOfScreen(box1) && box1.vy > 0) {
		let ret = innerHeight - F(box1.styl.top) - F(box1.styl.height);
		if (Math.abs(ret) < Math.abs(canMove))
			return ret;
	}
	if (dir == up /*&& isAtBottomEdgeOfScreen(box1)*/ && step < Math.abs(canMove)) {
		return -step;
	} else if (dir == down && Math.abs(box1.vy + box1.ay) < Math.abs(canMove))
		return box1.vy + box1.ay;
	return canMove;
}

function onSurface(box1) {
	let box1Bottom = F(box1.styl.top) + F(box1.styl.height);
	if (box1Bottom == innerHeight)  // on ground?
		return true;
	for (box2 of boxArr) {  // on another box?
		if (box1 == box2)
			continue;
		let box2Top = F(box2.styl.top);
		if (box1Bottom == box2Top && canCollideVertically(box1, box2, exact))
			return true;
	}
	return false;
}

function maybeScheduleMoveRight() {
	let wantMove = step;
	let canMove = canMoveHorizHowMuch(boxArr[0], right);
	if (Math.abs(canMove) < Math.abs(wantMove))
		wantMove = canMove;
	boxArr[0].vx = wantMove;
}

function maybeScheduleMoveLeft() {
	let wantMove = -step;
	let canMove = canMoveHorizHowMuch(boxArr[0], left);
	if (Math.abs(canMove) < Math.abs(wantMove))
		wantMove = canMove;
	boxArr[0].vx = wantMove;
}

let wantJump = false;
let alreadyJumped = false;

function maybeJump() {
	wantJump = true;
}

function handleInput () {
	if (keyDdown) {
		boxArr[0].direction = right;
		maybeScheduleMoveRight();
	} else if (keyAdown) {
		boxArr[0].direction = left;
		maybeScheduleMoveLeft();
	} else {
		boxArr[0].direction = "stationary";
	}
	
	if (keyWdown) {
		maybeJump();
	} else if (!keyWdown) {
		wantJump = false;
		alreadyJumped = false;
	}
}

function freefall(box) {
	let wantVel = box.vy + box.ay;
	let dir = wantVel >= 0 ? down : up;
	let possibleVert = canMoveVertHowMuch(box, dir);
	if (Math.abs(possibleVert) < Math.abs(wantVel))
		wantVel = possibleVert;
	box.vy = wantVel;
}

function calcAniForBox1() {
	let box1 = boxArr[0];
	if (wantJump == true && !alreadyJumped && onSurface(box1)) {
		let wantVel = -5;
		let possibleVert = canMoveVertHowMuch(box1, up);
		if (Math.abs(possibleVert) < Math.abs(wantVel))
			wantVel = possibleVert;
		box1.vy = wantVel;
		wantJump = false;
		alreadyJumped = true;
	} else {  // freefall
		freefall(box1);
	}
}

function whichBoxAbove(box1, box2) {
	let box1Top = F(box1.styl.top);
	let box2Top = F(box2.styl.top);
	if (box1Top < box2Top)
		return box1;
	return box2;
}

// dont reuse this function!
function gonnaHitAnotherBox(box1, boxIgnore, dir) {
	let ret = innerWidth;
	for (let box2 of boxArr) {
		if (box1 == box2 || box2 == boxIgnore)
			continue;
		if (areCloseToTouching(box1, box2, exact) &&
			canCollideHorizontally(box1, box2, exact)) {
			let left1 = F(box1.styl.left);
			let left2 = F(box2.styl.left);
			if (dir == left && left1 < left2 ||
				dir == right && left1 > left2)
				continue;
			let newRet1 = distBetween(box1, box2, dir);
			let newRet2 = innerWidth;
			if (Math.min(newRet1, newRet2) < ret)
				ret = Math.min(newRet1, newRet2);
		}
	}
	return ret;
}

function calculateAnimations() {
	let box1 = boxArr[0];
	calcAniForBox1();  // player gets special treatment
	for (let box of boxArr) {  // patrol and freefall
		if (box.behavior == "patrol") {
			box.vx = canMoveHorizHowMuch(box, box.direction);
			if (box.vx == 0)
				if (box.direction == left)
					box.direction = right;
				else if (box.direction == right)
					box.direction = left;
		} else if (box.behavior == "vertPatrol") {
			box.vy = canMoveVertHowMuch(box, box.direction);
			if (box.vy == 0 || box.vy == -0 || -box.vy == box.ay) {
				if (box.direction == up)
					box.direction = down;
				else if (box.direction == down)
					box.direction = up;
			}
		}
		if (box != box1)
			freefall(box);
	}
	for (let box1 of boxArr) {  // platforms carry pushable objs
		if (!box1.pushable)
			continue;
		let toMove = innerWidth;
		for (let box2 of boxArr) {
			if (box1 == box2 || !areCloseToTouching(box1, box2, exact) ||
				!areTouching(box1, box2))
				continue;
			let boxAbove = whichBoxAbove(box1, box2);
			let boxBelow = box2;
			if (boxAbove == box2)
				boxBelow = box1;
			if (box1 != boxAbove || boxBelow.vx == 0)
				continue;
			let dir = box2.vx > 0 ? right : left;
			let left1 = F(box1.styl.left);
			if (dir == left && left1 < toMove)
				toMove = F(box1.styl.left);
			let right1 = left1 + F(box1.styl.width);
			if (dir == right && innerWidth - right1 < toMove)
				toMove = innerWidth - right1;
				
			let total = box1.vx + box2.vx;
			let smolMove = gonnaHitAnotherBox(box1, box2, dir);
			if (Math.abs(smolMove) < Math.abs(total))
				total = smolMove;
			if (Math.abs(total) < Math.abs(toMove))
				toMove = total;
		}
		if (toMove != innerWidth)
			box1.vx = toMove;
	}
	// hack: special case for testing
	let box3 = boxArr[2];
	box3.vx = canMoveHorizHowMuch(box3, right);
}

function moveEverything() {
	for (box of boxArr) {
		box.hndl.style.top = (F(box.styl.top) + box.vy) + px;
		box.hndl.style.left = (F(box.styl.left) + box.vx) + px;
		box.vx = 0;
	}
}
