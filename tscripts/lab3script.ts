//

type Color = string;
type Direction = "left" | "right" | "up" | "down";
type Bonus = "coin";
type Contents = "coin" | "powerup";
type PlayerSize = "smol" | "big";
type Point = {
	x: number,
	y: number
};

class PreLoadImg {
	static imgElems = new Array<HTMLImageElement>();
	constructor() {
		throw new Error("tried to construct a preloadimg");
	}
	static preload(url: string) {
		const imgElem = document.createElement("img");
		imgElem.src = url;
		imgElem.style.position = "fixed";
		imgElem.style.opacity = "0.0001%";
		imgElem.style.width = "1px";
		document.body.appendChild(imgElem);
		this.imgElems.push(imgElem);
	}
	static getImg(index: number) {
		if (index >= this.imgElems.length)
			throw new Error("tried to access nonexistent image in cache");
		const imgElem: HTMLImageElement =
			<HTMLImageElement> this.imgElems[index].cloneNode();
		imgElem.style.position = "";
		imgElem.style.opacity = "";
		imgElem.style.width = "100%";
		return imgElem;
	}
}

class WorldItem {
	x: number;
	y: number;
	width: number;
	height: number;
	color: Color;
	div: HTMLDivElement;
	accel: number;
	constructor(x: number, y: number, width: number, height: number,
		color: Color, className: string) {
		this.div = document.createElement("div");
		this.div.style.position = "fixed";
		this.div.style.left = x + "px";
		this.div.style.top = y + "px";
		this.div.style.width = width + "px";
		this.div.style.height = height + "px";
		this.div.style.backgroundColor = color;
		this.div.className = className;
		document.body.appendChild(this.div);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.accel = 0;
		GameState.appendToWS(this);
	}
	topI(): number {
		return Math.round(this.y);
	}
	bottomI(): number {
		return Math.round(this.y + this.height);
	}
	leftI(): number {
		return Math.round(this.x);
	}
	rightI(): number {
		return Math.round(this.x + this.width);
	}
	die(): void {
		GameState.removeFromWS(this);
	}
	getClassName(): string {
		return this.div.className;
	}
	setClassName(newName: string): void {
		this.div.className = newName;
	}
	getColor(): string {
		return this.color;
	}
	setColor(newColor: string): void {
		this.color = newColor;
		this.div.style.backgroundColor = newColor;
	}
	scroll(amount: number): void {
		this.x += amount;
		this.div.style.left = this.x + "px";
	}
	stepState(): void {
		throw new Error("child of WorldItem has undefined stepState()");
	}
}

class Brick extends WorldItem {
	destructible: boolean;
	
	constructor(x: number, y: number, width: number, height: number,
		color: Color, className: string = "brick",
		destructible: boolean = false) {
		super(x, y, width, height, color, className);
		this.destructible = destructible;
	}
	
	stepState(): void {
		if (!this.destructible)
			return;
		const player: Player = GameState.getPlayer();
		const collisions: Array<WorldItem> = Util.isCollidingWith(this);
		for (const c of collisions) {
			if (c !== player || c.topI() - 1 !== this.bottomI())
				continue;
			// is headbutt by player! destroy self
			player.accel = -player.accel;
			return this.die();
		}
	}
}

class Platform extends Brick {
	start: Point;
	end: Point;
	speed: number;
	constructor(width: number, height: number, start: Point = {x: 0, y: 0},
		end: Point = {x: 0, y: 0}, speed: number = 0) {
		super(start.x, start.y, width, height, "blueviolet", "platform", false);
		this.start = start;
		this.end = end;
		this.speed = speed;
		if (this.start.x > this.end.x)
			throw new Error("invalid start/end points for Platform");
	}
	scroll(amount: number): void {
		this.x += amount;
		this.div.style.left = this.x + "px";
		this.start.x += amount;
		this.end.x += amount;
	}
	// ???
	findHighestWorldItem(baseItem: WorldItem) {
		let stack = new Array<WorldItem>();
		let base = baseItem;
		stack.push(base);
		for (;;) {  // for each layer of items on the stack
			let tallestInLayer = null;
			for (const w of GameState.ws) {
				if (w.bottomI() + 1 !== base.topI())
					continue;  // if can't collide with base, continue
				const collisions: Array<WorldItem> =
					Util.isCollidingWith(base);
				for (const c of collisions)
					if (c === w) {  // if colliding with
						stack.push(w);
						if(!tallestInLayer ||  // if taller than tIL
							w.height > tallestInLayer.height) {
							tallestInLayer = w;  // remember it
							break;
						}
					}
				// search rest of world-state for even taller items in the layer
			}
			if (tallestInLayer)  // found the tallest!
				base = tallestInLayer;  // continue looking up the stack
			else  // no items in layer
				break;
		}
		return stack;
	}
	stepState(): void {
		if (this.speed === 0)
			return;
		let distBetweenEndpoints = 0;
		if (this.speed > 0) {
			distBetweenEndpoints = Math.sqrt(
				Math.pow(this.end.x - this.x, 2) +
				Math.pow(this.end.y - this.y, 2));
		} else {
			distBetweenEndpoints = Math.sqrt(
				Math.pow(this.x - this.start.x, 2) +
				Math.pow(this.y - this.start.y, 2));
		}
		if (distBetweenEndpoints < 1) {
			// snap to start or end
			if (Math.abs(this.x - this.start.x) < 1 &&
				Math.abs(this.y - this.start.y) < 1) {
				this.x = this.start.x;
				this.y = this.start.y;
			} else {
				this.x = this.end.x;
				this.y = this.end.y;
			}
			distBetweenEndpoints = 0;
		} else {
			const origSpeed = this.speed;
			if (distBetweenEndpoints < Math.abs(this.speed))
				this.speed = distBetweenEndpoints * (this.speed > 0 ? 1 : -1);
			let rise = 0;
			let run = 0;
			if (this.speed > 0) {
				rise = this.end.y - this.y;
				run = this.end.x - this.x;
			} else {  // speed < 0
				rise = this.y - this.start.y;
				run = this.x - this.start.x;
			}
			
			const scaleFactor = this.speed / distBetweenEndpoints;
			let deltaY = rise * scaleFactor;
			let deltaX = run * scaleFactor;
			if (Math.abs(deltaY) > Math.abs(this.speed) + 0.01 ||  // arbitrary E
				Math.abs(deltaX) > Math.abs(this.speed) + 0.01) {  // ibid
				console.warn("programmer error: delta is greater than speed");
				console.warn("delta: ", deltaX, ", speed: ", this.speed);
			}
			//this.accel = deltaY;
			const stack = this.findHighestWorldItem(this);
			let highestInStack = stack[0];  // moving down, so get lowest item
			if (deltaY < 0)  // moving up, so get highest item
				highestInStack = stack[stack.length - 1];
			const origAccelHIS = highestInStack.accel;
			highestInStack.accel = deltaY;
			let canMoveY = Util.canMoveTo(highestInStack, "up");
			let canMoveX = Util.canMoveTo(this,
				this.speed > 0 ? "right" : "left", Math.abs(deltaX));
			highestInStack.accel = origAccelHIS;
			deltaY = canMoveY - highestInStack.topI();
			deltaX = Math.round(canMoveX - this.x);
			for (let i = 1; i < stack.length; i++)
				if (stack[i].getClassName() === "platform") {
					deltaY = 0;
				}
			
			for (const w of stack) {
				w.x += deltaX;
				w.y += deltaY;
				w.div.style.left = w.x + "px";
				w.div.style.top = w.y + "px";
			}
			this.speed = origSpeed;
		}
		
		if (this.x === this.end.x && this.y === this.end.y ||
			this.x === this.start.x && this.y === this.start.y ||
			this.x > this.end.x || this.x < this.start.x ||
			false)
			this.speed = -this.speed;
	}
}

