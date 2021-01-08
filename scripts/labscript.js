//

function initBoxes(firstRun) {
	let a = boxArr[0];
	if (firstRun)
		a = new Box(document.querySelector("#box1"), 0.2);
	a.pushable = true;
	a.hndl.style.top = "40px";
	a.hndl.style.left = "5px";
	//a.hndl.style.backgroundColor = "";
	
	let b = new Box(null, 0.0, 0, 300, 500, 10, "skyblue");
	let c = new Box(null, 0.0, 600, 250, 300, 10, "skyblue");
	let d = new Box(null, 0.0, 375, 195, 100, 10, "skyblue");
	let e = new Box(null, 0.0, 460, 400, 75, 10, "blue", "patrol");
}

function initSpecials() {
	document.querySelector("#playerCoins").innerText = "Coins: 0";
	playerCoins = 0;
	
	let a = new Coin(840, 195);
	let b = new Coin(780, 195);
	let c = new Coin(720, 195);
	let d = new CoinBox(290, 165);
	let e = new Coin(15, 320);
	// note: Special(hndl, x, y, width, height, type)
	let f = new Special(null, 750, 325, 50, 50, portal);
	let g = new Special(null, 395, 128, 50, 50, badguy);
	return;
}

function initBoxes2() {
	// level 2!
	let player = boxArr[0];
	player.hndl.style.top = "310px";
	player.hndl.style.left = "855px";

	let b = new Box(null, 0.0, 520, 350, 300, 10, "skyblue");
	let c = new Box(null, 0.0, 830, 380, 100, 10, "skyblue");
	let d = new Box(null, 0.0, 800, 250, 100, 10, "skyblue");
	let e = new Box(null, 0.0, 70, 320, 250, 10, "skyblue");
	let f = new Box(null, 0.0, 235, 270, 50, 10, "skyblue");
	let g = new Box(null, 0.0, 270, 205, 50, 10, "skyblue");
	let h = new Box(null, 0.0, 740, 290, 50, 10, "skyblue");
	let i = new Box(null, 0.0, 500, 150, 300, 10, "skyblue");
}

function initSpecials2() {
	let a = new CoinBox(50, 160);
	let b = new CoinBox(105, 160);
	let c = new CoinBox(160, 160);
	let d = new Coin(750, 35);
	let e = new Special(null, 845, 170, 50, 50, portal);
	let f = new Special(null, 550, 285, 50, 50, badguy);
}

function level1(firstRun) {
	currLevel = 1;
	document.getElementById("whatLevel").innerText = "Level " + currLevel;
	initBoxes(firstRun);
	initSpecials();
}

function level2() {
	currLevel = 2;
	document.getElementById("whatLevel").innerText = "Level " + currLevel;
	initBoxes2();
	initSpecials2();
}

function initBoxes3() {
	// to be continued ...
}

function initSpecials3() {
	
}

function level3() {
	if (currLevel != 3)
		throw new Error("currLevel corruption");
	document.getElementById("whatLevel").innerText = "Level " + currLevel;
	initBoxes3();
	initSpecials3();
}

let prevTime = 0;

function loop() {
	let currTime = Date.now();
	if (currTime - prevTime < 1000 / 75) {  // not perfect, but ..
		requestAnimationFrame(loop);
		return;
	}
	prevTime = currTime;
	
	if (innerHeight < bottomEdge || innerWidth < rightEdge) {
		alert("Please resize the window larger. Then, press OK.");
		requestAnimationFrame(loop);
		return;
	}
	
	handleInput();
	calculateAnimations();
	moveEverything();
	if (anythingInterestingHappen()) {
		level1(false);
	}
	requestAnimationFrame(loop);
}

function initLevelsArr() {
	levelsArr[0] = null;
	levelsArr[1] = level1;
	levelsArr[2] = level2;
	levelsArr[3] = level3;
	
	currLevel = 1;
}

(function() {
	initializeInput();
	initLevelsArr();
	level1(true);  // 'true' for level1() means first run of the game
	loop();
})();
