//

let step = 5;
let keyWdown = false;
let keyDdown = false;
let keyAdown = false;
let boxArr = new Array();

// Return true if item is sitting on a surface.
function onSurface(item) {
	return !canMove("down", item);
}

// Return true if horiz is a line in-between obj.a and obj.b
function inBetween(horiz, obj) {
	return obj.a <= horiz && horiz <= obj.b;
}

// Return true if item is at a height where it can collide with aBox.
function atCollisionHeight(itemStyles, aBoxStyles, itemYV) {
	let itemTop = parseFloat(itemStyles.top);
	let itemBottom = parseFloat(itemStyles.height) + itemTop + itemYV;
	let aBoxTop = parseFloat(aBoxStyles.top);
	let aBoxBottom = parseFloat(aBoxStyles.height) + aBoxTop;
	
	return inBetween(aBoxTop, {a: itemTop, b: itemBottom}) ||
		inBetween(aBoxBottom, {a: itemTop, b: itemBottom}) ||
		inBetween(itemTop, {a: aBoxTop, b: aBoxBottom}) ||
		inBetween(itemBottom, {a: aBoxTop, b: aBoxBottom});
}

// Return true if item is at a width where it can collide with aBox.
function atCollisionWidth(itemStyles, aBoxStyles) {
	let itemLeft = parseFloat(itemStyles.left);
	let itemRight = itemLeft + parseFloat(itemStyles.width);
	let aBoxLeft = parseFloat(aBoxStyles.left);
	let aBoxRight = aBoxLeft + parseFloat(aBoxStyles.width);
	
	return inBetween(aBoxLeft, {a: itemLeft, b: itemRight}) ||
		aBoxLeft <= itemLeft && aBoxRight >= itemRight ||
		itemLeft < aBoxLeft && itemRight > aBoxRight ||
		inBetween(aBoxRight, {a: itemLeft, b: itemRight});
}

// Return true if item is above aBox.
function isAbove(itemStyles, aBoxStyles, itemYV) {
	let itemBottom = parseFloat(itemStyles.top) + parseFloat(itemStyles.height);
	let aBoxTop = parseFloat(aBoxStyles.top);
	return (itemBottom + itemYV >= aBoxTop);
}

// Return true if item is at a screen edge.
function atScreenEdge(item) {
	let itemStyles = getComputedStyle(item);
	let itemLeft = Math.ceil(parseFloat(itemStyles.left));
	let itemRight = Math.ceil(itemLeft + parseFloat(itemStyles.width));
	let itemTop = Math.ceil(parseFloat(itemStyles.top));
	let itemBottom = Math.ceil(itemTop + parseFloat(itemStyles.height));
	
	if (itemLeft + item.xv <= 0 || itemRight + item.xv >= window.innerWidth)
		return true;
	if (itemTop + item.yv <= 0 || itemBottom + item.yv >= window.innerHeight)
		return true;
	return false;
}

// Return true if item can move.
function canMove(direction, item) {
	if (atScreenEdge(item))
		return false;
	for (let i = 0; i < boxArr.length; i++) {
		let aBox = boxArr[i];
		if (aBox == item)
			continue;
		let itemStyles = getComputedStyle(item);
		let aBoxStyles = getComputedStyle(aBox);
		let itemWantLeft = parseFloat(itemStyles.left) + item.xv;
		if (!atCollisionHeight(itemStyles, aBoxStyles, item.yv) ||
			!atCollisionWidth(itemStyles, aBoxStyles))
			continue;
		let aBoxLeft = parseFloat(aBoxStyles.left);
		let aBoxRight = parseFloat(aBoxStyles.width) + aBoxLeft;
		if (direction == "left") {
			if (parseFloat(itemStyles.left) - item.xv > aBoxRight &&
				itemWantLeft <= aBoxRight)
				return false;
		} else if (direction == "right") {
			if (parseFloat(itemStyles.left) < aBoxLeft &&
				itemWantLeft + parseFloat(itemStyles.width) >= aBoxLeft)
				return false;
		} else if (direction == "down") {
			let itemBottom = parseFloat(itemStyles.top) +
				parseFloat(itemStyles.height);
			let aBoxTop = parseFloat(aBoxStyles.top);
			if (isAbove(itemStyles, aBoxStyles, item.yv) &&
				itemBottom + item.yv > aBoxTop)
				return false;
		} else if (direction == "up") {
			
		} else
			throw new Error("canMove(): unknown direction");
	}
	return true;
}

// Move the item (if possible).
function move(item) {
	let styles = getComputedStyle(item);
	if (item.xv > 0 && canMove("right", item) || item.xv < 0 && canMove("left", item))
		item.style.left =  (parseFloat(styles.left) + item.xv) + "px";
	if (item.yv > 0 && canMove("down", item) || item.yv < 0 && canMove("up", item))
		item.style.top = (parseFloat(styles.top) + item.yv) + "px";
	
	item.xv += item.xa;
	if (onSurface(item)) {
		item.yv = 0;
	} else {
		item.yv += item.ya;
	}
}

// Game loop.
function loop() {
	let box1 = document.querySelector("#box1");
	if (keyWdown) {
		box1.style.backgroundColor = "lime";
		if (onSurface(box1))
			box1.yv -= 5;
	}
	else if (!keyWdown)
		box1.style.backgroundColor = "red";
	if (keyDdown) {
		box1.xv = step;
	} else if (keyAdown) {
		box1.xv = -step;
	} else if (!keyAdown && !keyDdown) {
		box1.xv = 0;
	}
	move(box1);
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

function initializeBox1() {
	let box1 = document.querySelector("#box1");
	box1.xv = box1.xa = 0;
	box1.yv = 0;
	box1.ya = 0.2;
	boxArr.push(box1);
}

function initializeBox2() {
	let box2 = document.querySelector("#box2");
	box2.xv = box2.xa = 0;
	box2.yv = 0;
	box2.ya = 0; // stationary
	boxArr.push(box2);
}

(function() {
	initializeInput();
	initializeBox1();
	initializeBox2();
	loop();
})();