class Coin extends Brick {
	constructor(x: number, y: number) {
		super(x, y, 50, 50, "yellow", "coin");
	//	this.div.style.borderRadius = 25 + "px";
		this.div.innerText = "$";
	}
	
	stepState(): void {
		const p: Player = GameState.getPlayer();
		const collisions: Array<WorldItem> = Util.isCollidingWith(this);
		for (const c of collisions)
			if (p === c) {
				GameState.setNCollectedCoins(
					GameState.getNCollectedCoins() + 1);
				return this.die();
			}
	}
}

class PowerUp extends Brick {
	contents: Bonus;
	active: boolean;
	constructor(x: number, y: number) {
		super(x, y, 50, 50, "green", "powerup");
		const imgHandle = PreLoadImg.getImg(0);
		this.div.appendChild(imgHandle);
	}
	makeBigPlayer(): void {
		GameState.getPlayer().grow();
	}
	stepState(): void {
		const p: Player = GameState.getPlayer();
		const collisions: Array<WorldItem> = Util.isCollidingWith(this);
		for (const c of collisions)
			if (p === c) {
				this.makeBigPlayer();
				return this.die();
			}
	}
}

class QuestionBox extends WorldItem {
	active: boolean;
	contents: Contents;
	constructor(x: number, y: number, spawns: string = "$") {
		super(x, y, 50, 50, "skyblue", "qbox");
		this.active = true;
		this.div.innerText = "?";
		if (spawns === "$")
			this.contents = "coin";
		else
			this.contents = "powerup";
	}
	deactivate(): void {
		this.div.style.backgroundColor = "grey";
		this.div.style.color = "black";
		this.active = false;
	}
	stepState(): void {
		if (!this.active)
			return;
		const p: Player = GameState.getPlayer();
		if (p.topI() - 1 === this.bottomI()) {
			const colls: Array<WorldItem> = Util.isCollidingWith(this);
			for (const col of colls)
				if (col === p) {
					if (this.contents === "coin")
						new Coin(this.x, this.y - 50);
					else if (this.contents === "powerup")
						new PowerUp(this.x, this.y - 50);
					this.deactivate();
					break;
				}
		}
	}
	die(): void {  // blown up by a bomb?
		this.deactivate();
	}
}

class AliveWorldItem extends WorldItem {
	alive: boolean;
	constructor(x: number, y: number, width: number, height: number,
		color: Color, className: string = "unknown") {
		super(x, y, width, height, color, className);
		this.accel = 0;
		this.alive = true;
	}
}

class Turret extends AliveWorldItem {
	framesPeaceful: number;
	constructor(x: number, y: number) {
		super(x, y, 10, 50, "", "turret");
		this.framesPeaceful = 0;
	}
	calculateTheta(): number {
		const p = GameState.getPlayer();
		const playerCenter: Point = {x: p.x + p.width/2, y: p.y + p.height/2};
		const turretCenter: Point = {x: this.x + 25, y: this.y + 25};
		const sideX = turretCenter.x - playerCenter.x;
		const sideY = turretCenter.y - playerCenter.y;
		let theta = 0;  // in degrees
		if (sideY === 0)
			theta = sideX > 0 ? 180 : 0;  // player on left or right
		else {  // (sideY !== 0)
			theta = Math.atan(sideY / sideX) * 180 / 3.141592653589;;
			if (sideX < 0) {
				theta = -theta;
			} else
				theta = 180 - theta;
		}
		const jitter = 5 * (Math.random() * 2 - 1);
		return theta + jitter;
	}
	stepState(): void {
		if (++this.framesPeaceful < 6) {
			return;
		} else
			this.framesPeaceful = 0;
		
		const theta = this.calculateTheta();
		const laserHandle = new Laser(this.x + this.width / 2,
			this.y + this.height / 2, 25, theta);
		laserHandle.div.style.opacity = "0";
		this.div.style.transform = "rotate(" + (-theta + 90) + "deg)";
	}
}

