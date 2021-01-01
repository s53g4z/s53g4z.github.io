//

function initBoxes(firstRun) {
	let a = boxArr[0];
	if (firstRun)
		a = new Box(document.querySelector("#box1"), 0.2);
	a.pushable = true;
	a.hndl.style.top = "20px";
	a.hndl.style.left = "5px";
	
	let b = new Box(null, 0.0, 0, 300, 500, 10, "skyblue");
	let c = new Box(null, 0.0, 600, 250, 300, 10, "skyblue");
	let d = new Box(null, 0.0, 375, 195, 100, 10, "skyblue");
	let e = new Box(null, 0.0, 460, 400, 75, 10, "blue", "patrol");
}

function initSpecials() {
	document.querySelector("#playerCoins").innerText = "Coins: 0";
	playerCoins = 0;
	
	let a = new Coin(840, 200);
	let b = new Coin(780, 200);
	let c = new Coin(720, 200);
	let d = new CoinBox(290, 165);
	let e = new Coin(15, 320);
	return;
}

function loop2() {
	handleInput();
	calculateAnimations();
	moveEverything();
	if (anythingInterestingHappen()) {
		initBoxes(false);
		initSpecials();
	}
	requestAnimationFrame(loop2);
}

(function() {
	initializeInput();
	initBoxes(true);  // true: first time running
	initSpecials();
	loop2();
})();
