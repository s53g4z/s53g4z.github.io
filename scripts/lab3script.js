//
const DEBUG_MODE = false;
class PreLoadImg {
    constructor() {
        throw new Error("tried to construct a preloadimg");
    }
    static preload(url) {
        const imgElem = document.createElement("img");
        imgElem.src = url;
        imgElem.style.position = "fixed";
        imgElem.style.opacity = "0.0001%";
        imgElem.style.width = "1px";
        document.body.appendChild(imgElem);
        this.imgElems.push(imgElem);
    }
    static getImg(index) {
        if (index >= this.imgElems.length)
            throw new Error("tried to access nonexistent image in cache");
        const imgElem = this.imgElems[index].cloneNode();
        imgElem.style.position = "";
        imgElem.style.opacity = "";
        imgElem.style.width = "100%";
        return imgElem;
    }
}
PreLoadImg.imgElems = new Array();
class WorldItem {
    constructor(x, y, width, height, color, className) {
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
        this.setY(y);
        this.width = width;
        this.height = height;
        this.setColor(color);
        this.accel = 0;
        GameState.appendToWS(this);
    }
    updateDivvyMembership(oldX, oldWidth) {
        const origLo = Math.trunc(oldX / 200);
        const origHi = Math.trunc((oldX + oldWidth) / 200);
        const updatedLo = Math.trunc(this.leftI() / 200);
        const updatedHi = Math.trunc(this.rightI() / 200);
        //if (true || origLo > updatedHi || origHi < updatedLo) {  // no overlap
        GameState.rmFromDivvy(this, origLo, origHi);
        GameState.addToDivvy(this, updatedLo, updatedHi);
        //} else {
        //GameState.addToDivvy(this, origHi+1, updatedHi);  // bad logic
        //GameState.rmFromDivvy(this, origLo, updatedLo-1);  // bad logic
        //}
    }
    setX(x) {
        if (DEBUG_MODE && Math.round(x) !== x)
            throw new Error("setx invalid input");
        const oldX = this.x; // bootstrap, so don't use this.getX()
        this.x = x;
        if (oldX !== x)
            this.updateDivvyMembership(oldX, this.getWidth());
    }
    setY(y) {
        if (DEBUG_MODE && Math.round(y) !== y)
            throw new Error("sety invalid input: " + y);
        this.y = y;
    }
    getX() {
        if (DEBUG_MODE && Math.round(this.x) !== this.x)
            throw new Error("getx invalid data");
        return this.x;
    }
    getY() {
        if (DEBUG_MODE && Math.round(this.y) !== this.y)
            throw new Error("gety invalid data");
        return this.y;
    }
    getWidth() {
        return this.width;
    }
    setWidth(width) {
        if (DEBUG_MODE && Math.round(width) !== width)
            throw new Error("setwidth invalid input");
        const oldWidth = this.getWidth();
        this.width = width;
        if (oldWidth !== width)
            this.updateDivvyMembership(this.getX(), oldWidth);
    }
    getHeight() {
        return this.height;
    }
    setHeight(height) {
        if (DEBUG_MODE && Math.round(height) !== height)
            throw new Error("setheight invalid input");
        //const oldHeight = this.getHeight();
        this.height = height;
        //if (oldHeight !== height)
        //	this.updateDivvyMembership(this.getX(), this.getWidth(), oldHeight);
    }
    topI() {
        return this.y;
    }
    bottomI() {
        return this.y + this.height;
    }
    leftI() {
        return this.x;
    }
    rightI() {
        return this.x + this.width;
    }
    die() {
        GameState.removeFromWS(this);
    }
    getClassName() {
        return this.div.className;
    }
    setClassName(newName) {
        this.div.className = newName;
    }
    getColor() {
        return this.color;
    }
    setColor(newColor) {
        this.color = newColor;
        this.div.style.backgroundColor = newColor;
    }
    scroll(amount) {
        this.setX(this.getX() + amount);
        if (Util.isOutsideFrame(this))
            return; // skip drawing if outside the frame
        this.div.style.left = this.getX() + "px";
    }
    stepState() {
        throw new Error("child of WorldItem has undefined stepState()");
    }
}
class Brick extends WorldItem {
    constructor(x, y, width, height, color, className = "brick", destructible = false) {
        super(x, y, width, height, color, className);
        this.destructible = destructible;
    }
    stepState() {
        if (this.destructible &&
            GameState.getPlayer().topI() - 1 === this.bottomI() &&
            Util.areColliding(GameState.getPlayer(), this)) {
            GameState.getPlayer().accel = -GameState.getPlayer().accel;
            this.die();
        }
    }
}
class Platform extends Brick {
    constructor(width, height, start = { x: 0, y: 0 }, end = { x: 0, y: 0 }, speed = 0) {
        super(start.x, start.y, width, height, "blueviolet", "platform", false);
        this.start = start;
        this.end = end;
        this.speed = speed;
        if (this.start.x > this.end.x)
            throw new Error("invalid start/end points for Platform");
    }
    scroll(amount) {
        this.setX(this.getX() + amount);
        if (!Util.isOutsideFrame(this))
            this.div.style.left = this.x + "px";
        this.start.x += amount;
        this.end.x += amount;
    }
    // ???
    findHighestWorldItem(baseItem) {
        let stack = new Array();
        let base = baseItem;
        stack.push(base);
        for (;;) { // for each layer of items on the stack
            let tallestInLayer = null;
            for (const w of GameState.ws) {
                if (w.bottomI() + 1 !== base.topI())
                    continue; // if can't collide with base, continue
                const collisions = Util.isCollidingWith(base);
                for (const c of collisions) // \/ if colliding with \/
                    if (c === w && c.getClassName() !== "buzzsaw") {
                        stack.push(w);
                        if (!tallestInLayer || // if taller than tIL
                            w.height > tallestInLayer.height) {
                            tallestInLayer = w; // remember it
                            break;
                        }
                    }
                // search rest of world-state for even taller items in the layer
            }
            if (tallestInLayer) // found the tallest!
                base = tallestInLayer; // continue looking up the stack
            else // no items in layer
                break;
        }
        return stack;
    }
    stepState() {
        if (this.speed === 0)
            return;
        let distBetweenEndpoints = 0;
        if (this.speed > 0) {
            distBetweenEndpoints = Math.sqrt(Math.pow(this.end.x - this.x, 2) +
                Math.pow(this.end.y - this.y, 2));
        }
        else {
            distBetweenEndpoints = Math.sqrt(Math.pow(this.x - this.start.x, 2) +
                Math.pow(this.y - this.start.y, 2));
        }
        if (distBetweenEndpoints < 1) {
            // snap to start or end
            if (Math.abs(this.x - this.start.x) < 1 &&
                Math.abs(this.y - this.start.y) < 1) {
                this.setX(this.start.x);
                this.setY(this.start.y);
            }
            else {
                this.setX(this.end.x);
                this.setY(this.end.y);
            }
            distBetweenEndpoints = 0;
        }
        else {
            const origSpeed = this.speed;
            if (distBetweenEndpoints < Math.abs(this.speed))
                this.speed = distBetweenEndpoints * (this.speed > 0 ? 1 : -1);
            let rise = 0;
            let run = 0;
            if (this.speed > 0) {
                rise = this.end.y - this.y;
                run = this.end.x - this.x;
            }
            else { // speed < 0
                rise = this.y - this.start.y;
                run = this.x - this.start.x;
            }
            const scaleFactor = this.speed / distBetweenEndpoints;
            let deltaY = rise * scaleFactor;
            let deltaX = run * scaleFactor;
            if (Math.abs(deltaY) > Math.abs(this.speed) + 0.01 || // arbitrary E
                Math.abs(deltaX) > Math.abs(this.speed) + 0.01) { // ibid
                console.warn("programmer error: delta is greater than speed");
                console.warn("delta: ", deltaX, ", speed: ", this.speed);
            }
            //this.accel = deltaY;
            const stack = this.findHighestWorldItem(this);
            let highestInStack = stack[0]; // moving down, so get lowest item
            if (deltaY < 0) // moving up, so get highest item
                highestInStack = stack[stack.length - 1];
            const origAccelHIS = highestInStack.accel;
            highestInStack.accel = deltaY;
            // warn: the following code introduces a performance regression
            const origHISPos = { x: highestInStack.x,
                y: highestInStack.y };
            Util.moveMe(highestInStack, 0);
            let canMoveY = highestInStack.y;
            highestInStack.y = origHISPos.y;
            this.accel = 0;
            const origMePos = { x: this.x, y: this.y };
            Util.moveMe(this, deltaX);
            let canMoveX = this.x;
            this.setX(origMePos.x);
            //let canMoveY = Util.canMoveTo(highestInStack, "up");
            //let canMoveX = Util.canMoveTo(this,
            //this.speed > 0 ? "right" : "left", Math.abs(deltaX));
            highestInStack.accel = origAccelHIS;
            deltaY = canMoveY - highestInStack.topI();
            deltaX = Math.round(canMoveX - this.x);
            for (let i = 1; i < stack.length; i++)
                if (stack[i].getClassName() === "platform") {
                    deltaY = 0;
                    break;
                }
            for (const w of stack) {
                w.setX(w.getX() + deltaX);
                w.setY(w.getY() + deltaY);
                if (!Util.isOutsideFrame(this)) {
                    w.div.style.left = w.x + "px";
                    w.div.style.top = w.y + "px";
                }
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
    constructor(x, y) {
        super(x, y, 50, 50, "yellow", "coin");
        this.div.innerText = "$";
    }
    stepState() {
        if (Util.areColliding(GameState.getPlayer(), this)) {
            GameState.setNCollectedCoins(GameState.getNCollectedCoins() + 1);
            this.die();
        }
    }
}
class PowerUp extends Brick {
    constructor(x, y) {
        super(x, y, 50, 50, "green", "powerup");
        const imgHandle = PreLoadImg.getImg(0);
        this.div.appendChild(imgHandle);
    }
    stepState() {
        if (Util.areColliding(GameState.getPlayer(), this)) {
            GameState.getPlayer().grow();
            this.die();
        }
    }
}
class QuestionBox extends WorldItem {
    constructor(x, y, spawns = "$") {
        super(x, y, 50, 50, "skyblue", "qbox");
        this.active = true;
        this.div.innerText = "?";
        if (spawns === "$")
            this.contents = "coin";
        else
            this.contents = "powerup";
    }
    deactivate() {
        this.div.style.backgroundColor = "grey";
        this.div.style.color = "black";
        this.active = false;
    }
    stepState() {
        if (!this.active)
            return;
        const p = GameState.getPlayer();
        if (p.topI() - 1 === this.bottomI() && Util.areColliding(p, this)) {
            if (this.contents === "coin")
                new Coin(this.x, this.y - 50);
            else if (this.contents === "powerup")
                new PowerUp(this.x, this.y - 50);
            this.deactivate();
        }
    }
    die() {
        this.deactivate();
    }
}
class AliveWorldItem extends WorldItem {
    constructor(x, y, width, height, color, className = "unknown") {
        super(x, y, width, height, color, className);
        this.accel = 0;
        this.alive = true;
    }
}
class Turret extends AliveWorldItem {
    constructor(x, y) {
        super(x, y, 10, 50, "", "turret");
        this.framesPeaceful = 0;
    }
    calculateTheta() {
        const p = GameState.getPlayer();
        const playerCenter = { x: p.x + p.width / 2, y: p.y + p.height / 2 };
        const turretCenter = { x: this.x + 25, y: this.y + 25 };
        const sideX = turretCenter.x - playerCenter.x;
        const sideY = turretCenter.y - playerCenter.y;
        let theta = 0; // in degrees
        if (sideY === 0)
            theta = sideX > 0 ? 180 : 0; // player on left or right
        else { // (sideY !== 0)
            theta = Math.atan(sideY / sideX) * 180 / 3.141592653589;
            ;
            if (sideX < 0) {
                theta = -theta;
            }
            else
                theta = 180 - theta;
        }
        const jitter = 5 * (Math.random() * 2 - 1);
        return theta + jitter;
    }
    stepState() {
        if (++this.framesPeaceful < 6) {
            return;
        }
        else
            this.framesPeaceful = 0;
        if (Math.abs(this.x - GameState.getPlayer().x) > 1000)
            return; // save ammo (jk)
        const theta = this.calculateTheta();
        const laserHandle = new Laser(this.getX() + this.getWidth() / 2, this.getY() + this.getHeight() / 2, 25, theta);
        laserHandle.div.style.opacity = "0";
        this.div.style.transform = "rotate(" + (-theta + 90) + "deg)";
    }
}
class Laser extends AliveWorldItem {
    constructor(x, y, speed = 20, angleD = 0) {
        super(x, y, 25, 5, "red", "laser");
        this.speed = speed;
        this.distanceTraveled = 0;
        this.theta = angleD % 360 * 3.141592653589 / 180;
        // imperfect b/c moveSelf() rounds movement
        this.div.style.transform = "rotate(" + (-angleD % 360) + "deg)";
    }
    moveSelf() {
        const wantMoveY = Math.round(this.speed * Math.sin(this.theta) * -1
            * 10) / 10;
        const wantMoveX = Math.round(this.speed * Math.cos(this.theta)
            * 10) / 10;
        this.accel = wantMoveY;
        // buggy b/c lasers can rotate around
        Util.moveMe(this, wantMoveX);
        //this.setX(Util.canMoveTo(this, wantMoveX > 0 ? "right" : "left",
        //Math.abs(wantMoveX)));
        //this.setY(Util.canMoveTo(this, "down"));
    }
    decorateSelf() {
        if (Util.isOutsideFrame(this))
            return;
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
        this.div.style.opacity = "1";
        const collisions = Util.isCollidingWith(this);
        for (const c of collisions)
            if (c.getClassName() === "turret")
                this.div.style.opacity = "0";
    }
    processCollisions() {
        const collisions = Util.isCollidingWith(this);
        for (const c of collisions)
            if (c === GameState.getPlayer() || c.getClassName() === "badguy")
                c.die();
            else if (c.getClassName() === "bomb")
                c.die(true);
            else if (c.getClassName() === "brick" && c.destructible)
                c.die();
        let nCollisions = collisions.length;
        for (let i = 0; i < collisions.length; i++)
            if (collisions[i].getClassName() === "laser" ||
                collisions[i].getClassName() === "turret")
                nCollisions--; // allow lasers to overlap lasers and turrets
        return nCollisions;
    }
    stepState() {
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
    constructor(x, y, width = 50, height = 50) {
        super(x, y, width, height, "", "buzzsaw");
        const imgHandle = PreLoadImg.getImg(1);
        this.div.appendChild(imgHandle);
    }
    stepState() {
        const collisions = Util.isCollidingWithCircular(this);
        for (const c of collisions)
            if (c === GameState.getPlayer() || c.getClassName() === "badguy")
                c.die();
            else if (c.getClassName() === "bomb")
                c.die(true);
    }
}
class BadGuy extends AliveWorldItem {
    constructor(x, y, width, height, color, dir = "right", patrol = false, ms = 3, className = "badguy") {
        super(x, y, width, height, color, className);
        this.dir = dir;
        this.patrol = patrol;
        this.movementSpeed = ms;
        this.accel = 0;
        this.framesSkippedTurning = 0;
    }
    steppedOn() {
        const p = GameState.getPlayer();
        return p.bottomI() + 1 === this.topI() && Util.areColliding(p, this);
    }
    touchingPlayer() {
        return Util.areColliding(GameState.getPlayer(), this);
    }
    die() {
        //GameState.getPlayer().accel = 0;
        this.div.innerText = "x.x";
        this.setClassName("deadbadguy");
        this.setHeight(this.getHeight() / 2);
        this.setY(this.getY() + this.height);
        this.div.style.top = this.y + "px";
        this.div.style.height = this.height + "px";
        if (this.dir === "right")
            this.div.style.textAlign = "end";
        this.div.style.zIndex = "-1";
        this.alive = false;
        let timeout = window.setTimeout(() => {
            GameState.removeFromWS(this);
        }, 2000);
        GameState.recordTimeout(timeout);
    }
    // helper for stepState()
    maybeTurnAround() {
        if (this.framesSkippedTurning <= 20)
            return;
        this.framesSkippedTurning = 0;
        if (this.dir === "right")
            this.dir = "left";
        else
            this.dir = "right";
    }
    decorateDOMSelf() {
        if (Util.isOutsideFrame(this))
            return;
        this.div.innerText = "@_@";
        this.div.style.textAlign = "left";
        if (this.dir === "right")
            this.div.style.textAlign = "end";
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
    }
    stepState() {
        if (!this.alive)
            return;
        this.framesSkippedTurning++;
        if (this.steppedOn() || this.bottomI() == Util.bottomEdge - 1)
            this.die();
        else if (this.touchingPlayer())
            GameState.getPlayer().die();
        if (this.alive) {
            if (Util.onSolidSurface(this))
                this.accel = 0;
            else
                this.accel += 1.0;
            //this.setY(Util.canMoveTo(this, "down"));
            const origMeLocation = { x: this.x, y: this.y };
            const origOnSurface = Util.onSolidSurface(this);
            Util.moveMe(this, this.dir === "left" ? -this.movementSpeed :
                this.movementSpeed);
            if (this.x === origMeLocation.x)
                this.maybeTurnAround();
            if (this.patrol) {
                const nowMeLocation = { x: this.x, y: this.y };
                this.setX(Math.round(this.getX() + (this.dir === "left" ?
                    -(this.width / 2) : this.width / 2)));
                if (origOnSurface && !Util.onSolidSurface(this)) {
                    this.setX(origMeLocation.x);
                    this.maybeTurnAround();
                }
                else
                    this.setX(nowMeLocation.x);
            }
        }
        this.decorateDOMSelf();
    }
}
class Bomb extends BadGuy {
    constructor(x, y, dir = "right") {
        super(x, y, 50, 50, "hotpink", dir, true, 3, "bomb");
        this.isTicking = false;
    }
    explode() {
        this.setWidth(this.getWidth() * 3);
        this.setHeight(this.getHeight() * 3);
        this.setX(this.getX() - 50);
        this.setY(this.getY() - 50);
        this.stepState = () => {
            if (this.touchingPlayer())
                GameState.getPlayer().die();
        };
        if (!Util.isOutsideFrame(this)) {
            this.div.style.width = this.width + "px";
            this.div.style.height = this.height + "px";
            this.div.style.left = this.x + "px";
            this.div.style.top = this.y + "px";
        }
        this.div.className = "explodingbomb";
        const colls = Util.isCollidingWith(this);
        for (const c of colls) {
            if (c.getClassName() === "coin" || c.getClassName() === "turret" ||
                c.getClassName() === "badguy" || c.getClassName() === "bomb" ||
                c.getClassName() === "player" || c.getClassName() === "qbox" ||
                c.getClassName() === "brick" && c.destructible)
                c.die();
        }
    }
    die(immediately = false) {
        if (this.isTicking)
            return;
        //GameState.getPlayer().accel = 0;
        this.div.innerText = "O.O";
        this.div.className = "tickingbomb";
        const flickerHandle = window.setInterval(() => {
            if (Util.isOutsideFrame(this))
                return;
            if (this.div.style.backgroundColor != "hotpink")
                this.div.style.backgroundColor = "hotpink";
            else
                this.div.style.backgroundColor = "red";
        }, 250);
        GameState.recordTimeout(flickerHandle);
        const stopflickerHandle = window.setTimeout(() => {
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
    decorateDOMSelf() {
        if (Util.isOutsideFrame(this))
            return;
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
    constructor(x, y, sz) {
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
    grow() {
        if (this.sz === "big")
            return; // can't grow twice
        this.height *= 2;
        this.div.style.height = this.height + "px";
        this.y -= this.height / 2;
        this.div.style.top = this.topI() + "px";
        this.sz = "big";
    }
    shrink() {
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
    setText() {
        const child = document.createElement("div");
        child.innerText = "OwO";
        child.style.textAlign = "end";
        child.className = "playertext";
        this.div.appendChild(child);
    }
    jump() {
        this.isJumping = true;
        this.alreadyJumped = true;
        this.accel = -13;
        //this.setY(Util.canMoveTo(this, "up"));
    }
    fall() {
        if (!Util.isWDown)
            this.alreadyJumped = false;
        this.isJumping = false;
        if (Util.onSolidSurface(this)) // player landed
            this.accel = 0;
        else { // contine falling
            this.accel += 0.5;
            //const canMoveToY = Util.canMoveTo(this, "down");
            //if (this.y === canMoveToY)
            //	this.accel = -this.accel;  // bonk
            //this.setY(canMoveToY);
        }
    }
    die() {
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
        const playerTextDiv = this.div.getElementsByClassName("playertext")[0];
        playerTextDiv.innerText = "XwX";
        playerTextDiv.className = "playertextdying";
        this.stepState = () => { }; // stop processing user input
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
    maybeScroll() {
        const origX = this.getX();
        const scrollLine = Math.round((Util.rightEdge - Util.leftEdge) / 3);
        const scrollLine2 = 10;
        if (origX > scrollLine)
            for (const w of GameState.ws)
                w.scroll(-origX + scrollLine);
        else if (origX < scrollLine2)
            for (const w of GameState.ws)
                w.scroll(scrollLine2 - origX);
    }
    uwu() {
        const owo = this.div.getElementsByClassName("playertext")[0];
        if (!owo)
            throw new Error("player must have a child div!");
        return owo;
    }
    flicker() {
        if (this.getColor() === "limegreen")
            this.setColor("greenyellow");
        else
            this.setColor("limegreen"); // also see the CSS file
    }
    onBadGuy() {
        for (const w of GameState.ws)
            if (w !== this && (w.getClassName() === "badguy" ||
                w.getClassName() === "bomb" ||
                w.getClassName() === "tickingbomb") &&
                this.bottomI() + 1 === w.topI()) {
                const collisions = Util.isCollidingWith(this);
                for (const c of collisions)
                    if (c === w)
                        return true;
            }
        return false;
    }
    stepState() {
        if (this.invincible)
            this.flicker();
        if (this.bottomI() >= Util.bottomEdge - 1) {
            this.die();
            return;
        }
        let owo = this.uwu();
        let speed = 0;
        if (Util.isDDown) {
            speed = 9;
            owo.style.textAlign = "end";
        }
        if (Util.isADown) {
            speed = -9;
            owo.style.textAlign = "left";
        }
        if (Util.isWDown && (this.wasOnBadGuy ||
            !this.alreadyJumped && Util.onSolidSurface(this)))
            this.jump();
        else
            this.fall();
        const origMePos = { x: this.x, y: this.y };
        Util.moveMe(this, speed);
        if (origMePos.y === this.getY())
            this.accel = -this.accel;
        if (this.onBadGuy())
            this.wasOnBadGuy = true;
        else
            this.wasOnBadGuy = false;
        this.div.style.left = this.getX() + "px";
        this.div.style.top = this.getY() + "px";
        this.maybeScroll();
    }
}
class Teleporter extends WorldItem {
    constructor(x, y, nextLevel) {
        super(x, y, 50, 50, "#9CFF9C", "teleporter");
        this.nextLevel = nextLevel;
    }
    stepState() {
        if (Util.areColliding(GameState.getPlayer(), this)) {
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
    // Add w to the sets at map indices [lo, hi]
    static addToDivvy(w, lo, hi) {
        for (let i = lo; i <= hi; i++) {
            if (!this.divvy.has(i))
                this.divvy.set(i, new Set());
            if (DEBUG_MODE && this.divvy.get(i).has(w))
                throw new Error("programmer error: addtodivvy adding a dup");
            this.divvy.get(i).add(w); // on set representing index i, add w.
        }
    }
    // Remove w from the sets at map indices [lo, hi]
    static rmFromDivvy(w, lo, hi) {
        for (let i = lo; i <= hi; i++)
            if (!this.divvy.has(i))
                throw new Error("programmer error: divvy lacks a set " +
                    "containing the worlditem to be deleted");
            else // from set representing index i, rm w.
             if (!(this.divvy.get(i).delete(w)))
                throw new Error("programmer error: bad set reference del");
    }
    static appendToWS(w) {
        this.ws.push(w);
        const loIndex = Math.trunc(w.leftI() / 200);
        const hiIndex = Math.trunc(w.rightI() / 200);
        this.addToDivvy(w, loIndex, hiIndex);
    }
    // destroy one WorldItem
    static removeFromWS(trash) {
        for (let i = 0; i < this.ws.length; i++)
            if (this.ws[i] === trash) {
                const loIndex = Math.trunc(trash.leftI() / 200);
                const hiIndex = Math.trunc(trash.rightI() / 200);
                this.rmFromDivvy(trash, loIndex, hiIndex);
                this.ws.splice(i--, 1); // clean the .ws array
                break;
            }
        const div = trash.div;
        div.parentNode.removeChild(div); // clean the DOM
    }
    // destroy all worldly items
    static clearElemsOfWS() {
        for (let i = 0; i < this.ws.length; i++) {
            this.removeFromWS(this.ws[i]);
            i--;
        }
        this.player = null;
    }
    static setPlayer(p) {
        this.player = p;
    }
    static getPlayer() {
        return this.player;
    }
    // Return the number of coins collected by the player.
    static getNCollectedCoins() {
        return this.nCollectedCoins;
    }
    // Set the number of coins collected by the player.
    static setNCollectedCoins(n) {
        if (n < 0)
            throw new Error("nCollectedCoins must be >= 0");
        this.nCollectedCoins = n;
    }
    // helper fn for drawGUI().
    static getDOMElemById(id) {
        let div = document.getElementById(id);
        if (!div) {
            let newdiv = document.createElement("div");
            newdiv.id = id;
            newdiv.style.margin = "0.5vw";
            newdiv.style.zIndex = "5";
            newdiv.style.position = "relative";
            document.body.appendChild(newdiv);
            div = newdiv;
        }
        return div;
    }
    // helper fn for drawGUI().
    static getGUIncoins() {
        return this.getDOMElemById("GUIncoins");
    }
    // helper fn for drawGUI().
    static getGUInlives() {
        return this.getDOMElemById("GUInlives");
    }
    static getNLivesLeft() {
        if (DEBUG_MODE && this.nLivesLeft < 0)
            throw new Error("nLivesLeft is less than zero");
        return this.nLivesLeft;
    }
    static setNLivesLeft(n) {
        if (DEBUG_MODE && n < 0)
            throw new Error("nLivesLeft is less than zero");
        this.nLivesLeft = n;
    }
    static drawGUI() {
        const ncoinsDiv = this.getGUIncoins();
        ncoinsDiv.innerText = "Coins: " +
            Util.formatToFourDigits(this.getNCollectedCoins());
        const nlivesDiv = this.getGUInlives();
        nlivesDiv.innerText = "Lives: " +
            Util.formatToFourDigits(this.getNLivesLeft());
    }
    // Make note of the timeout.
    static recordTimeout(timeout) {
        this.timeOuts.push(timeout);
    }
    // Destroy all timeouts.
    static clearTimeouts() {
        for (let i = 0; i < this.timeOuts.length; i++) {
            window.clearTimeout(this.timeOuts[i]);
            this.timeOuts.splice(i--, 1);
        }
        if (this.timeOuts.length !== 0)
            throw new Error("programming error on clearTimeouts()");
    }
}
GameState.ws = new Array();
GameState.player = null;
GameState.currLevel = null;
GameState.nCollectedCoins = 0;
GameState.nLivesLeft = 4;
GameState.timeOuts = new Array();
GameState.before = 0;
GameState.now = 1;
GameState.divvy = new Map();
class UtilHelpers {
    constructor() {
        throw new Error("class UtilHelpers cannot be constructed!");
    }
    // helper for Util.moveMe()
    static shouldIgnoreCollision(c) {
        return false ||
            c.getClassName() === "coin" ||
            c.getClassName() === "teleporter" ||
            c.getClassName() === "deadbadguy" ||
            c.getClassName() === "buzzsaw" ||
            c.getClassName() === "laser";
    }
    static isCollidingHoriz(v, w) {
        return true &&
            (Util.isBetween(w.topI(), v.topI(), v.bottomI()) ||
                Util.isBetween(w.bottomI(), v.topI(), v.bottomI()) ||
                (v.topI() >= w.topI() && v.bottomI() <= w.bottomI())); /*||
        (v.topI() <= w.topI() && v.bottomI() >= w.bottomI()
        );*/
    }
    static isCollidingVert(v, w) {
        return true &&
            (Util.isBetween(w.leftI(), v.leftI(), v.rightI()) ||
                Util.isBetween(w.rightI(), v.leftI(), v.rightI()) ||
                (w.leftI() <= v.leftI() && w.rightI() >= v.rightI())); /*||
        (v.leftI() <= w.leftI() && v.rightI() >= w.rightI())
        );*/
    }
    static actualRegisterKeys() {
        window.onkeydown = function (e) {
            const key = e.code.toString();
            if (key === "KeyW" || key === "ArrowUp" || key === "Space")
                Util.isWDown = true;
            if (key === "KeyA" || key === "ArrowLeft")
                Util.isADown = true;
            if (key === "KeyS" || key === "ArrowDown")
                Util.isSDown = true;
            if (key === "KeyD" || key === "ArrowRight")
                Util.isDDown = true;
        };
        window.onkeyup = function (e) {
            const key = e.code.toString();
            if (key === "KeyW" || key === "ArrowUp" || key === "Space")
                Util.isWDown = false;
            if (key === "KeyA" || key === "ArrowLeft")
                Util.isADown = false;
            if (key === "KeyS" || key === "ArrowDown")
                Util.isSDown = false;
            if (key === "KeyD" || key === "ArrowRight")
                Util.isDDown = false;
        };
        const pointerMoveFn = function (e) {
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
        };
        window.onpointerdown = function (e) {
            if (e.clientX < Util.rightEdge / 3)
                Util.isADown = true;
            if (e.clientX > Util.rightEdge / 3 * 2)
                Util.isDDown = true;
            if (e.clientY < Util.bottomEdge / 3)
                Util.isWDown = true;
            window.onpointermove = pointerMoveFn;
        };
        window.onpointerup = function (e) {
            Util.isWDown = Util.isADown = false;
            Util.isSDown = Util.isDDown = false;
            window.onpointermove = null;
        };
    }
}
class Util {
    constructor() {
        throw new Error("attempted to construct class Util");
    }
    static formatToFourDigits(m) {
        let n = m + "";
        while (n.length < 4) {
            n = "0" + n;
        }
        return n;
    }
    static preloadImages() {
        PreLoadImg.preload("images/arrowup.svg");
        PreLoadImg.preload("images/buzzsaw.svg");
    }
    static divvyDebugger() {
        if (!DEBUG_MODE)
            throw new Error("attempting to debug divvy outside of debug mode");
        for (const [n, set] of GameState.divvy) {
            console.log("<<<<< " + n + " >>>>>");
            for (const elem of set)
                console.log(elem);
            console.log("=====");
        }
    }
    // client-callable fn
    static isOutsideFrame(w) {
        return w.rightI() < Util.leftEdge - 100 ||
            w.leftI() > Util.rightEdge + 100;
    }
    // client-callable fn
    // todo: clean up moveMe() implementation
    static moveMe(w, wantMoveX) {
        const origWLocation = { x: w.x, y: w.y };
        let xMoveOkay = true;
        let yMoveOkay = true;
        const nIterations = Math.abs(Math.max(Math.abs(w.accel), Math.abs(wantMoveX)));
        for (let i = 0; i <= nIterations; i++) {
            if (!xMoveOkay && !yMoveOkay)
                break; // both are false, so nothing else to do
            if (Math.abs(w.x - origWLocation.x) >= Math.abs(wantMoveX))
                xMoveOkay = false; // already moved maximum amount
            if (Math.abs(w.y - origWLocation.y) >= Math.abs(w.accel))
                yMoveOkay = false; // already moved maximum amount
            const collisions = Util.isCollidingWith(w);
            for (const c of collisions) {
                if (!xMoveOkay && !yMoveOkay)
                    break; // both turned false, so nothing to do
                // list of collisions to ignore
                if (UtilHelpers.shouldIgnoreCollision(c) ||
                    (w.getClassName() === "turret" && c.getClassName() === "laser"))
                    continue;
                // if x now colliding
                if (xMoveOkay && (wantMoveX > 0 && w.rightI() + 1 === c.leftI() ||
                    wantMoveX < 0 && w.leftI() - 1 === c.rightI())) {
                    xMoveOkay = false; // don't change x anymore
                }
                // if y now colliding
                if (yMoveOkay && (w.accel > 0 && w.bottomI() + 1 === c.topI() ||
                    w.accel < 0 && w.topI() - 1 === c.bottomI())) {
                    yMoveOkay = false; // don't change y anymore
                }
            }
            if (xMoveOkay) {
                w.setX(w.getX() + (wantMoveX > 0 ? 1 : -1));
            }
            if (yMoveOkay) {
                w.setY(w.getY() + (w.accel > 0 ? 1 : -1));
            }
        }
        if (w.getY() < Util.topEdge)
            w.setY(Util.topEdge + 1);
        if (w.getY() + w.getHeight() > Util.bottomEdge)
            w.setY(Util.bottomEdge - w.getHeight() - 1);
    }
    // client-callable fn
    static onSolidSurface(p) {
        if (p.bottomI() + 1 === Util.bottomEdge)
            return true;
        else
            for (const w of GameState.ws)
                if (p.bottomI() + 1 === w.topI() &&
                    w.getClassName() !== "coin" &&
                    w.getClassName() !== "teleporter" &&
                    w.getClassName() !== "deadbadguy" &&
                    w.getClassName() !== "buzzsaw" &&
                    Util.areColliding(p, w))
                    return true;
        return false;
    }
    // client-callable fn
    static registerKeys() {
        UtilHelpers.actualRegisterKeys();
    }
    // client-callable fn
    static isBetween(a, b, c) {
        if (DEBUG_MODE && b > c) {
            console.log("isbetween is swapping b and c");
            const temp = b;
            b = c;
            c = temp;
        }
        return b <= a && a <= c;
    }
    static areColliding(v, w) {
        v.x--;
        v.y--;
        v.width += 2;
        v.height += 2;
        const ret = true && (v !== w && UtilHelpers.isCollidingHoriz(v, w) &&
            UtilHelpers.isCollidingVert(v, w) &&
            !(v.bottomI() === w.topI() && v.leftI() === w.rightI()) &&
            !(v.bottomI() === w.topI() && v.rightI() === w.leftI()) &&
            !(v.topI() === w.bottomI() && v.leftI() === w.rightI()) &&
            !(v.topI() === w.bottomI() && v.rightI() === w.leftI()));
        v.x++;
        v.y++;
        v.width -= 2;
        v.height -= 2;
        return ret;
    }
    // client-callable fn
    static isCollidingWith(v) {
        let ret = new Array();
        //for (const w of GameState.ws)
        let loIndex = Math.trunc(v.leftI() / 200);
        let hiIndex = Math.trunc(v.rightI() / 200);
        for (let i = loIndex; i <= hiIndex; i++)
            for (const w of GameState.divvy.get(i))
                if (Util.areColliding(v, w))
                    ret.push(w);
        return ret;
    }
    // client callable fn
    static isCollidingWithCircular(v, approx = false) {
        if (v.width !== v.height)
            throw new Error("iscollidingwithcircular cant use unsquare rect");
        const vCenter = { x: v.leftI() + v.width / 2,
            y: v.topI() + v.height / 2 };
        let ret = new Array();
        for (const w of GameState.ws) {
            let centersArr = new Array();
            centersArr.push({ x: w.leftI() + w.width / 2,
                y: w.topI() + w.height / 2 });
            if (w.height === w.width * 2) { // probably a tall player
                centersArr.pop();
                centersArr.push({ x: w.leftI() + w.width / 2,
                    y: w.topI() + w.height / 4 });
                centersArr.push({ x: w.leftI() + w.width / 2,
                    y: w.topI() + w.height / 4 + w.height / 2 });
            }
            for (const wCenter of centersArr) {
                const distBetweenVW = Math.sqrt(Math.pow(vCenter.x - wCenter.x, 2) + // x2-x1
                    Math.pow(vCenter.y - wCenter.y, 2)); // y2-y1
                const vRadius = v.width / 2 + (approx ? (v.width / 8) : 0);
                const wRadius = w.width / 2 + (approx ? (v.width / 8) : 0);
                if (Math.round(distBetweenVW) <= vRadius + wRadius) {
                    ret.push(w);
                    break;
                }
            }
        }
        return ret;
    }
    // client-callable fn
    static paintLoop() {
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
    static drawBorders() {
        //document.body.style.margin = "unset";
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
        window.onresize = function () {
            div.style.width = (window.innerWidth - Util.rightEdge) + "px";
            div.style.height = window.innerHeight + "px";
        };
        document.body.appendChild(div);
    }
}
Util.isWDown = false;
Util.isADown = false;
Util.isSDown = false;
Util.isDDown = false;
Util.leftEdge = 0;
Util.rightEdge = 640;
Util.topEdge = 0;
Util.bottomEdge = 480;
// Note: world fns must set GameState.currLevel to themselves.
class Init {
    constructor() {
        throw new Error("attempted to construct class Init");
    }
    static World1(sz) {
        console.log("Entering World 1");
        GameState.currLevel = Init.World1;
        new Brick(100, 400, 75, 10, "violet");
        new Brick(200, 330, 100, 10, "skyblue", "brick", true);
        new Brick(230, 345, 10, 10, "violet", "brick", false);
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
    static World0(sz = "smol") {
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
    static World2(sz) {
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
    static World3(sz) {
        console.log("Entering World 3");
        GameState.currLevel = Init.World3;
        new Player(20, 200, sz);
        new Brick(1, 469, 150, 10, "violet", "brick", false);
        new Platform(100, 10, { x: 155, y: 469 }, { x: 520, y: 100 }, 3);
        new Brick(630, 200, 150, 10, "violet", "brick", false);
        new Brick(780, 210, 10, 200, "violet", "brick", false);
        new QuestionBox(700, 360, "!");
        new Platform(100, 10, { x: 630, y: 469 }, { x: 1200, y: 469 }, 3);
        new Brick(900, 300, 400, 10, "violet", "brick", false);
        new QuestionBox(1000, 100);
        new QuestionBox(1050, 100);
        new QuestionBox(1100, 100);
        new BadGuy(1000, 150, 50, 50, "red", "left", true);
        new Platform(150, 10, { x: 1400, y: 100 }, { x: 1400, y: 450 }, 3);
        new Platform(150, 10, { x: 1700, y: 450 }, { x: 1700, y: 100 }, 3);
        new Platform(100, 10, { x: 1900, y: 100 }, { x: 2000, y: 450 }, 3);
        new Brick(2100, 150, 500, 10, "violet", "brick", false);
        new Brick(2400, 80, 100, 10, "skyblue", "brick", true);
        new Brick(2500, 80, 300, 10, "violet", "brick", false);
        new Brick(2700, 100, 10, 200, "violet", "brick", false);
        new Brick(2400, 10, 10, 70, "violet", "brick", false);
        new Coin(2700, 25);
        new Platform(100, 10, { x: 2900, y: 200 }, { x: 3400, y: 300 }, 3);
        new Coin(3200, 100);
        new Brick(3600, 350, 150, 10, "violet", "brick", false);
        new Teleporter(3700, 250, Init.World4);
    }
    static World4(sz) {
        console.log("Entering World 4");
        GameState.currLevel = Init.World4;
        new Player(10, 410, sz);
        new Brick(1, 350, 150, 10, "violet", "brick", false);
        new Brick(1, 470, 300, 10, "violet", "brick", false);
        new BadGuy(50, 240, 50, 50, "red", "right", true);
        new Turret(140, 80);
        new Brick(370, 300, 400, 10, "violet", "brick", false);
        new Coin(305, 240);
        new Coin(305, 190);
        new Coin(305, 140);
        new Coin(305, 90);
        new Coin(355, 240);
        new Coin(355, 190);
        new Coin(355, 140);
        new Coin(355, 90);
        new Coin(405, 240);
        new Coin(405, 190);
        new Coin(405, 140);
        new Coin(405, 90);
        new Coin(455, 90);
        new Coin(455, 140);
        new Coin(455, 190);
        new Coin(455, 240);
        new QuestionBox(600, 100, "!");
        new Brick(750, 140, 300, 10, "skyblue", "brick", true);
        new Bomb(1000, 80, "left");
        new BadGuy(900, 80, 50, 50, "red", "left", true);
        new BuzzSaw(900, 150, 200, 200);
        new BuzzSaw(1100, 5, 300, 300);
        new Platform(100, 10, { x: 800, y: 460 }, { x: 1300, y: 420 }, 3);
        new Platform(100, 10, { x: 1450, y: 460 }, { x: 1450, y: 150 }, 3);
        new Brick(1700, 100, 200, 10, "violet", "brick", false);
        new Brick(1700, 250, 150, 10, "violet", "brick", false);
        new Brick(2000, 190, 200, 10, "violet", "brick", false);
        new Coin(1945, 110);
        new Coin(1850, 40);
        new Coin(1800, 40);
        new Coin(1750, 40);
        new Turret(3000, 5);
        new Brick(2000, 470, 400, 10, "violet", "brick", false);
        new QuestionBox(2050, 340, "!");
        new Coin(2200, 250);
        new Coin(2200, 300);
        new Coin(2200, 350);
        new Coin(2200, 400);
        new Brick(2400, 470, 1600, 10, "violet", "brick", false);
        new Brick(2600, 300, 150, 10, "skyblue", "brick", true);
        new Brick(2750, 300, 150, 10, "skyblue", "brick", true);
        new Brick(2900, 300, 150, 10, "skyblue", "brick", true);
        new Brick(3050, 300, 150, 10, "skyblue", "brick", true);
        new Brick(3200, 300, 150, 10, "skyblue", "brick", true);
        new Brick(3350, 300, 150, 10, "skyblue", "brick", true);
        new Brick(3500, 300, 150, 10, "skyblue", "brick", true);
        new Brick(3300, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3310, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3320, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3330, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3340, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3350, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3360, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3370, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3380, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3390, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3400, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3410, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3420, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3430, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3440, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3450, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3460, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3470, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3480, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3490, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3500, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3510, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3520, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3530, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3540, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3550, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3560, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3570, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3580, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3590, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3600, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3610, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3620, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3630, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3640, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3650, 50, 10, 250, "skyblue", "brick", true);
        new Brick(3650, 300, 150, 10, "skyblue", "brick", true);
        new Brick(3800, 300, 150, 10, "skyblue", "brick", true);
        new Bomb(3900, 240, "right");
        new Brick(3850, 200, 150, 10, "skyblue", "brick", true);
        new Brick(4300, 130, 150, 10, "skyblue", "brick", true);
        new Bomb(4400, 70, "right");
        new Brick(3900, 100, 150, 10, "skyblue", "brick", true);
        new Brick(4200, 150, 10, 10, "skyblue", "brick", true);
        new Bomb(4200, 90, "right");
        new Brick(4600, 460, 500, 10, "violet", "brick", false);
        new QuestionBox(4700, 300, "!");
        new QuestionBox(4750, 300);
        new QuestionBox(4800, 300);
        new QuestionBox(4850, 300);
        new BuzzSaw(4650, 10, 225, 225);
        new Teleporter(5000, 400, Init.World0);
    }
    static resetWorld() {
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