class Laser extends AliveWorldItem {
	speed: number;
	distanceTraveled: number
	theta: number;
	constructor(x: number, y: number, speed: number = 20, angleD: number = 0) {
		super(x, y, 25, 5, "red", "laser");
		this.speed = speed;
		this.distanceTraveled = 0;
		this.theta = angleD % 360 * 3.141592653589 / 180;
		// imperfect b/c moveSelf() rounds movement
		this.div.style.transform = "rotate(" + (-angleD % 360) + "deg)";
	}
	moveSelf(): void {
		const wantMoveY = Math.round(this.speed * Math.sin(this.theta) * -1
			* 10) / 10;
		const wantMoveX = Math.round(this.speed * Math.cos(this.theta)
			* 10) / 10;
		this.accel = wantMoveY;
		// buggy b/c lasers can rotate around
		this.x = Util.canMoveTo(this, wantMoveX > 0 ? "right" : "left",
			Math.abs(wantMoveX));
		this.y = Util.canMoveTo(this, "down");
	}
	decorateSelf(): void {
		this.div.style.left = this.x + "px";
		this.div.style.top = this.y + "px";
		this.div.style.opacity = "1";
		
		const collisions = Util.isCollidingWith(this);
		for (const c of collisions)
			if (c.getClassName() === "turret")
				this.div.style.opacity = "0";
	}
	processCollisions(): number {
		const collisions = Util.isCollidingWith(this);
		for (const c of collisions)
			if (c === GameState.getPlayer() || c.getClassName() === "badguy")
				c.die();
			else if (c.getClassName() === "bomb")
				(c as Bomb).die(true);
			else if (c.getClassName() === "brick" && (c as Brick).destructible)
				c.die();
		
		let nCollisions = collisions.length;
		for (let i = 0; i < collisions.length; i++)
			if (collisions[i].getClassName() === "laser" ||
				collisions[i].getClassName() === "turret")
				nCollisions--;  // allow lasers to overlap lasers and turrets
		return nCollisions;
	}
	stepState(): void {
		this.moveSelf();
		this.decorateSelf();
		let nCollisions = this.processCollisions();
		this.distanceTraveled += Math.abs(this.speed);

		if (nCollisions > 0 ||
			this.distanceTraveled > 5000 ||
			this.y === Util.bottomEdge - this.height - 1 ||
			this.y === Util.topEdge + 1)
			this.die();
	}
}

class BuzzSaw extends AliveWorldItem {
	constructor(x: number, y: number, width: number = 50, height: number = 50) {
		super(x, y, width, height, "", "buzzsaw");
		const imgHandle = PreLoadImg.getImg(1);
		this.div.appendChild(imgHandle);
	}
	stepState(): void {
		const collisions = Util.isCollidingWithCircular(this);
		for (const c of collisions)
			if (c === GameState.getPlayer() || c.getClassName() === "badguy")
				c.die();
			else if (c.getClassName() === "bomb")
				(c as Bomb).die(true);
	}
}

class BadGuy extends AliveWorldItem {
	dir: Direction;
	patrol: boolean;
	movementSpeed: number;
	framesSkippedTurning: number;
	constructor(x: number, y: number, width: number, height: number,
		color: Color, dir: Direction = "right", patrol: boolean = false,
		ms: number = 3, className: string = "badguy") {
		super(x, y, width, height, color, className);
		this.dir = dir;
		this.patrol = patrol;
		this.movementSpeed = ms;
		this.accel = 0;
		this.framesSkippedTurning = 0;
	}
	
	steppedOn(): boolean {
		const p: Player = GameState.getPlayer();
		if (p.bottomI() + 1 == this.topI()) {
			const collisions: Array<WorldItem> = Util.isCollidingWith(this);
			for (const col of collisions)
				if (col == p)
					return true;
		}
		return false;
	}
	
	touchingPlayer(): boolean {
		const p: Player = GameState.getPlayer();
		const collisions: Array<WorldItem> = Util.isCollidingWith(this);
		for (const c of collisions)
			if (p === c)
				return true;
		return false;
	}
	
	die(): void {
		//GameState.getPlayer().accel = 0;
		this.div.innerText = "x.x";
		this.setClassName("deadbadguy");
		this.height /= 2;
		this.y += this.height;
		this.div.style.top = this.y + "px";
		this.div.style.height = this.height + "px";
		if (this.dir === "right")
			this.div.style.textAlign = "end";
		this.div.style.zIndex = "-1";
		this.alive = false;
		let timeout = window.setTimeout(() => {
			GameState.removeFromWS(this)
		}, 2000);
		GameState.recordTimeout(timeout);
	}
	
	// helper for stepState()
	horizCanMoveTo(): void {
		const hMove: number = Util.canMoveTo(this, this.dir,
			this.movementSpeed);
		if (hMove === this.x)
			this.maybeTurnAround();
		
		const oldX: number = this.x;
		const oldOnSurface: boolean = Util.onSolidSurface(this);
		this.x = hMove + (this.dir === "left" ? - (this.width / 2) :
			(this.width / 2));  // why???
		if (this.patrol && oldOnSurface && !Util.onSolidSurface(this)) {
			this.x = oldX;
			this.maybeTurnAround();
		} else 
			this.x = hMove;
	}
	// helper for stepState()
	maybeTurnAround(): void {
		if (this.framesSkippedTurning <= 20)
			return;
		this.framesSkippedTurning = 0;
		if (this.dir === "right")
			this.dir = "left";
		else
			this.dir = "right";
	}
	decorateDOMSelf(): void {
		this.div.innerText = "@_@";
		this.div.style.textAlign = "left";
		if (this.dir === "right")
			this.div.style.textAlign = "end";
		this.div.style.left = this.x + "px";
		this.div.style.top = this.y + "px";
	}
	stepState(): void {
		if (!this.alive)
			return;
		this.framesSkippedTurning++;


		if (this.steppedOn() || this.bottomI() == Util.bottomEdge - 1)
			this.die();
		else if (this.touchingPlayer())
			GameState.getPlayer().die();
		
		if (this.alive) {
			this.horizCanMoveTo();
			if (Util.onSolidSurface(this))
				this.accel = 0;
			else
				this.accel += 1.0;
			this.y = Util.canMoveTo(this, "down");
		}

		this.decorateDOMSelf();
	}
}

class Bomb extends BadGuy {
	isTicking: boolean;
	constructor(x: number, y: number, dir: Direction = "right") {
		super(x, y, 50, 50, "hotpink", dir, true, 3, "bomb");
		this.isTicking = false;
	}
	
	explode(): void {
		this.x -= 50;
		this.y -= 50;
		this.width *= 3;
		this.height *= 3;
		
		this.stepState = () => {
			if (this.touchingPlayer())
				GameState.getPlayer().die();
		};

		this.div.style.width = this.width + "px";
		this.div.style.height = this.height + "px";
		this.div.style.left = this.x + "px";
		this.div.style.top = this.y + "px";
		this.div.className = "explodingbomb";
		
		const colls: Array<WorldItem> = Util.isCollidingWith(this);
		for (const c of colls) {
			if (c.getClassName() === "coin" || c.getClassName() === "qbox" ||
				c.getClassName() === "badguy" || c.getClassName() === "bomb" ||
				c.getClassName() === "player")
				c.die();
		}
	}
	
