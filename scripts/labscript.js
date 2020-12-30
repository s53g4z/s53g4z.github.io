//

function canMoveHorizHowMuch(box1, dir) {
	if (isAtLeftEdgeOfScreen(box1) && dir == left ||
		isAtRightEdgeOfScreen(box1) && dir == right)
		return zero;
	let canMove = step;
	if (dir == left)
		canMove = -step;
	for (box2 of boxArr) {
		if (box1 == box2)
			continue;
		if (areCloseToTouching(box1, box2, dir) &&
			canCollideHorizontally(box1, box2, dir)) {
			let ret = Math.abs(distBetween(box1, box2, dir));
			if (dir == right) {
				if (F(box1.styl.left) < F(box2.styl.left) &&
					Math.abs(ret) < Math.abs(canMove))  // box1->   box2
					canMove = +ret;
			} else if (dir == left) {
				if (F(box2.styl.left) < F(box1.styl.left) &&
					Math.abs(ret) < Math.abs(canMove))  // box2    <-box1
					canMove = -ret;
			}
		}
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

// return possible vertical movement
function canMoveVertHowMuch(box1, dir) {
	if (isAtBottomEdgeOfScreen(box1) && dir == down ||
		isAtTopEdgeOfScreen(box1) && dir == up)
		return zero;
	
	let canMove = innerHeight;  // hack why innerheight?
	for (box2 of boxArr) {
		if (box1 == box2)
			continue;
		if (areCloseToTouching(box1, box2, dir) &&
			canCollideVertically(box1, box2, dir)) {
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
					continue;
				if (dir == up && Math.abs(mini) < Math.abs(canMove))
					canMove = -mini;
			} else
				throw new Error("unexpected box stacking");
		}
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
	if (dir == up && isAtBottomEdgeOfScreen(box1) && step < Math.abs(canMove)) {
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

function calculateAnimations() {
	let box1 = boxArr[0];
	calcAniForBox1();  // player gets special treatment
	for (let box of boxArr) {
		if (box.behavior == "patrol") {
			box.vx = canMoveHorizHowMuch(box, box.direction);
			if (box.vx == 0)
				if (box.direction == left)
					box.direction = right;
				else if (box.direction == right)
					box.direction = left;
		}
		if (box != box1)
			freefall(box);
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
