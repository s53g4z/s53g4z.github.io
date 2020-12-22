//

// Return an array of boxes.
function getBoxes() {
	let boxes = new Array();
	for (let i = 0; i < 9; i++) {
		boxes[i] = document.getElementById("box" + i);
	}
	return boxes;
}

// Return true if the row at index is filled with the same character.
function checkHorizontal(index) {
	let boxes = getBoxes();
	return boxes[index + 0].innerText ==
		boxes[index + 1].innerText && boxes[index + 1].innerText ==
		boxes[index + 2].innerText;
}

// Return true if the column at index is filled with the same character.
function checkVertical(index) {
	let boxes = getBoxes();
	return boxes[index + 0].innerText ==
		boxes[index + 3].innerText && boxes[index + 3].innerText ==
		boxes[index + 6].innerText;
}

// Return true if either diagonal is filled with the same character.
function checkDiagonal() {
	let boxes = getBoxes();
	return boxes[0].innerText ==
		boxes[4].innerText && boxes[4].innerText ==
		boxes[8].innerText ||
		boxes[2].innerText ==
		boxes[4].innerText && boxes[4].innerText ==
		boxes[6].innerText;
}

// Return true if a player has won.
function win() {
	for (let i = 0; i < 9; i += 3) {
		if (checkHorizontal(i))
			return true;
	}
	for (let i = 0; i < 3; i++)
		if (checkVertical(i))
			return true;
	if (checkDiagonal())
		return true;
	return false;
}

// Return true if all boxes have been filled out.
function allBoxesFilled() {
	let boxes = getBoxes();
	for (let box of boxes) {
		if (box.innerText != "X" && box.innerText != "O")
			return false;
	}
	return true;
}

// Complete setup.
function activateBoxes() {
	let lastClick = "X";
	let tickbox = document.getElementById("goesfirst");
	if (!tickbox.checked)
		lastClick = "O";
	tickbox.disabled = false;
	tickbox.onclick = () => {
		if (lastClick == "X")
			lastClick = "O";
		else
			lastClick = "X";
	}
	for (let box of getBoxes()) {
		box.onclick = () => {
			tickbox.disabled = true;
			if (box.innerText == "X" || box.innerText == "O")
				return;
			box.style.color = "black";
			box.innerText = lastClick;
			if (win()) {
				for (let box of getBoxes()) {
					box.onclick = null;
				}
				document.getElementById("msg").innerText = lastClick + " wins."
				setTimeout(reset, 1000);  // reset the game board
			} else if (allBoxesFilled()) {
				document.getElementById("msg").innerText = "Tie game."
				setTimeout(reset, 1000);
			}
			if (lastClick == "X")
				lastClick = "O";
			else
				lastClick = "X";
		}
	}
}

// Setup.
function reset() {
	let boxes = getBoxes();
	for (let i = 0; i < 9; i++) {
		boxes[i].innerText = i;
		boxes[i].style.color = "white";
	}
	document.getElementById("msg").innerText = "Click a tile to begin.";
	activateBoxes();
}

// main?
(function() {
	reset();
})();