	die(immediately: boolean = false): void {
		if (this.isTicking)
			return;
		
		//GameState.getPlayer().accel = 0;
		this.div.innerText = "O.O";
		this.div.className = "tickingbomb";
		
		const flickerHandle = window.setInterval(() => {
			if (this.div.style.backgroundColor != "hotpink")
				this.div.style.backgroundColor = "hotpink";
			else
				this.div.style.backgroundColor = "red"
		}, 250);
		GameState.recordTimeout(flickerHandle);
		
		const stopflickerHandle = window.setTimeout(() => {  // buggy
			window.clearInterval(flickerHandle);
			this.explode();
			const deleteBombHandle = window.setTimeout(() => {
				GameState.removeFromWS(this);
			}, 500);
			GameState.recordTimeout(deleteBombHandle);
		}, immediately ? 0 : 2000);
		GameState.recordTimeout(stopflickerHandle);
		
		this.isTicking = true;
	}
	
	decorateDOMSelf(): void {
		this.div.innerText = "-.-";
		if (this.isTicking)
			this.div.innerText = "O.O";
		this.div.style.textAlign = "left";
		if (this.dir === "right")
			this.div.style.textAlign = "end";
		this.div.style.left = this.x + "px";
		this.div.style.top = this.y + "px";
	}
}

class Player extends AliveWorldItem {
	isJumping: boolean;
	alreadyJumped: boolean;
	sz: PlayerSize;
	invincible: boolean;
	wasOnBadGuy: boolean;
	
	constructor(x: number, y: number, sz: PlayerSize) {
		super(x, y, 50, 50, "", "player");
		this.div.style.zIndex = "1";
		this.sz = sz;
		if (this.sz === "big") {
			this.sz = "smol";
			this.grow();
		}
		
		this.wasOnBadGuy = false;
		this.invincible = false;
		this.accel = 0;
		this.isJumping = false;
		this.alreadyJumped = false;
		this.setText();
		if (GameState.getPlayer())
			throw new Error("attempted to spawn a second player");
		GameState.setPlayer(this);
	}
	grow(): void {
		if (this.sz === "big")
			return;  // can't grow twice
		this.height *= 2;
		this.div.style.height = this.height + "px";
		this.y -= this.height / 2;
		this.div.style.top = this.topI() + "px";
		this.sz = "big";
	}
	shrink(): void {
		if (this.sz !== "big")
			throw new Error("bad player shrink() call");
		this.height /= 2;
		this.div.style.height = this.height + "px";
		this.sz = "smol";
		this.invincible = true;
		const invincibleTimerHandle = window.setTimeout(() => {
			this.invincible = false;
			this.setColor("limegreen");
		}, 1000);
		GameState.recordTimeout(invincibleTimerHandle);
	}
	setText(): void {
		const child: HTMLDivElement = document.createElement("div");
		child.innerText = "OwO";
		child.style.textAlign = "end";
		child.className = "playertext";
		this.div.appendChild(child);
	}
	jump(): void {  // helper fn for stepState()
		this.isJumping = true;
		this.alreadyJumped = true;
		this.accel = -13;
		this.y = Util.canMoveTo(this, "up");
	}
	fall(): void {  // helper fn for stepState()
		if (!Util.isWDown)
			this.alreadyJumped = false;
		this.isJumping = false;
		if (Util.onSolidSurface(this))  // player landed
			this.accel = 0;
		else {  // contine falling
			this.accel += 0.5;
			const canMoveToY = Util.canMoveTo(this, "down");
			if (this.y === canMoveToY)
				this.accel = -this.accel;  // bonk
			this.y = canMoveToY;
		}
	}
	die(): void {
		if (!this.alive)
			return;
		if (this.sz == "big") {
			this.shrink();
			return;
		}
		else if (this.invincible)
			return;
		else
			this.alive = false;
		
		GameState.setNLivesLeft(GameState.getNLivesLeft() - 1);
		GameState.drawGUI();
		
		// animate death
		const playerTextDiv: HTMLDivElement = 
			<HTMLDivElement> this.div.getElementsByClassName("playertext")[0];
		playerTextDiv.innerText = "XwX";
		playerTextDiv.className = "playertextdying";
		this.stepState = () => { };  // stop processing user input
		this.setClassName("dyingplayer");
		
		let resetDelay = 0;
		if (GameState.getNLivesLeft() === 0)
			alert("Game Over! Press OK to play again.");
		else
			resetDelay = 2000;
		const resetWorldTimeoutHandle = window.setTimeout(() => {
			Init.resetWorld();
		}, resetDelay);
		GameState.recordTimeout(resetWorldTimeoutHandle);
	}
	maybeScroll(): void {
		const origX = this.x;
		const scrollLine = (Util.rightEdge - Util.leftEdge) / 3;
		const scrollLine2 = 10;
		if (origX > scrollLine)
			for (const w of GameState.ws)
				w.scroll(-origX + scrollLine);
		else if (origX < scrollLine2)
			for (const w of GameState.ws)
				w.scroll(scrollLine2 - origX);
	}
	uwu(): HTMLDivElement {
		const owo: HTMLDivElement =
			<HTMLDivElement> this.div.getElementsByClassName("playertext")[0];
		if (!owo)
			throw new Error("player must have a child div!");
		return owo;
	}
	flicker(): void {
		if (this.getColor() === "limegreen")
			this.setColor("greenyellow");
		else
			this.setColor("limegreen");  // also see the CSS file
	}
	onBadGuy(): boolean {
		for (const w of GameState.ws)
			if (w !== this && (w.getClassName() === "badguy" ||
				w.getClassName() === "bomb" ||
				w.getClassName() === "tickingbomb") &&
				this.bottomI() + 1 === w.topI()) {
				const collisions: Array<WorldItem> = Util.isCollidingWith(this);
				for (const c of collisions)
					if (c === w)
						return true;
			}
		return false;
	}
	stepState(): void {
		if (this.invincible)
			this.flicker();
		
		if (this.bottomI() === Util.bottomEdge - 1) {
			this.die();
			return;
		}
		
		let owo: HTMLDivElement = this.uwu();
		
		if (Util.isDDown) {
			this.x = Util.canMoveTo(this, "right", 9);
			owo.style.textAlign = "end";
		}
		if (Util.isADown) {
			this.x = Util.canMoveTo(this, "left", 9);
			owo.style.textAlign = "left";
		}
		if (Util.isWDown && (this.wasOnBadGuy ||
			!this.alreadyJumped && Util.onSolidSurface(this)))
			this.jump();
		else
			this.fall();
		if (this.onBadGuy())
			this.wasOnBadGuy = true;
		else
			this.wasOnBadGuy = false;
		this.div.style.left = this.x + "px";
		this.div.style.top = this.y + "px";
		
		this.maybeScroll();
	}
}

