//
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PreLoadImg = /** @class */ (function () {
    function PreLoadImg() {
        throw new Error("tried to construct a preloadimg");
    }
    PreLoadImg.preload = function (url) {
        var imgElem = document.createElement("img");
        imgElem.src = url;
        imgElem.style.position = "fixed";
        imgElem.style.opacity = "0.0001%";
        imgElem.style.width = "1px";
        document.body.appendChild(imgElem);
        this.imgElems.push(imgElem);
    };
    PreLoadImg.getImg = function (index) {
        if (index >= this.imgElems.length)
            throw new Error("tried to access nonexistent image in cache");
        var imgElem = this.imgElems[index];
        imgElem.style.position = "";
        imgElem.style.opacity = "";
        imgElem.style.width = "100%";
        return imgElem;
    };
    PreLoadImg.imgElems = new Array();
    return PreLoadImg;
}());
var WorldItem = /** @class */ (function () {
    function WorldItem(x, y, width, height, color, className) {
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
    WorldItem.prototype.topI = function () {
        return Math.round(this.y);
    };
    WorldItem.prototype.bottomI = function () {
        return Math.round(this.y + this.height);
    };
    WorldItem.prototype.leftI = function () {
        return Math.round(this.x);
    };
    WorldItem.prototype.rightI = function () {
        return Math.round(this.x + this.width);
    };
    WorldItem.prototype.die = function () {
        GameState.removeFromWS(this);
    };
    WorldItem.prototype.getClassName = function () {
        return this.div.className;
    };
    WorldItem.prototype.setClassName = function (newName) {
        this.div.className = newName;
    };
    WorldItem.prototype.getColor = function () {
        return this.color;
    };
    WorldItem.prototype.setColor = function (newColor) {
        this.color = newColor;
        this.div.style.backgroundColor = newColor;
    };
    WorldItem.prototype.scroll = function (amount) {
        this.x += amount;
        this.div.style.left = this.x + "px";
    };
    WorldItem.prototype.stepState = function () {
        throw new Error("child of WorldItem has undefined stepState()");
    };
    return WorldItem;
}());
var Brick = /** @class */ (function (_super) {
    __extends(Brick, _super);
    function Brick(x, y, width, height, color, className, destructible) {
        if (className === void 0) { className = "brick"; }
        if (destructible === void 0) { destructible = false; }
        var _this = _super.call(this, x, y, width, height, color, className) || this;
        _this.destructible = destructible;
        return _this;
    }
    Brick.prototype.stepState = function () {
        if (!this.destructible)
            return;
        var player = GameState.getPlayer();
        var collisions = Util.isCollidingWith(this);
        for (var _i = 0, collisions_1 = collisions; _i < collisions_1.length; _i++) {
            var c = collisions_1[_i];
            if (c !== player || c.topI() - 1 !== this.bottomI())
                continue;
            // is headbutt by player! destroy self
            player.accel = -player.accel;
            return this.die();
        }
    };
    return Brick;
}(WorldItem));
var Platform = /** @class */ (function (_super) {
    __extends(Platform, _super);
    function Platform(width, height, start, end, speed) {
        if (start === void 0) { start = { x: 0, y: 0 }; }
        if (end === void 0) { end = { x: 0, y: 0 }; }
        if (speed === void 0) { speed = 0; }
        var _this = _super.call(this, start.x, start.y, width, height, "orange", "platform", false) || this;
        _this.start = start;
        _this.end = end;
        _this.speed = speed;
        if (_this.start.x > _this.end.x)
            throw new Error("invalid start/end points for Platform");
        return _this;
    }
    Platform.prototype.scroll = function (amount) {
        this.x += amount;
        this.div.style.left = this.x + "px";
        this.start.x += amount;
        this.end.x += amount;
    };
    Platform.prototype.stepState = function () {
        if (this.speed === 0)
            return;
        var distBetweenEndpoints = 0;
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
                this.x = this.start.x;
                this.y = this.start.y;
            }
            else {
                this.x = this.end.x;
                this.y = this.end.y;
            }
        }
        var origSpeed = this.speed;
        if (distBetweenEndpoints < Math.abs(this.speed))
            this.speed = distBetweenEndpoints * this.speed > 0 ? 1 : -1;
        var rise = 0;
        var run = 0;
        if (this.speed > 0) {
            rise = this.end.y - this.y;
            run = this.end.x - this.x;
        }
        else { // speed < 0
            rise = this.y - this.start.y;
            run = this.x - this.start.x;
        }
        var scaleFactor = this.speed / distBetweenEndpoints;
        var deltaY = rise * scaleFactor;
        var deltaX = run * scaleFactor;
        if (Math.abs(deltaY) > Math.abs(this.speed) ||
            Math.abs(deltaX) > Math.abs(this.speed)) {
            console.warn("programmer error: delta is greater than speed");
            console.warn("delta: ", deltaX, ", speed: ", this.speed);
        }
        this.accel = deltaY;
        var canMoveY = Util.canMoveTo(this, "up");
        var canMoveX = Util.canMoveTo(this, this.speed > 0 ? "right" : "left", Math.abs(deltaX));
        deltaY = canMoveY - this.y;
        deltaX = canMoveX - this.x;
        var collisions = Util.isCollidingWith(this);
        for (var _i = 0, collisions_2 = collisions; _i < collisions_2.length; _i++) {
            var c = collisions_2[_i];
            if (c.bottomI() + 1 !== this.topI())
                continue;
            // for each item sitting on this platform, move item
            c.x += deltaX;
            c.y += deltaY;
            c.div.style.left = c.x + "px";
            c.div.style.top = c.y + "px";
        }
        this.y = canMoveY;
        this.x = canMoveX;
        this.div.style.top = this.y + "px";
        this.div.style.left = this.x + "px";
        this.speed = origSpeed;
        if (this.x === this.end.x && this.y === this.end.y ||
            this.x === this.start.x && this.y === this.start.y)
            this.speed = -this.speed;
    };
    return Platform;
}(Brick));
var Coin = /** @class */ (function (_super) {
    __extends(Coin, _super);
    function Coin(x, y) {
        var _this = _super.call(this, x, y, 50, 50, "yellow", "coin") || this;
        //	this.div.style.borderRadius = 25 + "px";
        _this.div.innerText = "$";
        return _this;
    }
    Coin.prototype.stepState = function () {
        var p = GameState.getPlayer();
        var collisions = Util.isCollidingWith(this);
        for (var _i = 0, collisions_3 = collisions; _i < collisions_3.length; _i++) {
            var c = collisions_3[_i];
            if (p === c) {
                GameState.setNCollectedCoins(GameState.getNCollectedCoins() + 1);
                return this.die();
            }
        }
    };
    return Coin;
}(Brick));
var PowerUp = /** @class */ (function (_super) {
    __extends(PowerUp, _super);
    function PowerUp(x, y) {
        var _this = _super.call(this, x, y, 50, 50, "green", "powerup") || this;
        var imgHandle = PreLoadImg.getImg(0);
        _this.div.appendChild(imgHandle);
        return _this;
    }
    PowerUp.prototype.makeBigPlayer = function () {
        GameState.getPlayer().grow();
    };
    PowerUp.prototype.stepState = function () {
        var p = GameState.getPlayer();
        var collisions = Util.isCollidingWith(this);
        for (var _i = 0, collisions_4 = collisions; _i < collisions_4.length; _i++) {
            var c = collisions_4[_i];
            if (p === c) {
                this.makeBigPlayer();
                return this.die();
            }
        }
    };
    return PowerUp;
}(Brick));
var QuestionBox = /** @class */ (function (_super) {
    __extends(QuestionBox, _super);
    function QuestionBox(x, y, spawns) {
        if (spawns === void 0) { spawns = "$"; }
        var _this = _super.call(this, x, y, 50, 50, "skyblue", "qbox") || this;
        _this.active = true;
        _this.div.innerText = "?";
        if (spawns === "$")
            _this.contents = "coin";
        else
            _this.contents = "powerup";
        return _this;
    }
    QuestionBox.prototype.deactivate = function () {
        this.div.style.backgroundColor = "grey";
        this.div.style.color = "black";
        this.active = false;
    };
    QuestionBox.prototype.stepState = function () {
        if (!this.active)
            return;
        var p = GameState.getPlayer();
        if (p.topI() - 1 === this.bottomI()) {
            var colls = Util.isCollidingWith(this);
            for (var _i = 0, colls_1 = colls; _i < colls_1.length; _i++) {
                var col = colls_1[_i];
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
    };
    QuestionBox.prototype.die = function () {
        this.deactivate();
    };
    return QuestionBox;
}(WorldItem));
var AliveWorldItem = /** @class */ (function (_super) {
    __extends(AliveWorldItem, _super);
    function AliveWorldItem(x, y, width, height, color, className) {
        if (className === void 0) { className = "unknown"; }
        var _this = _super.call(this, x, y, width, height, color, className) || this;
        _this.accel = 0;
        _this.alive = true;
        return _this;
    }
    return AliveWorldItem;
}(WorldItem));
var BadGuy = /** @class */ (function (_super) {
    __extends(BadGuy, _super);
    function BadGuy(x, y, width, height, color, dir, patrol, ms, className) {
        if (dir === void 0) { dir = "right"; }
        if (patrol === void 0) { patrol = false; }
        if (ms === void 0) { ms = 3; }
        if (className === void 0) { className = "badguy"; }
        var _this = _super.call(this, x, y, width, height, color, className) || this;
        _this.dir = dir;
        _this.patrol = patrol;
        _this.movementSpeed = ms;
        _this.accel = 0;
        _this.framesSkippedTurning = 0;
        return _this;
    }
    BadGuy.prototype.steppedOn = function () {
        var p = GameState.getPlayer();
        if (p.bottomI() + 1 == this.topI()) {
            var collisions = Util.isCollidingWith(this);
            for (var _i = 0, collisions_5 = collisions; _i < collisions_5.length; _i++) {
                var col = collisions_5[_i];
                if (col == p)
                    return true;
            }
        }
        return false;
    };
    BadGuy.prototype.touchingPlayer = function () {
        var p = GameState.getPlayer();
        var collisions = Util.isCollidingWith(this);
        for (var _i = 0, collisions_6 = collisions; _i < collisions_6.length; _i++) {
            var c = collisions_6[_i];
            if (p === c)
                return true;
        }
        return false;
    };
    BadGuy.prototype.die = function () {
        var _this = this;
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
        var timeout = window.setTimeout(function () {
            GameState.removeFromWS(_this);
        }, 2000);
        GameState.recordTimeout(timeout);
    };
    // helper for stepState()
    BadGuy.prototype.horizCanMoveTo = function () {
        var hMove = Util.canMoveTo(this, this.dir, this.movementSpeed);
        if (hMove === this.x)
            this.maybeTurnAround();
        var oldX = this.x;
        var oldOnSurface = Util.onSolidSurface(this);
        this.x = hMove + (this.dir === "left" ? -(this.width / 2) :
            (this.width / 2)); // why???
        if (this.patrol && oldOnSurface && !Util.onSolidSurface(this)) {
            this.x = oldX;
            this.maybeTurnAround();
        }
        else
            this.x = hMove;
    };
    // helper for stepState()
    BadGuy.prototype.maybeTurnAround = function () {
        if (this.framesSkippedTurning <= 20)
            return;
        this.framesSkippedTurning = 0;
        if (this.dir === "right")
            this.dir = "left";
        else
            this.dir = "right";
    };
    BadGuy.prototype.decorateDOMSelf = function () {
        this.div.innerText = "@_@";
        this.div.style.textAlign = "left";
        if (this.dir === "right")
            this.div.style.textAlign = "end";
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
    };
    BadGuy.prototype.stepState = function () {
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
    };
    return BadGuy;
}(AliveWorldItem));
var Bomb = /** @class */ (function (_super) {
    __extends(Bomb, _super);
    function Bomb(x, y, dir) {
        if (dir === void 0) { dir = "right"; }
        var _this = _super.call(this, x, y, 50, 50, "hotpink", dir, true, 3, "bomb") || this;
        _this.isTicking = false;
        return _this;
    }
    Bomb.prototype.explode = function () {
        var _this = this;
        this.x -= 50;
        this.y -= 50;
        this.width *= 3;
        this.height *= 3;
        this.stepState = function () {
            if (_this.touchingPlayer())
                GameState.getPlayer().die();
        };
        this.div.style.width = this.width + "px";
        this.div.style.height = this.height + "px";
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
        this.div.className = "explodingbomb";
        var colls = Util.isCollidingWith(this);
        for (var _i = 0, colls_2 = colls; _i < colls_2.length; _i++) {
            var c = colls_2[_i];
            if (c.getClassName() === "coin" || c.getClassName() === "qbox" ||
                c.getClassName() === "badguy" || c.getClassName() === "bomb" ||
                c.getClassName() === "player")
                c.die();
        }
    };
    Bomb.prototype.die = function () {
        var _this = this;
        if (this.isTicking)
            return;
        GameState.getPlayer().accel = 0;
        this.div.innerText = "O.O";
        this.div.className = "tickingbomb";
        var flickerHandle = window.setInterval(function () {
            if (_this.div.style.backgroundColor != "hotpink")
                _this.div.style.backgroundColor = "hotpink";
            else
                _this.div.style.backgroundColor = "red";
        }, 250);
        GameState.recordTimeout(flickerHandle);
        var stopflickerHandle = window.setTimeout(function () {
            window.clearInterval(flickerHandle);
            _this.explode();
            var deleteBombHandle = window.setTimeout(function () {
                GameState.removeFromWS(_this);
            }, 500);
            GameState.recordTimeout(deleteBombHandle);
        }, 2000);
        GameState.recordTimeout(stopflickerHandle);
        this.isTicking = true;
    };
    Bomb.prototype.decorateDOMSelf = function () {
        this.div.innerText = "-.-";
        if (this.isTicking)
            this.div.innerText = "O.O";
        this.div.style.textAlign = "left";
        if (this.dir === "right")
            this.div.style.textAlign = "end";
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
    };
    return Bomb;
}(BadGuy));
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(x, y, sz) {
        var _this = _super.call(this, x, y, 50, 50, "", "player") || this;
        _this.sz = sz;
        if (_this.sz === "big") {
            _this.sz = "smol";
            _this.grow();
        }
        _this.invincible = false;
        _this.accel = 0;
        _this.isJumping = false;
        _this.alreadyJumped = false;
        _this.setText();
        if (GameState.getPlayer())
            throw new Error("attempted to spawn a second player");
        GameState.setPlayer(_this);
        return _this;
    }
    Player.prototype.grow = function () {
        if (this.sz === "big")
            return; // can't grow twice
        this.height *= 2;
        this.div.style.height = this.height + "px";
        this.y -= this.height / 2;
        this.div.style.top = this.topI() + "px";
        this.sz = "big";
    };
    Player.prototype.shrink = function () {
        var _this = this;
        if (this.sz !== "big")
            throw new Error("bad player shrink() call");
        this.height /= 2;
        this.div.style.height = this.height + "px";
        this.sz = "smol";
        this.invincible = true;
        var invincibleTimerHandle = window.setTimeout(function () {
            _this.invincible = false;
            _this.setColor("limegreen");
        }, 1000);
        GameState.recordTimeout(invincibleTimerHandle);
    };
    Player.prototype.setText = function () {
        var child = document.createElement("div");
        child.innerText = "OwO";
        child.style.textAlign = "end";
        child.className = "playertext";
        this.div.appendChild(child);
    };
    Player.prototype.jump = function () {
        this.isJumping = true;
        this.alreadyJumped = true;
        this.accel = -13;
        this.y = Util.canMoveTo(this, "up");
    };
    Player.prototype.fall = function () {
        if (!Util.isWDown)
            this.alreadyJumped = false;
        this.isJumping = false;
        if (Util.onSolidSurface(this)) // player landed
            this.accel = 0;
        else { // contine falling
            this.accel += 0.5;
            var canMoveToY = Util.canMoveTo(this, "down");
            if (this.y === canMoveToY)
                this.accel = -this.accel; // bonk
            this.y = canMoveToY;
        }
    };
    Player.prototype.die = function () {
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
        var playerTextDiv = this.div.getElementsByClassName("playertext")[0];
        playerTextDiv.innerText = "XwX";
        playerTextDiv.className = "playertextdying";
        this.stepState = function () { }; // stop processing user input
        this.setClassName("dyingplayer");
        var resetDelay = 0;
        if (GameState.getNLivesLeft() === 0)
            alert("Game Over! Press OK to play again.");
        else
            resetDelay = 2000;
        var resetWorldTimeoutHandle = window.setTimeout(function () {
            Init.resetWorld();
        }, resetDelay);
        GameState.recordTimeout(resetWorldTimeoutHandle);
    };
    Player.prototype.maybeScroll = function () {
        var origX = this.x;
        var scrollLine = (Util.rightEdge - Util.leftEdge) / 3;
        var scrollLine2 = 10;
        if (origX > scrollLine)
            for (var _i = 0, _a = GameState.ws; _i < _a.length; _i++) {
                var w = _a[_i];
                w.scroll(-origX + scrollLine);
                //w.x -= origX - scrollLine;
                //w.div.style.left = w.x + "px";
            }
        else if (origX < scrollLine2)
            for (var _b = 0, _c = GameState.ws; _b < _c.length; _b++) {
                var w = _c[_b];
                w.scroll(scrollLine2 - origX);
                //w.x += scrollLine2 - origX;
                //w.div.style.left = w.x + "px";
            }
    };
    Player.prototype.stepState = function () {
        if (this.invincible) {
            if (this.getColor() === "limegreen")
                this.setColor("greenyellow");
            else
                this.setColor("limegreen");
        }
        if (this.bottomI() === Util.bottomEdge - 1) {
            this.die();
            return;
        }
        var owo = this.div.getElementsByClassName("playertext")[0];
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
    };
    return Player;
}(AliveWorldItem));
var Teleporter = /** @class */ (function (_super) {
    __extends(Teleporter, _super);
    function Teleporter(x, y, nextLevel) {
        var _this = _super.call(this, x, y, 50, 50, "#9CFF9C", "teleporter") || this;
        _this.nextLevel = nextLevel;
        return _this;
    }
    Teleporter.prototype.stepState = function () {
        var collisions = Util.isCollidingWith(this);
        for (var _i = 0, collisions_7 = collisions; _i < collisions_7.length; _i++) {
            var c = collisions_7[_i];
            if (c === GameState.getPlayer()) {
                var szPlayer = GameState.getPlayer().sz;
                GameState.clearTimeouts();
                GameState.clearElemsOfWS();
                this.nextLevel(szPlayer);
            }
        }
    };
    return Teleporter;
}(WorldItem));
var GameState = /** @class */ (function () {
    function GameState() {
        throw new Error("attempted to construct a GameState");
    }
    GameState.appendToWS = function (w) {
        this.ws.push(w);
    };
    GameState.removeFromWS = function (trash) {
        for (var i = 0; i < this.ws.length; i++)
            if (this.ws[i] === trash) {
                this.ws.splice(i--, 1); // clean the .ws array
                break;
            }
        var div = trash.div;
        div.parentNode.removeChild(div); // clean the DOM
    };
    // destroy all worldly items
    GameState.clearElemsOfWS = function () {
        for (var i = 0; i < this.ws.length; i++) {
            this.removeFromWS(this.ws[i]);
            i--;
        }
        this.player = null;
    };
    GameState.setPlayer = function (p) {
        this.player = p;
    };
    GameState.getPlayer = function () {
        return this.player;
    };
    // Return the number of coins collected by the player.
    GameState.getNCollectedCoins = function () {
        return this.nCollectedCoins;
    };
    // Set the number of coins collected by the player.
    GameState.setNCollectedCoins = function (n) {
        if (n < 0)
            throw new Error("nCollectedCoins must be >= 0");
        this.nCollectedCoins = n;
    };
    // helper fn for drawGUI().
    GameState.getDOMElemById = function (id) {
        var div = document.getElementById(id);
        if (!div) {
            var newdiv = document.createElement("div");
            newdiv.id = id;
            newdiv.style.margin = "0.5vw";
            document.body.appendChild(newdiv);
            div = newdiv;
        }
        return div;
    };
    // helper fn for drawGUI().
    GameState.getGUIncoins = function () {
        return this.getDOMElemById("GUIncoins");
    };
    // helper fn for drawGUI().
    GameState.getGUInlives = function () {
        return this.getDOMElemById("GUInlives");
    };
    GameState.getNLivesLeft = function () {
        if (this.nLivesLeft < 0)
            throw new Error("nLivesLeft is less than zero");
        return this.nLivesLeft;
    };
    GameState.setNLivesLeft = function (n) {
        if (n < 0)
            throw new Error("nLivesLeft is less than zero");
        this.nLivesLeft = n;
    };
    GameState.drawGUI = function () {
        var ncoinsDiv = this.getGUIncoins();
        ncoinsDiv.innerText = "Coins: " +
            Util.formatToFourDigits(this.getNCollectedCoins());
        var nlivesDiv = this.getGUInlives();
        nlivesDiv.innerText = "Lives: " +
            Util.formatToFourDigits(this.getNLivesLeft());
    };
    // Make note of the timeout.
    GameState.recordTimeout = function (timeout) {
        this.timeOuts.push(timeout);
    };
    // Destroy all timeouts.
    GameState.clearTimeouts = function () {
        for (var i = 0; i < this.timeOuts.length; i++) {
            window.clearTimeout(this.timeOuts[i]);
            this.timeOuts.splice(i--, 1);
        }
        if (this.timeOuts.length !== 0)
            throw new Error("programming error on clearTimeouts()");
    };
    GameState.ws = new Array();
    GameState.player = null;
    GameState.currLevel = null;
    GameState.nCollectedCoins = 0;
    GameState.nLivesLeft = 4;
    GameState.timeOuts = new Array();
    GameState.before = 0;
    GameState.now = 1;
    return GameState;
}());
var UtilHelpers = /** @class */ (function () {
    function UtilHelpers() {
        throw new Error("class UtilHelpers cannot be constructed!");
    }
    // might need a rewrite
    UtilHelpers.canMoveStepperX = function (p, maxStep) {
        var canMoveX = p.x; //maxStep;
        for (var i = 0; i < Math.abs(maxStep); i++) {
            var j = maxStep > 0 ? i : -i;
            p.x += j;
            var collisions = Util.isCollidingWith(p);
            var shouldBreak = false;
            for (var _i = 0, collisions_8 = collisions; _i < collisions_8.length; _i++) {
                var c = collisions_8[_i];
                if (c.getClassName() !== "coin" &&
                    c.getClassName() !== "teleporter" &&
                    (p.rightI() + 1 === c.leftI() && maxStep > 0 ||
                        p.leftI() - 1 === c.rightI() && maxStep < 0)) {
                    shouldBreak = true; // found a collision, stop
                    break;
                }
            }
            p.x -= j;
            if (shouldBreak)
                break;
            canMoveX += maxStep > 0 ? 1 : -1;
        }
        return canMoveX;
    };
    // might also need a rewrite. really similar to canMoveStepperX().
    UtilHelpers.canMoveStepperY = function (p) {
        var canMoveY = p.y;
        for (var i = 0; i < Math.abs(p.accel); i++) {
            var savedpy = p.y;
            p.y += p.accel > 0 ? i : -i;
            var collisions = Util.isCollidingWith(p);
            var shouldBreak = false;
            for (var _i = 0, collisions_9 = collisions; _i < collisions_9.length; _i++) {
                var c = collisions_9[_i];
                if (c.getClassName() !== "coin" &&
                    c.getClassName() !== "teleporter" &&
                    (p.topI() - 1 === c.bottomI() && p.accel < 0 ||
                        p.bottomI() + 1 === c.topI() && p.accel > 0)) {
                    shouldBreak = true;
                    break;
                }
            }
            p.y = savedpy;
            if (shouldBreak)
                break;
            canMoveY += p.accel > 0 ? 1 : -1;
        }
        var newPosY = canMoveY;
        if (newPosY < Util.topEdge)
            newPosY = Util.topEdge + 1;
        if (newPosY + p.height > Util.bottomEdge)
            newPosY = Util.bottomEdge - p.height - 1;
        return newPosY;
    };
    UtilHelpers.isCollidingHoriz = function (v, w) {
        return true &&
            (Util.isBetween(w.topI(), v.topI(), v.bottomI()) ||
                Util.isBetween(w.bottomI(), v.topI(), v.bottomI()) ||
                (v.topI() >= w.topI() && v.bottomI() <= w.bottomI()) ||
                (v.topI() <= w.topI() && v.bottomI() >= w.bottomI()));
    };
    UtilHelpers.isCollidingVert = function (v, w) {
        return true &&
            (Util.isBetween(w.leftI(), v.leftI(), v.rightI()) ||
                Util.isBetween(w.rightI(), v.leftI(), v.rightI()) ||
                (w.leftI() <= v.leftI() && w.rightI() >= v.rightI()) ||
                (v.leftI() <= w.leftI() && v.rightI() >= w.rightI()));
    };
    UtilHelpers.actualRegisterKeys = function () {
        window.onkeydown = function (e) {
            var key = e.code.toString();
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
            var key = e.code.toString();
            if (key === "KeyW" || key === "ArrowUp" || key === "Space")
                Util.isWDown = false;
            if (key === "KeyA" || key === "ArrowLeft")
                Util.isADown = false;
            if (key === "KeyS" || key === "ArrowDown")
                Util.isSDown = false;
            if (key === "KeyD" || key === "ArrowRight")
                Util.isDDown = false;
        };
        var pointerMoveFn = function (e) {
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
    };
    return UtilHelpers;
}());
var Util = /** @class */ (function () {
    function Util() {
        throw new Error("attempted to construct class Util");
    }
    Util.formatToFourDigits = function (m) {
        var n = m + "";
        while (n.length < 4) {
            n = "0" + n;
        }
        return n;
    };
    Util.preloadImages = function () {
        PreLoadImg.preload("images/arrowup.svg");
    };
    // client-callable fn
    Util.canMoveTo = function (p, direction, speed) {
        if (speed === void 0) { speed = 1; }
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
    };
    // client-callable fn
    Util.onSolidSurface = function (p) {
        var ret = false;
        //p.y++;
        if (p.bottomI() + 1 === Util.bottomEdge)
            ret = true;
        else
            for (var _i = 0, _a = GameState.ws; _i < _a.length; _i++) {
                var w = _a[_i];
                var shouldBreak = false;
                if (p !== w && p.bottomI() + 1 == w.topI() &&
                    w.getClassName() !== "teleporter") {
                    var collisions = Util.isCollidingWith(p);
                    for (var _b = 0, collisions_10 = collisions; _b < collisions_10.length; _b++) {
                        var c = collisions_10[_b];
                        if (c === w) {
                            ret = true;
                            shouldBreak = true;
                            break;
                        }
                    }
                }
                if (shouldBreak)
                    break;
            }
        //p.y--;
        return ret;
    };
    // client-callable fn
    Util.registerKeys = function () {
        UtilHelpers.actualRegisterKeys();
    };
    // client-callable fn
    Util.isBetween = function (a, b, c) {
        if (b > c) {
            var temp = b;
            b = c;
            c = temp;
        }
        return b <= a && a <= c;
    };
    // client-callable fn
    Util.isCollidingWith = function (v) {
        v.x--;
        v.y--;
        v.width += 2;
        v.height += 2;
        var ret = new Array();
        for (var _i = 0, _a = GameState.ws; _i < _a.length; _i++) {
            var w = _a[_i];
            if (v !== w && UtilHelpers.isCollidingHoriz(v, w) &&
                UtilHelpers.isCollidingVert(v, w) &&
                !(v.bottomI() === w.topI() && v.leftI() === w.rightI()) &&
                !(v.bottomI() === w.topI() && v.rightI() === w.leftI()) &&
                !(v.topI() === w.bottomI() && v.leftI() === w.rightI()) &&
                !(v.topI() === w.bottomI() && v.rightI() === w.leftI()))
                ret.push(w);
        }
        v.x++;
        v.y++;
        v.width -= 2;
        v.height -= 2;
        return ret;
    };
    // client-callable fn
    Util.paintLoop = function () {
        if (!GameState.before)
            GameState.before = Date.now();
        GameState.now = Date.now();
        if (GameState.now - GameState.before < 1000 / 72) {
            window.requestAnimationFrame(Util.paintLoop);
            return;
        }
        GameState.before = GameState.now;
        for (var _i = 0, _a = GameState.ws; _i < _a.length; _i++) {
            var w = _a[_i];
            w.stepState();
        }
        GameState.drawGUI();
        window.requestAnimationFrame(Util.paintLoop);
    };
    Util.drawBorders = function () {
        document.body.style.margin = "unset";
        var div = document.createElement("div");
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
    };
    Util.isWDown = false;
    Util.isADown = false;
    Util.isSDown = false;
    Util.isDDown = false;
    Util.leftEdge = 0;
    Util.rightEdge = 640;
    Util.topEdge = 0;
    Util.bottomEdge = 480;
    return Util;
}());
// Note: world fns must set GameState.currLevel to themselves.
var Init = /** @class */ (function () {
    function Init() {
        throw new Error("attempted to construct class Init");
    }
    Init.World1 = function (sz) {
        console.log("Entering World 1");
        GameState.currLevel = Init.World1;
        new Brick(100, 400, 75, 10, "skyblue");
        new Brick(200, 330, 100, 10, "blueviolet", "brick", true);
        new Brick(230, 345, 10, 10, "skyblue", "brick", true);
        new Player(10, 10, sz);
        new Brick(300, 450, 10, 10, "skyblue");
        new BadGuy(400, 400, 50, 50, "red", "right", true);
        new BadGuy(340, 60, 50, 50, "red", "right", true);
        new BadGuy(200, 150, 50, 50, "red", "left", true);
        new QuestionBox(300, 200, "!");
        new Coin(500, 400);
        new Brick(650, 470, 300, 10, "skyblue");
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
    };
    Init.World0 = function (sz) {
        if (sz === void 0) { sz = "smol"; }
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
    };
    Init.World2 = function (sz) {
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
        new Teleporter(3900, 70, Init.World0);
    };
    Init.resetWorld = function () {
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
    };
    return Init;
}());
// main?
(function () {
    Util.drawBorders();
    Util.preloadImages();
    Init.resetWorld();
    Util.registerKeys();
    Util.paintLoop();
})();
