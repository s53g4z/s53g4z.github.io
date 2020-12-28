//

function areTouching(box1, box2) {
	return canCollideHorizontally(box1, box2, exact) &&
		canCollideVertically(box1, box2, exact);
}

function areCloseToTouching(box1, box2, dir) {
	return canCollideHorizontally(box1, box2, dir) &&
		canCollideVertically(box1, box2, dir);
}

function distBetween(box1, box2, dir) {
	if (dir == right) {
		let right1 = F(box1.styl.left) + F(box1.styl.width)
		let left2 = F(box2.styl.left);
		if (right1 > left2)
			console.log("WARN: overlapping boxes");
		return left2 - right1;
	} else if (dir == down) {
		let bottom1 = F(box1.styl.top) + F(box1.styl.height);
		let top2 = F(box2.styl.top);
		if (bottom1 > top2)
			console.log("WARN: overlapping boxes (vertically)");
		return top2 - bottom1;
	} else {
		throw new Error ("unimplemeted distance for distBetween");
	}
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
		if (areTouching(box1, box2))
			return zero;
		if (areCloseToTouching(box1, box2, dir)) {
			let ret = distBetween(box1, box2, dir);
			if (dir == right)
				return ret;
			else if (dir == left)
				return -ret;
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
	let amount = canMoveVertHowMuch(boxArr[0], up);
	boxArr[0].vy = amount;
}

function handleInput () {
	if (keyDdown) {
		maybeScheduleMoveRight();
	} else if (keyAdown) {
		maybeScheduleMoveLeft();
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
		if (areTouching(box1, box2))
			return zero;
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