class Teleporter extends WorldItem {
	nextLevel: (sz: PlayerSize) => void;
	
	constructor(x: number, y: number, nextLevel) {
		super(x, y, 50, 50, "#9CFF9C", "teleporter");
		this.nextLevel = nextLevel;
	}
	
	stepState() {
		const collisions = Util.isCollidingWith(this);
		for (const c of collisions)
			if (c === GameState.getPlayer()) {
				const szPlayer = GameState.getPlayer().sz;
				GameState.clearTimeouts();
				GameState.clearElemsOfWS();
				this.nextLevel(szPlayer);
			}
	}
}

class GameState {
	constructor() {
		throw new Error("attempted to construct a GameState");
	}
	static ws: WorldItem[] = new Array<WorldItem>();
	static player: Player = null;
	static currLevel = null;
	static nCollectedCoins = 0;
	static nLivesLeft = 4;
	static timeOuts = new Array();
	static before = 0;
	static now = 1;
	
	static appendToWS(w: WorldItem): void {
		this.ws.push(w);
	}
	static removeFromWS(trash: WorldItem): void {
		for (let i = 0; i < this.ws.length; i++)
			if (this.ws[i] === trash) {
				this.ws.splice(i--, 1);  // clean the .ws array
				break;
			}
		const div = trash.div;
		div.parentNode.removeChild(div);  // clean the DOM
	}
	// destroy all worldly items
	static clearElemsOfWS(): void {
		for (let i = 0; i < this.ws.length; i++) {
			this.removeFromWS(this.ws[i]);
			i--;
		}
		this.player = null;
	}
	static setPlayer(p: Player): void {
		this.player = p;
	}
	static getPlayer(): Player {
		return this.player;
	}
	// Return the number of coins collected by the player.
	static getNCollectedCoins(): number {
		return this.nCollectedCoins;
	}
	// Set the number of coins collected by the player.
	static setNCollectedCoins(n: number): void {
		if (n < 0)
			throw new Error("nCollectedCoins must be >= 0");
		this.nCollectedCoins = n;
	}
	// helper fn for drawGUI().
	static getDOMElemById(id: string): HTMLElement {
		let div = document.getElementById(id);
		if (!div) {
			let newdiv: HTMLDivElement = document.createElement("div");
			newdiv.id = id;
			newdiv.style.margin = "0.5vw";
			document.body.appendChild(newdiv);
			div = newdiv;
		}
		return div;
	}
	// helper fn for drawGUI().
	static getGUIncoins(): HTMLElement {
		return this.getDOMElemById("GUIncoins");
	}
	// helper fn for drawGUI().
	static getGUInlives(): HTMLElement {
		return this.getDOMElemById("GUInlives");
	}
	static getNLivesLeft(): number {
		if (this.nLivesLeft < 0)
			throw new Error("nLivesLeft is less than zero");
		return this.nLivesLeft;
	}
	static setNLivesLeft(n: number): void {
		if (n < 0)
			throw new Error("nLivesLeft is less than zero");
		this.nLivesLeft = n;
	}
	static drawGUI(): void {
		const ncoinsDiv = this.getGUIncoins();
		ncoinsDiv.innerText = "Coins: " +
			Util.formatToFourDigits(this.getNCollectedCoins());
		const nlivesDiv = this.getGUInlives();
		nlivesDiv.innerText = "Lives: " +
			Util.formatToFourDigits(this.getNLivesLeft());
	}
	// Make note of the timeout.
	static recordTimeout(timeout: number) {
		this.timeOuts.push(timeout);
	}
	// Destroy all timeouts.
	static clearTimeouts(): void {
		for (let i = 0; i < this.timeOuts.length; i++) {
			window.clearTimeout(this.timeOuts[i]);
			this.timeOuts.splice(i--, 1);
		}
		if (this.timeOuts.length !== 0)
			throw new Error("programming error on clearTimeouts()");
	}
}

