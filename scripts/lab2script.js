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
        new aWindow(this.taskbar, Util.rand() % Util.rightEdge, Util.rand() % Util.bottomEdge, 400, 300, "My Computer", ["C:\\", "D:\\"]);
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
    mydocfn() {
        const aw = new aWindow(this.taskbar, 25, 25, 400, 400, "My Documents", ["My Pictures", "My Videos", "new folder", "new folder 1"]);
    }
    mypicfn() {
        const aw = new aWindow(this.taskbar, 25, 25, 400, 400, "My Pictures", ["image1.jpg", "image2.bmp", "flowers.jpeg", "cone.gif"]);
    }
    ctrlpanelfn() {
        const aw = new aWindow(this.taskbar, 25, 25, 400, 400, "Control Panel", ["Accessibility", "Add/Remove Programs", "Game Controllers", "System"]);
    }
    populateRightChild() {
        this.mydocfn = this.mydocfn.bind(this);
        new StartMenuRightTag(this, "My Documents", this.yellowIcon(), this.mydocfn);
        this.mypicfn = this.mypicfn.bind(this);
        new StartMenuRightTag(this, "My Pictures", this.yellowIcon(), this.mypicfn);
        this.myPCfn = this.myPCfn.bind(this);
        new StartMenuRightTag(this, "My Computer", this.cyanPCIcon(), this.myPCfn);
        this.ctrlpanelfn = this.ctrlpanelfn.bind(this);
        new StartMenuRightTag(this, "Control Panel", this.cyanPCIcon(), this.ctrlpanelfn);
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
        this.taskdiv = document.createElement("div");
        this.taskdiv.className = "taskdiv";
        this.taskdiv.innerText = this.title;
        taskbar.addTask(this);
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
        this.setX(x);
        this.setY(y);
        this.setWidth(width);
        this.setHeight(height);
        this.div.className = "basicwindow";
        document.body.appendChild(this.div);
        const titlebar = new Titlebar(this, title);
        this.taskbar = taskbar;
        this.task = new Task(this.taskbar, this, title, new Date().getTime());
    }
    close() {
        Common.prototype.close.call(this);
        this.taskbar.delTask(this.task);
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
        ifram.src = "https://en.wikipedia.org";
        parent.getDiv().appendChild(ifram);
    }
}
class Addrbar extends Common {
    constructor(parent) {
        super();
        this.getDiv().className = "addrbar";
        const left = new RoundButton(this, "leftbutton", "<-");
        const right = new RoundButton(this, "rightbutton", "->");
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
    navigate(parent) {
        const huntForIfram = parent.getDiv().getElementsByClassName("eyeframe");
        if (huntForIfram.length < 1)
            return;
        const ifram = huntForIfram[0];
        const theinput = document.getElementsByTagName("input")[0];
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
    createButtons() {
        const spacer = document.createElement("div");
        spacer.className = "titlebarspacer";
        this.getDiv().appendChild(spacer);
        this.createButtonMaximize();
        this.createButtonClose();
        //let minimize = document.createElement("div");
        //minimize.innerText = "_";
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
            console.log(e);
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
        return Math.random() * Util.rightEdge;
    }
    static newDiv(classname) {
        const ret = document.createElement("div");
        ret.className = classname;
        return ret;
    }
}
Util.mInterested = new Array();
Util.bottomEdge = window.innerHeight;
Util.topEdge = 0;
Util.leftEdge = 0;
Util.rightEdge = window.innerWidth;
(() => {
    new bootOS();
})();
