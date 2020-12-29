//

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
	let Aradius = getRadius(A);
	let Bradius = getRadius(B);
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
		let dist = Bright - Aleft;
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

function canMoveHorizHowMuch(box1, dir) {
	if (isAtLeftEdgeOfScreen(box1) && dir == left ||
		isAtRightEdgeOfScreen(box1) && dir == right)
		return zero;
	for (box2 of boxArr) {
		if (box1 == box2)
			continue;
		if (areCloseToTouching(box1, box2, dir)) {
			let ret = Math.abs(distBetween(box1, box2, dir));
			if (dir == right) {
				if (F(box1.styl.left) < F(box2.styl.left))  // box1->   box2
					return +ret;
				return step;
			} else if (dir == left) {
				if (F(box2.styl.left) < F(box1.styl.left))  // box2    <-box1
					return -ret;
				return -step;
			}
		}
	}
	if (isCloseToLeftEdgeOfScreen(box1) && dir == left)
		return F(box1.styl.left) - zero;
	else if (isCloseToRightEdgeOfScreen(box1) && dir == right)
		return innerWidth - F(box1.styl.left) - F(box1.styl.width);

	if (dir == right)
		return step;
	else if (dir == left)
		return -step;
}

function maybeScheduleMoveRight() {
	boxArr[0].vx = canMoveHorizHowMuch(boxArr[0], right);
}

function maybeScheduleMoveLeft() {
	boxArr[0].vx = canMoveHorizHowMuch(boxArr[0], left);

}

function maybeJump() {
	boxArr[0].vy = canMoveVertHowMuch(boxArr[0], up);
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
	}
}

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
	return innerHeight - boxBottom < step;
}

function canMoveVertHowMuch(box1, dir) {
	if (isAtBottomEdgeOfScreen(box1) && dir == down ||
		isAtTopEdgeOfScreen(box1) && dir == up)
		return zero;
	
	for (box2 of boxArr) {
		if (box1 == box2)
			continue;
		if (areCloseToTouching(box1, box2, dir)) {
			let ret = distBetween(box1, box2, dir);
			if (dir == down)
				return ret;
			else if (dir == up)
				return -ret;
		}
	}
	
	if (isCloseToTopEdgeOfScreen(box1) && dir == up)
		return F(box1.styl.top);
	else if (isCloseToBottomEdgeOfScreen(box1) && dir == down)
		return innerHeight - F(box1.styl.top) - F(box1.styl.height);
	if (dir == up)
		if (isAtBottomEdgeOfScreen(box1)) {
			return -step;  // XXX ?
		} else
			return box1.vy + box1.ay;
	else if (dir == down)
		return box1.vy + box1.ay;
}

function calculateAnimations() {
	let box1 = boxArr[0];
	if (!keyWdown) {
		box1.vy = canMoveVertHowMuch(box1, down);
	}

	let box2 = boxArr[1];
	let box3 = boxArr[2];
	if (box2.direction == left) {
		box2.vx = canMoveHorizHowMuch(box2, left);
		if (box2.vx == 0)
			box2.direction = right;  // for next time
	} else if (box2.direction == right) {
		box2.vx = canMoveHorizHowMuch(box2, right);
		if (box2.vx == 0)
			box2.direction = left;  // for next time
	}
	box3.vx = canMoveHorizHowMuch(box3, right);
}

function moveEverything() {
	for (box of boxArr) {
		box.hndl.style.top = (F(box.styl.top) + box.vy) + px;
		box.hndl.style.left = (F(box.styl.left) + box.vx) + px;
		box.vx = 0;
	}
}

function loop2() {
	handleInput();
	calculateAnimations();
	moveEverything();
	requestAnimationFrame(loop2);
}

(function() {
	initializeInput();
	initBoxes();
	loop2();
})();