class UtilHelpers {
	constructor() {
		throw new Error("class UtilHelpers cannot be constructed!");
	}
	// might need a rewrite
	static canMoveStepperX(p: WorldItem, maxStep: number): number {
		let canMoveToX: number = p.x;
		for (let i = 0; i < Math.abs(maxStep); i++) {
			let j: number = maxStep > 0 ? i : -i;
			p.x += j;
			const collisions: Array<WorldItem> = Util.isCollidingWith(p);
			let shouldBreak: boolean = false;
			for (const c of collisions)
				if (c.getClassName() !== "coin" &&
					c.getClassName() !== "teleporter" &&
					c.getClassName() !== "deadbadguy" &&
					c.getClassName() !== "buzzsaw" &&
					c.getClassName() !== "laser" &&
					!(p.getClassName() === "turret" && c.getClassName() === "laser") &&  // not case of laser overlapping a turret
					(maxStep > 0 && p.rightI() + 1 === c.leftI() ||
					maxStep < 0 && p.leftI() - 1 === c.rightI())) {
					shouldBreak = true;  // found a collision, stop
					break;
				}
			p.x -= j;
			if (shouldBreak)
				break;
			canMoveToX += maxStep > 0 ? 1 : -1;
		}
		return canMoveToX;
	}
	// might also need a rewrite. really similar to canMoveStepperX().
	static canMoveStepperY(p: WorldItem) {
		let canMoveToY: number = p.y;
		for (let i = 0; i < Math.abs(p.accel); i++) {
			const savedpy = p.y;
			p.y += p.accel > 0 ? i : -i;
			const collisions: Array<WorldItem> = Util.isCollidingWith(p);
			let shouldBreak: boolean = false;
			for (const c of collisions)
				if (c.getClassName() !== "coin" &&
					c.getClassName() !== "teleporter" &&
					c.getClassName() !== "deadbadguy" &&
					c.getClassName() !== "buzzsaw" &&
					c.getClassName() !== "laser" &&
					!(p.getClassName() === "turret" && c.getClassName() === "laser") &&  // not case of laser overlapping a turret
					(p.accel < 0 && p.topI() - 1 === c.bottomI() ||
					p.accel > 0 && p.bottomI() + 1 === c.topI())) {
					shouldBreak = true;
					break;
				}
			p.y = savedpy;
			if (shouldBreak)
				break;
			canMoveToY += p.accel > 0 ? 1 : -1;
		}
		if (canMoveToY < Util.topEdge)
			canMoveToY = Util.topEdge + 1;
		if (canMoveToY + p.height > Util.bottomEdge)
			canMoveToY = Util.bottomEdge - p.height - 1;
		return canMoveToY;
	}
	static isCollidingHoriz(v: WorldItem, w: WorldItem): boolean {
		return true &&
			(
			Util.isBetween(w.topI(), v.topI(), v.bottomI()) ||
			Util.isBetween(w.bottomI(), v.topI(), v.bottomI()) ||
			(v.topI() >= w.topI() && v.bottomI() <= w.bottomI()) ||
			(v.topI() <= w.topI() && v.bottomI() >= w.bottomI())
			);
	}
	static isCollidingVert(v: WorldItem, w: WorldItem): boolean {
		return true &&
			(
			Util.isBetween(w.leftI(), v.leftI(), v.rightI()) ||
			Util.isBetween(w.rightI(), v.leftI(), v.rightI()) ||
			(w.leftI() <= v.leftI() && w.rightI() >= v.rightI()) ||
			(v.leftI() <= w.leftI() && v.rightI() >= w.rightI())
			);
	}
	static actualRegisterKeys(): void {
		window.onkeydown = function(e) {
			const key: string = e.code.toString();
			if (key === "KeyW" || key === "ArrowUp" || key === "Space")
				Util.isWDown = true;
			if (key === "KeyA" || key === "ArrowLeft")
				Util.isADown = true;
			if (key === "KeyS" || key === "ArrowDown")
				Util.isSDown = true;
			if (key === "KeyD" || key === "ArrowRight")
				Util.isDDown = true;
		}
		window.onkeyup = function(e) {
			const key: string = e.code.toString();
			if (key === "KeyW" || key === "ArrowUp" || key === "Space")
				Util.isWDown = false;
			if (key === "KeyA" || key === "ArrowLeft")
				Util.isADown = false;
			if (key === "KeyS" || key === "ArrowDown")
				Util.isSDown = false;
			if (key === "KeyD" || key === "ArrowRight")
				Util.isDDown = false;
		}
		const pointerMoveFn = function(e) {
			if (e.clientX > Util.rightEdge / 3)
				Util.isADown = false;
			if (e.clientX < Util.rightEdge / 3 * 2)
				Util.isDDown = false;
			if (e.clientY > Util.bottomEdge / 3)
				Util.isWDown = false;
			if (e.clientX < Util.rightEdge / 3)
				Util.isADown = true;
			if (e.clientX > Util.rightEdge / 3 * 2)
				Util.isDDown = true;
			if (e.clientY < Util.bottomEdge / 3)
				Util.isWDown = true;
		}
		window.onpointerdown = function(e) {
			if (e.clientX < Util.rightEdge / 3)
				Util.isADown = true;
			if (e.clientX > Util.rightEdge / 3 * 2)
				Util.isDDown = true;
			if (e.clientY < Util.bottomEdge / 3)
				Util.isWDown = true;
			window.onpointermove = pointerMoveFn;
		}
		window.onpointerup = function(e) {
			Util.isWDown = Util.isADown = false;
			Util.isSDown = Util.isDDown = false;
			window.onpointermove = null;
		}
	}
}

class Util {
	constructor() {
		throw new Error("attempted to construct class Util");
	}
	static isWDown: boolean = false;
	static isADown: boolean = false;
	static isSDown: boolean = false;
	static isDDown: boolean = false;
	static leftEdge = 0;
	static rightEdge = 640;
	static topEdge = 0;
	static bottomEdge = 480;
	static formatToFourDigits(m: number): string {
		let n: string = m + "";
		while (n.length < 4) {
			n = "0" + n;
		}
		return n;
	}

