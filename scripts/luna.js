// 
class Common {
    constructor() {
        this.div = document.createElement("div");
    }
    setX(x) {
        this.x = x;
        this.div.style.left = this.x + "px";
    }
    getX() {
        return this.x;
    }
    setY(y) {
        this.y = y;
        this.div.style.top = this.y + "px";
    }
    getY() {
        return this.y;
    }
    setWidth(width) {
        this.width = width;
        this.div.style.width = this.width + "px";
    }
    getWidth() {
        return this.width;
    }
    setHeight(height) {
        this.height = height;
        this.div.style.height = this.height + "px";
    }
    getHeight() {
        return this.height;
    }
    close() {
        const trash = this.getDiv();
        trash.parentNode.removeChild(trash);
    }
    getDiv() {
        return this.div;
    }
}
class StartMenuLeftTag extends Common {
    constructor(startmenu, name, icon = null, fn = null) {
        super();
        this.name = name;
        this.getDiv().innerText = this.name;
        this.getDiv().className = "startmenulefttag";
        if (this.name === "") {
            this.getDiv().style.flex = "1";
            this.getDiv().style.fontWeight = "bold";
            this.getDiv().className = "startmenuleftspacer";
        }
        if (icon)
            this.getDiv().appendChild(icon);
        if (fn) {
            this.getDiv().addEventListener("click", () => {
                fn();
            });
        }
        startmenu.childLeft.appendChild(this.getDiv());
    }
}
class StartMenuBottomTag extends Common {
    constructor(startmenu, text, icon = null, fn = null) {
        super();
        this.text = text;
        this.getDiv().innerText = this.text;
        if (icon)
            this.getDiv().appendChild(icon);
        if (fn)
            this.getDiv().addEventListener("click", () => {
                fn();
            });
        this.getDiv().className = "startmenubottomtag";
        startmenu.childBottom.appendChild(this.getDiv());
    }
}
class StartMenuRightTag extends Common {
    constructor(startmenu, text, icon = null, fn = null) {
        super();
        this.text = text;
        this.getDiv().innerText = this.text;
        this.getDiv().className = "startmenurighttag";
        if (icon)
            this.getDiv().appendChild(icon);
        if (fn)
            this.getDiv().addEventListener("click", () => {
                fn();
            });
        startmenu.childRight.appendChild(this.getDiv());
    }
}
class StartMenu extends Common {
    constructor(taskbar) {
        super();
        this.taskbar = taskbar;
        const bounding = taskbar.getDiv().getBoundingClientRect();
        this.getDiv().className = "startmenu";
        this.setHeight(370);
        this.setWidth(450);
        this.setX(bounding.left);
        this.setY(bounding.top - this.getHeight());
        this.addChildren();
        this.populateLeftChild();
        this.populateRightChild();
        this.populateBottomChild();
        this.taskbar.getDiv().appendChild(this.div);
    }
    yellowIcon() {
        const ret = document.createElement("div");
        ret.className = "yellowfoldericon";
        return ret;
    }
    cyanPCIcon() {
        const ret = document.createElement("div");
        ret.className = "cyanpcicon";
        return ret;
    }
    redIcon() {
        const ret = document.createElement("div");
        ret.className = "redicon";
        return ret;
    }
    myPCfn() {
        new aWindow(this.taskbar, -1, -1, 400, 300, "My Computer", ["C:\\", "D:\\"]);
    }
    runfn() {
        const bw = new BasicWindow(this.taskbar, 25, Util.bottomEdge - 50 - 200, 400, 200, "Run");
        const inputdiv = document.createElement("input");
        inputdiv.className = "runinputdiv";
        inputdiv.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                bw.close();
                const nw = new BasicWindow(this.taskbar, 200, 200, 400, 100, "File Not Found");
                nw.getDiv().style.backgroundColor = "lightyellow";
                const adiv = Util.newDiv("errmsg");
                adiv.innerText = "The requested resource could not be located.";
                nw.getDiv().appendChild(adiv);
            }
        });
        bw.getDiv().appendChild(inputdiv);
    }
    ctrlpnlfn() {
        const awin = new aWindow(this.taskbar, -1, -1, 400, 400, "Control Panel", ["Add/Remove Programs", "Display", "System",
            "Users"]);
    }
    mydocfn() {
        const awin = new aWindow(this.taskbar, -1, -1, 400, 300, "My Documents", ["old files", "Word Templates", "setup.exe"]);
    }
    mypicfn() {
        const awin = new aWindow(this.taskbar, -1, -1, 400, 300, "My Pictures", ["SPHERE.gif", "photo.jpg"]);
    }
    populateRightChild() {
        this.mydocfn = this.mydocfn.bind(this);
        new StartMenuRightTag(this, "My Documents", this.yellowIcon(), this.mydocfn);
        this.mypicfn = this.mypicfn.bind(this);
        new StartMenuRightTag(this, "My Pictures", this.yellowIcon(), this.mypicfn);
        this.myPCfn = this.myPCfn.bind(this);
        new StartMenuRightTag(this, "My Computer", this.cyanPCIcon(), this.myPCfn);
        this.ctrlpnlfn = this.ctrlpnlfn.bind(this);
        new StartMenuRightTag(this, "Control Panel", this.cyanPCIcon(), this.ctrlpnlfn);
        this.runfn = this.runfn.bind(this);
        new StartMenuRightTag(this, "Run", this.cyanPCIcon(), this.runfn);
    }
    blackout(mode) {
        let clas = "standbymsg";
        if (mode === "poweroff")
            clas = "turnoffmsg";
        const turnoffmsg = Util.newDiv(clas);
        if (mode === "poweroff")
            turnoffmsg.innerText = "It is now safe to turn off your computer.";
        else if (mode === "standby")
            turnoffmsg.innerText = "No Signal";
        document.body.innerHTML = "";
        document.body.style.backgroundColor = "black";
        document.body.style.alignItems = "center";
        document.body.style.justifyContent = "center";
        setTimeout(() => {
            document.body.appendChild(turnoffmsg);
        }, 2000);
    }
    turnoffcomputerfn() {
        const nw = new BasicWindow(this.taskbar, 200, 200, 300, 100, "");
        nw.getDiv().style.backgroundColor = "blue";
        const boop = Util.newDiv("standby");
        boop.addEventListener("click", () => {
            nw.close();
            this.blackout("standby");
        });
        const beep = Util.newDiv("turnoff");
        beep.addEventListener("click", () => {
            nw.close();
            this.blackout("poweroff");
        });
        const buup = Util.newDiv("restart");
        buup.addEventListener("click", () => {
            nw.close();
            setTimeout(() => {
                window.location.replace(window.location.toString());
            }, 1000);
        });
        const baap = Util.newDiv("threecont");
        baap.appendChild(boop);
        baap.appendChild(beep);
        baap.appendChild(buup);
        nw.getDiv().appendChild(baap);
    }
    logoutfn() {
        const nw = new BasicWindow(this.taskbar, 200, 200, 300, 100, "");
        nw.getDiv().style.backgroundColor = "blue";
        const logout = Util.newDiv("logout");
        const switchusers = Util.newDiv("switchusers");
        const loggers = Util.newDiv("loggers");
        loggers.appendChild(logout);
        loggers.appendChild(switchusers);
        nw.getDiv().appendChild(loggers);
    }
    populateBottomChild() {
        new StartMenuBottomTag(this, "", null);
        this.logoutfn = this.logoutfn.bind(this);
        new StartMenuBottomTag(this, "Log Out", this.yellowIcon(), this.logoutfn);
        this.turnoffcomputerfn = this.turnoffcomputerfn.bind(this);
        new StartMenuBottomTag(this, "Turn off Computer", this.redIcon(), this.turnoffcomputerfn);
    }
    iefn() {
        const bw = new BasicWindow(this.taskbar, 25, 25, 600, 400, "Internet Explorer");
        const menubar = new Menubar(bw);
        const addrbar = new Addrbar(bw);
        const ifram = new Ifram(bw);
        const iframElem = bw.getDiv().getElementsByClassName("eyeframe")[0];
        iframElem.addEventListener("load", () => {
            const urlbar = bw.getDiv().getElementsByClassName("urlbar")[0];
            urlbar.value = "";
        });
    }
    ieIcon() {
        return Util.newDiv("skyblueicon");
    }
    outlookIcon() {
        return Util.newDiv("smokeicon");
    }
    outlookfn() {
        window.open("https://live.com", "_blank", "noreferrer");
    }
    populateLeftChild() {
        this.iefn = this.iefn.bind(this);
        new StartMenuLeftTag(this, "Internet Explorer", this.ieIcon(), this.iefn);
        new StartMenuLeftTag(this, "Outlook Express", this.outlookIcon(), this.outlookfn);
        new StartMenuLeftTag(this, "");
        new StartMenuLeftTag(this, "All Programs");
    }
    addChildren() {
        this.childTop = document.createElement("div");
        this.childTop.className = "startmenuchildtop";
        this.getDiv().appendChild(this.childTop);
        this.startmenulr = document.createElement("div");
        this.startmenulr.className = "startmenulr";
        this.getDiv().appendChild(this.startmenulr);
        this.childLeft = Util.newDiv("startmenuchildleft");
        this.startmenulr.appendChild(this.childLeft);
        this.childRight = document.createElement("div");
        this.childRight.className = "startmenuchildright";
        this.startmenulr.appendChild(this.childRight);
        this.childBottom = document.createElement("div");
        this.childBottom.className = "startmenuchildbottom";
        this.getDiv().appendChild(this.childBottom);
    }
}
class Task extends Common {
    constructor(taskbar, awindow, title, date) {
        super();
        this.title = title;
        this.date = date;
        this.taskdiv = Util.newDiv("taskdiv");
        this.taskdiv.innerText = this.title;
        taskbar.addTask(this);
        this.taskdiv.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            awindow.minimize();
        });
        this.taskdiv.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const items = {
                Maximize: () => {
                    awindow.maximize();
                },
                Close: () => {
                    awindow.close();
                }
            };
            new ContextMenu(e.clientX, e.clientY, items);
        });
    }
}
class Taskbar extends Common {
    constructor() {
        super();
        this.tasks = new Set();
        this.getDiv().id = "taskbar";
        this.getDiv().addEventListener("contextmenu", (e) => {
            Util.closeAllContextMenus();
            e.preventDefault();
            //e.stopPropagation();
            const items = {
                "Properties": () => { console.log("todo from cxtmenu"); }
            };
            new ContextMenu(e.clientX, e.clientY, items);
        });
        let start = document.createElement("div");
        start.id = "start";
        start.addEventListener("click", (e) => {
            let createAMenu = true;
            if (document.getElementsByClassName("startmenu").length > 0)
                createAMenu = false;
            Util.closeAllContextMenus();
            if (createAMenu)
                this.displayStartMenu();
            e.stopPropagation();
        });
        this.getDiv().appendChild(start);
        document.body.appendChild(this.getDiv());
    }
    addTask(task) {
        this.tasks.add(task);
        this.getDiv().appendChild(task.taskdiv);
    }
    delTask(delme) {
        const trash = delme.taskdiv;
        trash.parentNode.removeChild(trash);
        if (!this.tasks.delete(delme))
            throw new Error("attempted to delete nonexistent task");
    }
    displayStartMenu() {
        new StartMenu(this);
    }
}
class ContextMenu {
    constructor(x, y, items) {
        Util.closeAllContextMenus();
        this.x = x + 1; // prevent highlighting the first item
        this.y = y + 1; // prevent highlighting the first item
        const menu = document.createElement("div");
        menu.className = "contextmenu";
        menu.style.left = this.x + "px";
        menu.style.top = this.y + "px";
        for (const item in items) {
            const menuitem = document.createElement("div");
            menuitem.className = "contextmenuitem";
            menuitem.innerText = item;
            menuitem.addEventListener("click", items[item]);
            menuitem.addEventListener("mouseenter", () => {
                menuitem.style.backgroundColor = "blue";
                menuitem.style.color = "white";
            });
            menuitem.addEventListener("mouseleave", () => {
                menuitem.style.backgroundColor = "";
                menuitem.style.color = "";
            });
            menu.appendChild(menuitem);
        }
        document.body.appendChild(menu);
        this.div = menu;
        this.maybeReposition();
    }
    getX() {
        return this.x;
    }
    setX(x) {
        this.x = x;
        this.div.style.left = this.x + "px";
    }
    getY() {
        return this.y;
    }
    setY(y) {
        this.y = y;
        this.div.style.top = this.y + "px";
    }
    top() {
        return this.y;
    }
    bottom() {
        return this.y + this.div.children.length * 32; // xxx: 32 is arbit est.
    }
    left() {
        return this.x;
    }
    right() {
        return this.x + 160; // see the css file
    }
    maybeReposition() {
        if (this.bottom() > Util.bottomEdge)
            this.setY(this.getY() - this.bottom() + this.top());
        if (this.right() > Util.rightEdge)
            this.setX(this.getX() - this.right() + this.left());
    }
}
class Explorer extends Common {
    constructor() {
        super();
        this.div.className = "explorer";
        document.body.addEventListener("click", (e) => {
            Util.closeAllContextMenus();
            e.preventDefault();
        });
        document.body.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        this.div.addEventListener("contextmenu", (e) => {
            Util.closeAllContextMenus();
            e.preventDefault();
            const items = {
                "Refresh": () => {
                    this.div.style.backgroundImage = "url(\"\")";
                    setTimeout(() => {
                        this.div.style.backgroundImage = "";
                    }, 250);
                },
                "Properties": () => { console.log("todo from cxtmenu"); }
            };
            new ContextMenu(e.clientX, e.clientY, items);
        });
        document.body.appendChild(this.div);
    }
}
class Sidebar extends Common {
    constructor(target) {
        super();
        const sidebardiv = Util.newDiv("sidebardiv");
        target.appendChild(sidebardiv);
    }
}
class WindowTile extends Common {
    constructor(windowcontents, str) {
        super();
        this.getDiv().innerText = str;
        this.getDiv().className = "windowtile";
        windowcontents.getDiv().appendChild(this.getDiv());
    }
}
class WindowContents extends Common {
    constructor(awindow, strings) {
        super();
        const sidebar = new Sidebar(this.getDiv());
        this.getDiv().className = "windowcontents";
        for (const str of strings) {
            const windowtile = new WindowTile(this, str);
        }
        awindow.getDiv().appendChild(this.getDiv());
    }
}
class BasicWindow extends Common {
    constructor(taskbar, x, y, width, height, title = "") {
        super();
        this.maximized = false;
        x = this.calculateX(x, width);
        y = this.calculateY(y, height);
        this.setX(x);
        this.setY(y);
        this.setWidth(width);
        this.setHeight(height);
        this.div.className = "basicwindow";
        document.body.appendChild(this.div);
        this.div.addEventListener("mousedown", () => {
            for (const win of Util.getAllWindows()) {
                win.getDiv().style.zIndex = "";
            }
            this.div.style.zIndex = "1";
        });
        const titlebar = new Titlebar(this, title);
        this.taskbar = taskbar;
        this.task = new Task(this.taskbar, this, title, new Date().getTime());
        Util.addWindow(this);
    }
    // Calculate a proper x coordinate for the window to be created.
    calculateX(x, width) {
        if (width >= Util.rightEdge) // width of window > width of desktop
            return 0;
        if (x < 0)
            x = Util.rand();
        if (x + width + 3 * 2 > Util.rightEdge)
            return Util.rightEdge - width - 3 * 2;
        return x;
    }
    // Calculate a proper y coordinate for the window to be created.
    calculateY(y, height) {
        if (height >= Util.bottomEdge - 32) // taskbar is 32 pixels tall
            return 0;
        if (y < 0)
            y = Util.rand();
        if (y + height + 3 * 2 > Util.bottomEdge - 32)
            return Util.bottomEdge - 32 - height - 3 * 2;
        return y;
    }
    close() {
        Common.prototype.close.call(this);
        this.taskbar.delTask(this.task);
        Util.delWindow(this);
    }
    maximize() {
        if (!this.maximized) {
            this.maximized = true;
            this.restoreX = this.getX();
            this.restoreY = this.getY();
            this.restoreWidth = this.getWidth();
            this.restoreHeight = this.getHeight();
            this.setX(0);
            this.setY(0);
            this.setWidth(Util.rightEdge - 3 * 2); // border width
            this.setHeight(Util.bottomEdge - 32 - 3 * 2); // taskbar height
        }
        else {
            this.setX(this.restoreX);
            this.setY(this.restoreY);
            this.setWidth(this.restoreWidth);
            this.setHeight(this.restoreHeight);
            this.maximized = false;
        }
    }
    minimize() {
        if (this.getDiv().style.display !== "none")
            this.getDiv().style.display = "none";
        else
            this.getDiv().style.display = "";
    }
}
class aWindow extends BasicWindow {
    constructor(taskbar, x, y, width, height, title = "", wintiles) {
        super(taskbar, x, y, width, height, title);
        this.div.className = "awindow";
        const menubar = new Menubar(this);
        const addrbar = new Addrbar(this);
        const windowcontents = new WindowContents(this, wintiles);
    }
}
class MenubarItem extends Common {
    constructor(parent, name, items) {
        super();
        this.getDiv().className = "menubaritem";
        this.getDiv().innerText = name;
        this.getDiv().addEventListener("click", (e) => {
            //Util.closeAllContextMenus();
            const bounding = parent.getDiv().getBoundingClientRect();
            new ContextMenu(bounding.left, bounding.top + 24, items); // 24px
            e.stopPropagation();
        });
        parent.getDiv().appendChild(this.getDiv());
    }
}
class Menubar extends Common {
    constructor(parent) {
        super();
        //this.div = document.createElement("div");
        this.getDiv().className = "menubar";
        const file = new MenubarItem(this, "File", {
            "Exit": () => {
                parent.close();
            }
        });
        const edit = new MenubarItem(this, "Edit", {
            "Cut": () => { console.log("unimplemented"); },
            "Copy": () => { console.log("unimplemented"); },
            "Paste": () => { console.log("unimplemented"); }
        });
        parent.getDiv().appendChild(this.getDiv());
    }
}
class RoundButton extends Common {
    constructor(parent, clas, text = null) {
        super();
        //const adiv = Util.newDiv(clas);
        this.getDiv().className = clas;
        if (text)
            this.getDiv().innerText = text;
        parent.getDiv().appendChild(this.getDiv());
    }
}
class UrlBar extends Common {
    constructor(parent) {
        super();
        const ainput = document.createElement("input");
        ainput.className = "urlbar";
        parent.getDiv().appendChild(ainput);
    }
}
class Ifram extends Common {
    constructor(parent) {
        super();
        const ifram = document.createElement("iframe");
        ifram.className = "eyeframe";
        ifram.allowFullscreen = false;
        ifram.name = "_blank";
        ifram.referrerPolicy = "no-referrer";
        ifram.sandbox.add("allow-scripts");
        ifram.sandbox.add("allow-forms");
        ifram.src = "https://en.wikipedia.org";
        parent.getDiv().appendChild(ifram);
    }
}
class Addrbar extends Common {
    constructor(parent) {
        super();
        this.lsites = new Array();
        this.rsites = new Array();
        this.getDiv().className = "addrbar";
        const left = new RoundButton(this, "leftbutton", "<-");
        left.getDiv().addEventListener("click", (e) => {
            const ifram = this.getIfram(parent);
            if (this.lsites.length < 1 || !ifram)
                return;
            const site = this.lsites.pop();
            this.rsites.push(ifram.src); // place current site in the (->)
            ifram.src = site;
        });
        const right = new RoundButton(this, "rightbutton", "->");
        right.getDiv().addEventListener("click", (e) => {
            const ifram = this.getIfram(parent);
            if (this.rsites.length < 1 || !ifram)
                return;
            const site = this.rsites.pop();
            this.lsites.push(ifram.src);
            ifram.src = site;
        });
        const urlbar = new UrlBar(this);
        const go = new RoundButton(this, "gobutton", "Go");
        go.getDiv().addEventListener("click", (e) => {
            this.navigate(parent);
        });
        const urlbardiv = this.getDiv().getElementsByClassName("urlbar")[0];
        urlbardiv.addEventListener("keyup", (e) => {
            if (e.key !== "Enter")
                return;
            this.navigate(parent);
        });
        parent.getDiv().appendChild(this.getDiv());
    }
    getIfram(parent) {
        const huntForIfram = parent.getDiv().getElementsByClassName("eyeframe");
        if (huntForIfram.length < 1)
            return null;
        const ifram = huntForIfram[0];
        return ifram;
    }
    navigate(parent) {
        const ifram = this.getIfram(parent);
        if (!ifram)
            return;
        const theinput = document.getElementsByTagName("input")[0];
        if (theinput.value.indexOf("https://") != 0 &&
            theinput.value.indexOf("http://") != 0)
            theinput.value = "https://" + theinput.value;
        this.lsites.push(ifram.src); // save current site to (<-)
        while (this.rsites.length > 0)
            this.rsites.pop(); // navigation resets (->)
        ifram.src = theinput.value;
    }
}
class Titlebar extends Common {
    constructor(parent, title) {
        super();
        this.getDiv().innerText = title;
        this.oldX = this.oldY = -1;
        this.parent = parent;
        this.getDiv().className = "titlebar";
        this.mousemoveHndlr = this.mousemoveHndlr.bind(this);
        this.getDiv().addEventListener("mousedown", (e) => {
            this.getDiv().addEventListener("mousemove", this.mousemoveHndlr);
        });
        this.getDiv().addEventListener("mouseup", (e) => {
            this.oldX = this.oldY = -1;
            this.getDiv().removeEventListener("mousemove", this.mousemoveHndlr);
        });
        Util.mInterested.push(this.getDiv());
        this.createButtons();
        this.parent.getDiv().appendChild(this.getDiv());
    }
    mousemoveHndlr(e) {
        if (e.isTrusted) // not synthetic
            return;
        let deltaX = 0;
        let deltaY = 0;
        if (this.oldX !== -1 && this.oldY !== -1) {
            deltaX = e.clientX - this.oldX;
            deltaY = e.clientY - this.oldY;
        }
        this.oldX = e.clientX;
        this.oldY = e.clientY;
        // move everything deltaX/Y
        const parentDiv = this.getDiv().parentNode;
        const parentBCR = parentDiv.getBoundingClientRect();
        this.parent.setX(parentBCR.x + deltaX);
        this.parent.setY(parentBCR.y + deltaY);
    }
    createButtonClose() {
        let close = document.createElement("div");
        close.innerText = "X";
        close.className = "closebutton";
        close.addEventListener("click", (e) => {
            this.parent.close();
        });
        this.getDiv().appendChild(close);
    }
    createButtonMaximize() {
        let maximize = document.createElement("div");
        maximize.innerText = "O";
        maximize.className = "maximizebutton";
        maximize.addEventListener("click", (e) => {
            this.parent.maximize();
        });
        this.getDiv().appendChild(maximize);
    }
    createButtonMinimize() {
        const minimize = Util.newDiv("minimizebutton");
        minimize.innerText = "-";
        minimize.addEventListener("click", () => {
            this.parent.minimize();
        });
        this.getDiv().appendChild(minimize);
    }
    createButtons() {
        const spacer = document.createElement("div");
        spacer.className = "titlebarspacer";
        this.getDiv().appendChild(spacer);
        this.createButtonMinimize();
        this.createButtonMaximize();
        this.createButtonClose();
    }
}
class bootOS {
    constructor() {
        this.prepJSWindow();
        setTimeout(() => {
            new Taskbar();
        }, 0); // set to higher value for boot loading effect
        new Explorer();
    }
    prepJSWindow() {
        window.addEventListener("mousemove", (e) => {
            for (const div of Util.mInterested) {
                const mouseEvent = new MouseEvent("mousemove", {
                    clientX: e.clientX,
                    clientY: e.clientY
                });
                div.dispatchEvent(mouseEvent);
            }
        });
        window.addEventListener("mouseup", (e) => {
            for (const div of Util.mInterested) {
                const mouseEvent = new MouseEvent("mouseup", {
                // empty object
                });
                div.dispatchEvent(mouseEvent);
            }
        });
        window.addEventListener("resize", (e) => {
            Util.closeAllContextMenus();
            Util.bottomEdge = window.innerHeight;
            Util.rightEdge = window.innerWidth;
            for (const win of Util.getAllWindows()) {
                if (!win.maximized) { // if offscreen, move onscreen
                    if (win.getX() + win.getWidth() > Util.rightEdge)
                        win.setX(0);
                    if (win.getY() + win.getHeight() > Util.bottomEdge)
                        win.setY(0);
                }
                else { // if maximized, resize to fit new desktop resolution
                    win.setWidth(Util.rightEdge - 3 * 2); // border width
                    win.setHeight(Util.bottomEdge - 32 - 3 * 2); // taskbar height
                }
            }
        });
    }
}
class Util {
    constructor() {
        throw new Error("attempted to construct a Util");
    }
    static closeAllContextMenus() {
        const classnames = ["contextmenu", "startmenu"];
        for (const c of classnames) {
            const menus = document.getElementsByClassName(c);
            for (let i = 0; i < menus.length; i++)
                menus[i].parentNode.removeChild(menus[i--]);
        }
    }
    static rand() {
        return Math.random() * Math.max(Util.rightEdge, Util.bottomEdge);
    }
    static newDiv(classname) {
        const ret = document.createElement("div");
        ret.className = classname;
        return ret;
    }
    static getAllWindows() {
        return Util.windows;
    }
    static addWindow(awin) {
        Util.windows.add(awin);
    }
    static delWindow(awin) {
        const rv = Util.windows.delete(awin);
        if (!rv)
            throw new Error("could not remove window from Util.windows");
    }
}
Util.mInterested = new Array();
Util.bottomEdge = window.innerHeight;
Util.topEdge = 0;
Util.leftEdge = 0;
Util.rightEdge = window.innerWidth;
Util.windows = new Set(); // list of all open windows
(() => {
    new bootOS();
})();
