//
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
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        GameState.appendToWS(this);
    }
    topI() {
        return Math.round(this.y);
    }
    bottomI() {
        return Math.round(this.y + this.height);
    }
    leftI() {
        return Math.round(this.x);
    }
    rightI() {
        return Math.round(this.x + this.width);
    }
    die() {
        GameState.removeFromWS(this);
    }
    stepState() {
        throw new Error("child of WorldItem has undefined stepState()");
    }
}
class Brick extends WorldItem {
    constructor(x, y, width, height, color, className = "brick", destructible = false) {
        super(x, y, width, height, color, className);
        this.destructible = destructible;
        //this.div.className = "brick";
    }
    stepState() {
        if (!this.destructible)
            return;
        const player = GameState.getPlayer();
        player.y--;
        const collisions = Util.isCollidingWith(this);
        player.y++;
        for (let c of collisions) {
            if (c !== player ||
                c.topI() - 1 !== this.bottomI())
                continue;
            // is headbutt by player! destroy self
            player.accel = -player.accel;
            return this.die();
        }
    }
}
class Coin extends Brick {
    constructor(x, y) {
        super(x, y, 50, 50, "yellow", "coin");
        this.div.style.borderRadius = 25 + "px";
        this.div.innerText = "$";
        //this.div.className = "coin";
    }
    stepState() {
        const p = GameState.getPlayer();
        this.x--;
        this.y--;
        this.width += 2;
        this.height += 2;
        const collisions = Util.isCollidingWith(this);
        for (let c of collisions)
            if (p === c) {
                GameState.setNCollectedCoins(GameState.getNCollectedCoins() + 1);
                return this.die();
            }
        this.x++;
        this.y++;
        this.width -= 2;
        this.height -= 2;
    }
}
class PowerUp extends WorldItem {
    constructor(x, y, width, height) {
        super(x, y, width, height, "skyblue", "powerup");
        this.active = true;
        this.div.innerText = "?";
        //this.div.className = "powerup";
    }
    stepState() {
        if (!this.active)
            return;
        const p = GameState.getPlayer();
        this.x--;
        this.y--;
        this.width += 2;
        this.height += 2;
        if (p.topI() === this.bottomI() &&
            Util.isCollidingWith(this).includes(p)) {
            const c = new Coin(this.x + 1, this.y + 1 - 50);
            this.div.style.backgroundColor = "grey";
            this.div.style.color = "black";
            this.active = false;
        }
        this.x++;
        this.y++;
        this.width -= 2;
        this.height -= 2;
    }
}
class AliveWorldItem extends WorldItem {
    constructor(x, y, width, height, color, className = "unknown") {
        super(x, y, width, height, color, className);
        this.accel = 0;
        this.alive = true;
    }
}
class BadGuy extends AliveWorldItem {
    constructor(x, y, width, height, color, dir = "right", patrol = false, ms = 5) {
        super(x, y, width, height, color, "badguy");
        this.dir = dir;
        this.patrol = patrol;
        this.movementSpeed = ms;
        this.accel = 0;
        this.framesSkippedTurning = 0;
    }
    steppedOn() {
        const p = GameState.getPlayer();
        p.y++;
        const collisions = Util.isCollidingWith(this);
        p.y--;
        if (p.bottomI() + 1 == this.topI() && collisions.includes(p))
            return true;
        return false;
    }
    touchingPlayer() {
        const p = GameState.getPlayer();
        this.x--;
        this.y--;
        this.width += 2;
        this.height += 2;
        const collisions = Util.isCollidingWith(this);
        this.x++;
        this.y++;
        this.width -= 2;
        this.height -= 2;
        for (const c of collisions)
            if (p === c)
                return true;
        return false;
    }
    die() {
        GameState.getPlayer().accel = 0;
        this.div.innerText = "x.x";
        this.div.className = "deadbadguy";
        this.height /= 2;
        this.y += this.height;
        this.div.style.top = this.y + "px";
        this.div.style.height = this.height + "px";
        if (this.dir === "right")
            this.div.style.textAlign = "end";
        this.alive = false;
        let timeout = window.setTimeout(() => {
            GameState.removeFromWS(this);
        }, 2000);
        GameState.recordTimeout(timeout);
    }
    // helper for stepState()
    horizCanMoveTo() {
        const hMove = Util.canMoveTo(this, this.dir, this.movementSpeed);
        if (hMove === this.x)
            this.maybeTurnAround();
        const oldX = this.x;
        const oldOnSurface = Util.onSolidSurface(this);
        this.x = hMove + (this.dir === "left" ? -(this.width / 2) :
            (this.width / 2));
        if (this.patrol && oldOnSurface && !Util.onSolidSurface(this)) {
            this.x = oldX;
            this.maybeTurnAround();
        }
        else
            this.x = hMove;
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
        this.div.innerText = "@_@";
        this.div.style.textAlign = "left";
        if (this.dir === "right")
            this.div.style.textAlign = "end";
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
    }
    stepState() {
        this.framesSkippedTurning++;
        if (!this.alive)
            return;
        if (this.steppedOn() || this.bottomI() == Util.bottomEdge - 1)
            return this.die();
        if (this.touchingPlayer())
            return GameState.getPlayer().die();
        this.horizCanMoveTo();
        if (Util.onSolidSurface(this)) {
            //this.horizCanMoveTo();
            this.accel = 0;
        }
        else
            this.accel += 0.2;
        this.y = Util.canMoveTo(this, "down");
        this.decorateDOMSelf();
    }
}
class Player extends AliveWorldItem {
    constructor(x, y, width, height, color) {
        super(x, y, width, height, color, "player");
        this.accel = 0;
        this.isJumping = false;
        this.alreadyJumped = false;
        this.setText();
        if (GameState.getPlayer())
            throw new Error("attempted to spawn a second player");
        GameState.setPlayer(this);
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
        this.y = Util.canMoveTo(this, "up");
    }
    fall() {
        if (!Util.isWDown)
            this.alreadyJumped = false;
        this.isJumping = false;
        if (Util.onSolidSurface(this)) // player landed
            this.accel = 0;
        else { // contine falling
            this.accel += 0.5;
            const canMoveToY = Util.canMoveTo(this, "down");
            if (this.y === canMoveToY)
                this.accel = -this.accel; // bonk
            this.y = canMoveToY;
        }
    }
    die() {
        GameState.setNLivesLeft(GameState.getNLivesLeft() - 1);
        GameState.drawGUI();
        const nLivesLeft = GameState.getNLivesLeft();
        if (0 == nLivesLeft) {
            alert("Game Over! Press OK to play again.");
        }
        Init.resetWorld();
    }
    maybeScroll() {
        const origX = this.x;
        const scrollLine = (Util.rightEdge - Util.leftEdge) / 3;
        const scrollLine2 = 10;
        if (origX > scrollLine)
            for (const w of GameState.ws) {
                w.x -= origX - scrollLine;
                w.div.style.left = w.x + "px";
            }
        else if (origX < scrollLine2)
            for (const w of GameState.ws) {
                w.x += scrollLine2 - origX;
                w.div.style.left = w.x + "px";
            }
    }
    stepState() {
        if (this.bottomI() == Util.bottomEdge - 1)
            this.die();
        let owo = this.div.getElementsByClassName("playertext")[0];
        if (!owo)
            throw new Error("player must have a child div!");
        if (Util.isDDown) {
            this.x = Util.canMoveTo(this, "right", 9);
            owo.style.textAlign = "end";
        }
        if (Util.isADown) {
            this.x = Util.canMoveTo(this, "left", 9);
            owo.style.textAlign = "left";
        }
        if (Util.isWDown && !this.alreadyJumped &&
            Util.onSolidSurface(this))
            this.jump();
        else
            this.fall();
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
        this.maybeScroll();
    }
}
class Teleporter extends WorldItem {
    constructor(x, y, nextLevel) {
        super(x, y, 50, 50, "#9CFF9C", "teleporter");
        this.nextLevel = nextLevel;
    }
    stepState() {
        this.x--;
        this.y--;
        this.width += 2;
        this.height += 2;
        const collisions = Util.isCollidingWith(this);
        for (const c of collisions)
            if (c === GameState.getPlayer()) {
                GameState.clearTimeouts();
                GameState.clearElemsOfWS();
                this.nextLevel();
            }
        this.x++;
        this.y++;
        this.width -= 2;
        this.height -= 2;
    }
}
class GameState {
    constructor() {
        throw new Error("attempted to construct a GameState");
    }
    static appendToWS(w) {
        this.ws.push(w);
    }
    static removeFromWS(trash) {
        for (let i = 0; i < this.ws.length; i++)
            if (this.ws[i] === trash) {
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
        if (this.nLivesLeft < 0)
            throw new Error("nLivesLeft is less than zero");
        return this.nLivesLeft;
    }
    static setNLivesLeft(n) {
        if (n < 0)
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
class UtilHelpers {
    constructor() {
        throw new Error("class UtilHelpers cannot be constructed!");
    }
    // might need a rewrite
    static canMoveStepperX(p, maxStep) {
        let canMoveX = maxStep;
        for (let i = 0; i <= Math.abs(maxStep); i++) {
            let j = maxStep > 0 ? i : -i;
            p.x += j;
            let collisions = Util.isCollidingWith(p);
            let shouldBreak = false;
            for (let c of collisions)
                if (c.div.className !== "coin" &&
                    (p.rightI() === c.leftI() && maxStep > 0 ||
                        p.leftI() === c.rightI() && maxStep < 0)) {
                    canMoveX = j + (maxStep > 0 ? -1 : 1);
                    shouldBreak = true; // found a collision, stop
                }
            p.x -= j;
            if (shouldBreak)
                break;
        }
        let newPosX = p.x + canMoveX;
        //if (newPosX < Util.leftEdge)
        //	newPosX = Util.leftEdge + 1;
        //if (newPosX + p.width > Util.rightEdge)
        //	newPosX = Util.rightEdge - p.width - 1;
        return newPosX;
    }
    // might also need a rewrite. really similar to canMoveStepperX().
    static canMoveStepperY(p) {
        let canMoveY = p.accel;
        for (let i = 0; i <= Math.abs(p.accel); i++) {
            p.y += p.accel > 0 ? i : -i;
            let collisions = Util.isCollidingWith(p);
            let shouldBreak = false;
            for (let c of collisions)
                if (c.div.className !== "coin" &&
                    (p.topI() === c.bottomI() && p.accel < 0 ||
                        p.bottomI() === c.topI() && p.accel > 0)) {
                    canMoveY = (p.accel > 0 ? i : -i) +
                        (p.accel > 0 ? -1 : 1);
                    shouldBreak = true;
                }
            p.y -= p.accel > 0 ? i : -i;
            if (shouldBreak)
                break;
        }
        let newPosY = p.y + canMoveY;
        if (newPosY < Util.topEdge)
            newPosY = Util.topEdge + 1;
        if (newPosY + p.height > Util.bottomEdge)
            newPosY = Util.bottomEdge - p.height - 1;
        return newPosY;
    }
    static isCollidingHoriz(v, w) {
        return true &&
            (Util.isBetween(w.topI(), v.topI(), v.bottomI()) ||
                Util.isBetween(w.bottomI(), v.topI(), v.bottomI()) ||
                (v.topI() >= w.topI() && v.bottomI() <= w.bottomI()) ||
                (v.topI() <= w.topI() && v.bottomI() >= w.bottomI()));
    }
    static isCollidingVert(v, w) {
        return true &&
            (Util.isBetween(w.leftI(), v.leftI(), v.rightI()) ||
                Util.isBetween(w.rightI(), v.leftI(), v.rightI()) ||
                (w.leftI() <= v.leftI() && w.rightI() >= v.rightI()) ||
                (v.leftI() <= w.leftI() && v.rightI() >= w.rightI()));
    }
    static actualRegisterKeys() {
        window.onkeydown = function (e) {
            const key = e.code.toString();
            if (key === "KeyW" || key === "ArrowUp")
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
            if (key === "KeyW" || key === "ArrowUp")
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
    // client-callable fn
    static canMoveTo(p, direction, speed = 1) {
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
    static onSolidSurface(p) {
        let ret = false;
        p.y++;
        if (p.bottomI() === Util.bottomEdge)
            ret = true;
        else
            for (const w of GameState.ws) {
                if (p !== w && p.bottomI() == w.topI() &&
                    Util.isCollidingWith(p).includes(w)) {
                    ret = true;
                    break;
                }
            }
        p.y--;
        return ret;
    }
    // client-callable fn
    static registerKeys() {
        UtilHelpers.actualRegisterKeys();
    }
    // client-callable fn
    static isBetween(a, b, c) {
        if (b > c) {
            const temp = b;
            b = c;
            c = temp;
        }
        return b <= a && a <= c;
    }
    // client-callable fn
    static isCollidingWith(v) {
        let ret = new Array();
        for (const w of GameState.ws)
            if (v !== w && UtilHelpers.isCollidingHoriz(v, w) &&
                UtilHelpers.isCollidingVert(v, w))
                ret.push(w);
        return ret;
    }
    // client-callable fn
    static paintLoop() {
        if (!GameState.before)
            GameState.before = Date.now();
        GameState.now = Date.now();
        if (GameState.now - GameState.before < 1000 / 75) {
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
    static World1() {
        console.log("Entering World 1");
        GameState.currLevel = Init.World1;
        new Brick(100, 400, 75, 10, "skyblue");
        new Brick(200, 300, 100, 10, "blueviolet", "brick", true);
        new Player(10, 10, 50, 50, "limegreen");
        new Brick(300, 450, 10, 10, "skyblue");
        new BadGuy(400, 400, 50, 50, "red", "right", true);
        new BadGuy(340, 60, 50, 50, "red", "right", true);
        new BadGuy(200, 150, 50, 50, "red", "left", true);
        new PowerUp(300, 200, 50, 50);
        new Coin(500, 400);
        new Brick(650, 470, 300, 10, "skyblue");
        new PowerUp(400, 150, 50, 50);
        new PowerUp(450, 150, 50, 50);
        new PowerUp(500, 150, 50, 50);
        new BadGuy(544, 100, 50, 50, "red", "left", false, 10);
        new PowerUp(20, 150, 50, 50);
        new PowerUp(120, 150, 50, 50);
        new PowerUp(450, 300, 50, 50);
        new PowerUp(550, 300, 50, 50);
        new BadGuy(444, 222, 50, 50, "red", "left", true);
        new PowerUp(340, 300, 50, 50);
        new Teleporter(640, 350, Init.World2);
        // x, y, width, height, color, dir?, patrol?, ms?
    }
    static World0() {
        console.log("Entering World 0");
        GameState.currLevel = Init.World0;
        new Player(10, 10, 50, 50, "limegreen");
        new Brick(1, 480 - 10 - 1, 1000, 10, "violet", "brick", false);
        new PowerUp(400, 300, 50, 50);
        new BadGuy(600, 400, 50, 50, "red", "left", false);
        new Brick(1300, 325, 1000, 10, "violet", "brick", false);
        new BadGuy(1800, 250, 50, 50, "red", "left", true);
        new BadGuy(1900, 250, 50, 50, "red", "left", true);
        new BadGuy(2000, 250, 50, 50, "red", "left", true);
        new Coin(2200, 25);
        new Brick(2800, 450, 100, 10, "violet", "brick", false);
        new Brick(2890, 350, 10, 10, "violet", "brick", false);
        new Brick(3000, 225, 100, 10, "violet", "brick", false);
        new Brick(3200, 100, 100, 10, "violet", "brick", false);
        new Brick(3200, 150, 10, 300, "violet", "brick", false);
        new Coin(3210, 200);
        new Brick(3600, 450, 300, 10, "violet", "brick", false);
        new Teleporter(3900, 300, Init.World1);
    }
    static World2() {
        console.log("Entering World 2");
        GameState.currLevel = Init.World2;
        new Player(20, 200, 50, 50, "limegreen");
        new Brick(1, 470, 1009, 10, "violet", "brick", false);
        new Brick(1, 120, 10, 360, "violet", "brick", false);
        new PowerUp(400, 300, 50, 50);
        new PowerUp(450, 300, 50, 50);
        new PowerUp(500, 300, 50, 50);
        new PowerUp(550, 300, 50, 50);
        new BadGuy(500, 220, 50, 50, "red", "left", true, 5);
        new Brick(1, 120, 1000, 10, "violet", "brick", false);
        new BadGuy(1, 60, 50, 50, "red", "right", false);
        new Brick(1100, 120, 10, 30, "violet", "brick", false);
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
        new Teleporter(3900, 70, Init.World0);
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
    Init.resetWorld();
    Util.registerKeys();
    Util.paintLoop();
})();