	static preloadImages(): void {
		PreLoadImg.preload("images/arrowup.svg");
		PreLoadImg.preload("images/buzzsaw.svg");
	}
	// client-callable fn
	static canMoveTo(p: WorldItem, direction: Direction,
		speed: number = 1): number {
		if (direction === "left") {
			return UtilHelpers.canMoveStepperX(p, -speed);
		}
		if (direction === "right") {
			return UtilHelpers.canMoveStepperX(p, speed);
		}
		if (direction === "up" || direction === "down") {
			return UtilHelpers.canMoveStepperY(p);
		}
		return 0;
	}
	// client-callable fn
	static onSolidSurface(p: AliveWorldItem): boolean {
		let ret: boolean = false;
		//p.y++;
		if (p.bottomI() + 1 === Util.bottomEdge)
			ret = true;
		else
			for (const w of GameState.ws) {
				let shouldBreak: boolean = false;
				if (p !== w && p.bottomI() + 1 == w.topI() &&
					w.getClassName() !== "teleporter" &&
					w.getClassName() !== "deadbadguy") {
					const collisions = Util.isCollidingWith(p);
					for (const c of collisions)
						if (c === w) {
							ret = true;
							shouldBreak = true;
							break;
						}
				}
				if (shouldBreak)
					break;
			}
		//p.y--;
		return ret;
	}
	// client-callable fn
	static registerKeys(): void {
		UtilHelpers.actualRegisterKeys();
	}
	// client-callable fn
	static isBetween(a: number, b: number, c: number): boolean {
		if (b > c) {
			const temp = b;
			b = c;
			c = temp;
		}
		return b <= a && a <= c;
	}
	// client-callable fn
	static isCollidingWith(v: WorldItem): Array<WorldItem> {
		v.x--;
		v.y--;
		v.width += 2;
		v.height += 2;
		let ret: Array<WorldItem> = new Array<WorldItem>();
		for (const w of GameState.ws)
			if (v !== w && UtilHelpers.isCollidingHoriz(v, w) &&
				UtilHelpers.isCollidingVert(v, w) &&
				!(v.bottomI() === w.topI() && v.leftI() === w.rightI()) &&
				!(v.bottomI() === w.topI() && v.rightI() === w.leftI()) &&
				!(v.topI() === w.bottomI() && v.leftI() === w.rightI()) &&
				!(v.topI() === w.bottomI() && v.rightI() === w.leftI())
				)
				ret.push(w);
		v.x++;
		v.y++;
		v.width -= 2;
		v.height -= 2;
		return ret;
	}
	static isCollidingWithCircular(v: WorldItem): Array<WorldItem> {
		if (v.width !== v.height)
			throw new Error("iscollidingwithcircular cant use unsquare rect");
		const vCenter: Point = {x: v.leftI() + v.width / 2,
			y: v.topI() + v.height / 2};
		
		let ret: Array<WorldItem> = new Array<WorldItem>();
		for (const w of GameState.ws) {
			let centersArr: Array<Point> = new Array<Point>();
			centersArr.push({x: w.leftI() + w.width / 2,
				y: w.topI() + w.height / 2});
			if (w.height === w.width * 2) { // probably a tall player
				centersArr.pop();
				centersArr.push({x: w.leftI() + w.width / 2,
					y: w.topI() + w.height / 4});
				centersArr.push({x: w.leftI() + w.width / 2,
					y: w.topI() + w.height / 4 + w.height / 2});
			}
			for (const wCenter of centersArr) {
				const distBetweenVW = Math.sqrt(
					Math.pow(vCenter.x - wCenter.x, 2) +  // x2-x1
					Math.pow(vCenter.y - wCenter.y, 2));  // y2-y1
				const vRadius = v.width / 2;
				const wRadius = w.width / 2;
				if (distBetweenVW <= vRadius + wRadius) {
					ret.push(w);
					break;
				}
			}
		}
		return ret;
	}
	// client-callable fn
	static paintLoop(): void {
		if (!GameState.before)
			GameState.before = Date.now();
		GameState.now = Date.now();
		if (GameState.now - GameState.before < 1000 / 72) {
			window.requestAnimationFrame(Util.paintLoop);
			return;
		}
		GameState.before = GameState.now;
		
		for (const w of GameState.ws)
			w.stepState();
		GameState.drawGUI();
		window.requestAnimationFrame(Util.paintLoop);
	}
	static drawBorders(): void {
		document.body.style.margin = "unset";
		
		let div = document.createElement("div");
		div.style.left = Util.leftEdge + "px";
		div.style.top = Util.topEdge + "px";
		div.style.width = (Util.rightEdge - Util.leftEdge + 1) + "px";
		div.style.height = "1px";
		div.style.backgroundColor = "black";
		div.style.position = "fixed";
		div.style.zIndex = "5";
		document.body.appendChild(div);
		
		div = document.createElement("div");
		div.style.left = Util.leftEdge + "px";
		div.style.top = Util.topEdge + "px";
		div.style.width = "1px";
		div.style.height = (Util.bottomEdge - Util.topEdge + 1) + "px";
		div.style.backgroundColor = "black";
		div.style.position = "fixed";
		div.style.zIndex = "5";
		document.body.appendChild(div);
		
		div = document.createElement("div");
		div.style.left = Util.rightEdge + "px";
		div.style.top = Util.topEdge + "px";
		div.style.width = "1px";
		div.style.height = (Util.bottomEdge - Util.topEdge + 1) + "px";
		div.style.backgroundColor = "black";
		div.style.position = "fixed";
		div.style.zIndex = "5";
		document.body.appendChild(div);
		
		div = document.createElement("div");
		div.style.left = Util.leftEdge + "px";
		div.style.top = Util.bottomEdge + "px";
		div.style.width = (Util.rightEdge - Util.leftEdge + 1) + "px";
		div.style.height = "1px";
		div.style.backgroundColor = "black";
		div.style.position = "fixed";
		div.style.zIndex = "5";
		document.body.appendChild(div);
		
		div = document.createElement("div");
		div.style.left = (Util.rightEdge + 1) + "px";
		div.style.top = Util.topEdge + "px";
		div.style.width = (window.innerWidth - Util.rightEdge) + "px";
		div.style.height = window.innerHeight + "px";
		div.style.backgroundColor = "white";
		div.style.position = "fixed";
		div.style.zIndex = "5";
		window.onresize = function() {
			div.style.width = (window.innerWidth - Util.rightEdge) + "px";
			div.style.height = window.innerHeight + "px";
		};
		document.body.appendChild(div);

	}
}

// Note: world fns must set GameState.currLevel to themselves.
class Init {
	constructor() {
		throw new Error("attempted to construct class Init");
	}
	
	static World1(sz: PlayerSize): void {
		console.log("Entering World 1");
		GameState.currLevel = Init.World1;
		new Brick(100, 400, 75, 10, "violet");
		new Brick(200, 330, 100, 10, "skyblue", "brick", true);
		new Brick(230, 345, 10, 10, "violet", "brick", true);
		new Player(10, 10, sz);
		new Brick(300, 450, 10, 10, "violet");
		new BadGuy(400, 400, 50, 50, "red", "right", true);
		new BadGuy(340, 60, 50, 50, "red", "right", true);
		new BadGuy(200, 150, 50, 50, "red", "left", true);
		new QuestionBox(300, 200, "!");
		new Coin(500, 400);
		new Brick(650, 470, 300, 10, "violet");
		new Bomb(200, 100, "right");
		new QuestionBox(400, 150);
		new QuestionBox(450, 150);
		new QuestionBox(500, 150);
		new BadGuy(550, 90, 50, 50, "red", "right", true);
		new QuestionBox(20, 150);
		new QuestionBox(120, 150);
		new QuestionBox(450, 300);
		new QuestionBox(550, 300);
		new BadGuy(444, 222, 50, 50, "red", "left", true);
		new QuestionBox(340, 300);
		new Teleporter(640, 350, Init.World2);
	}
	
	static World0(sz: PlayerSize = "smol"): void {
		console.log("Entering World 0");
		GameState.currLevel = Init.World0;
		new Player(10, 10, sz);
		new Brick(1, 480 - 10 - 1, 1000, 10, "violet", "brick", false);
		new QuestionBox(400, 300, "!");
		new QuestionBox(550, 300);
		new QuestionBox(600, 300);
		new QuestionBox(650, 300);
		new QuestionBox(700, 300);
		new QuestionBox(625, 130);
		new Brick(1000, 400, 100, 10, "violet", "brick", false);
		new QuestionBox(1025, 180);
		new QuestionBox(1400, 170);
		
		new BadGuy(600, 400, 50, 50, "red", "left", false);
		new Brick(1300, 325, 1000, 10, "violet", "brick", false);
		new BadGuy(1800, 250, 50, 50, "red", "left", true);
		new BadGuy(1900, 250, 50, 50, "red", "left", true);
		new BadGuy(2000, 250, 50, 50, "red", "left", true);
		new Bomb(2100, 250, "left");
		new Bomb(2200, 250, "right");
		new Coin(2200, 25);
		new Coin(2400, 100);
		new Coin(2500, 150);
		new Coin(2600, 200);
		new Coin(2700, 250);
		new Coin(2800, 300);
		
		new Brick(2800, 450, 100, 10, "violet", "brick", false);
		new Brick(2890, 350, 10, 10, "violet", "brick", false);
		new Brick(3000, 225, 100, 10, "violet", "brick", false);
		new Bomb(3000, 150, "right");
		new Brick(3200, 100, 100, 10, "violet", "brick", false);
		new Brick(3200, 150, 10, 300, "violet", "brick", false);
		new Coin(3210, 200);
		new Brick(3600, 450, 300, 10, "violet", "brick", false);
		new Teleporter(3900, 300, Init.World1);
	}

	static World2(sz: PlayerSize) {
		console.log("Entering World 2");
		GameState.currLevel = Init.World2;
		new Player(20, 200, sz);
		new Brick(1, 470, 1009, 10, "violet", "brick", false);
		new Brick(1, 120, 10, 360, "violet", "brick", false);
		new QuestionBox(400, 300);
		new QuestionBox(450, 300);
		new QuestionBox(500, 300);
		new QuestionBox(550, 300);
		new BadGuy(500, 220, 50, 50, "red", "left", true);
		new Brick(1, 120, 1000, 10, "violet", "brick", false);
		new BadGuy(1, 60, 50, 50, "red", "right", false);
		new BadGuy(100, 60, 50, 50, "red", "right", false);
		new BadGuy(200, 60, 50, 50, "red", "right", false);
		new BadGuy(300, 60, 50, 50, "red", "right", false);
		new BadGuy(400, 60, 50, 50, "red", "right", false);
		new BadGuy(500, 60, 50, 50, "red", "right", false);
		new BadGuy(600, 60, 50, 50, "red", "right", false);
		new BadGuy(700, 60, 50, 50, "red", "right", false);
		new BadGuy(800, 60, 50, 50, "red", "right", false);
		new BadGuy(900, 60, 50, 50, "red", "right", false);
		new BadGuy(1000, 60, 50, 50, "red", "right", false);
		
		new Brick(1060, 120, 10, 30, "violet", "brick", false);
		new Brick(1000, 460, 10, 20, "violet", "brick", false);
		new Brick(1200, 300, 10, 100, "violet", "brick", false);
		new Brick(1400, 450, 200, 10, "violet", "brick", false);
		new Brick(1600, 300, 10, 150, "violet", "brick", false);
		new Brick(1900, 300, 10, 150, "violet", "brick", false);
		new Brick(2200, 300, 10, 150, "violet", "brick", false);
		new Brick(2500, 300, 10, 150, "violet", "brick", false);
		new Brick(3100, 470, 200, 10, "violet", "brick", false);
		new Brick(3300, 370, 200, 10, "violet", "brick", false);
		new Brick(3500, 270, 200, 10, "violet", "brick", false);
		new Brick(3700, 170, 200, 10, "violet", "brick", false);
		new Teleporter(3900, 70, Init.World3);
	}
	
	static World3(sz: PlayerSize) {
		console.log("Entering World 3");
		GameState.currLevel = Init.World3;
		new Player(20, 200, sz);
		new Brick(1, 469, 150, 10, "violet", "brick", false);
		new Platform(100, 10, {x: 155, y: 469}, {x: 520, y: 100}, 3);
		new Brick(630, 200, 150, 10, "violet", "brick", false);
		new Brick(780, 210, 10, 200, "violet", "brick", false);
		new QuestionBox(700, 360, "!");
		new Platform(100, 10, {x: 630, y: 469}, {x: 1200, y: 469}, 3);
		new Brick(900, 300, 400, 10, "violet", "brick", false);
		new QuestionBox(1000, 100);
		new QuestionBox(1050, 100);
		new QuestionBox(1100, 100);
		new BadGuy(1000, 150, 50, 50, "red", "left", true);
		new Platform(150, 10, {x: 1400, y: 100}, {x: 1400, y: 450}, 3);
		new Platform(150, 10, {x: 1700, y: 450}, {x: 1700, y: 100}, 3);
		new Platform(100, 10, {x: 1900, y: 100}, {x: 2000, y: 450}, 3);
		new Brick(2100, 150, 500, 10, "violet", "brick", false);
		new Brick(2400, 80, 100, 10, "skyblue", "brick", true);
		new Brick(2500, 80, 300, 10, "violet", "brick", false);
		new Brick(2700, 100, 10, 200, "violet", "brick", false);
		new Brick(2400, 10, 10, 70, "violet", "brick", false);
		new Coin(2700, 25);
		new Platform(100, 10, {x: 2900, y: 200}, {x: 3400, y: 300}, 3);
		new Coin(3200, 100);
		new Brick(3600, 350, 150, 10, "violet", "brick", false);
		new Teleporter(3700, 250, Init.World0);
	}
	
	static resetWorld(): void {
		GameState.clearTimeouts();
		if (!GameState.currLevel)
			GameState.currLevel = Init.World0;
		if (GameState.getNLivesLeft() === 0) {
			GameState.setNCollectedCoins(0);
			GameState.setNLivesLeft(4);
			GameState.currLevel = Init.World0;
		}
		GameState.clearElemsOfWS();
		GameState.currLevel();
	}
}

// main?
(() => {
	Util.drawBorders();
	Util.preloadImages();
	Init.resetWorld();
	Util.registerKeys();
	Util.paintLoop();
})();
