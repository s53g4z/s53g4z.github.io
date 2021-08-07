// 
var Taskbar = /** @class */ (function () {
    function Taskbar() {
        var taskbar = document.createElement("div");
        taskbar.id = "taskbar";
        var start = document.createElement("div");
        start.id = "start";
        taskbar.appendChild(start);
        document.body.appendChild(taskbar);
    }
    return Taskbar;
}());
var WINXP = /** @class */ (function () {
    function WINXP() {
        new Taskbar();
        //constructDesktopBackground();
        //constructExplorer();
    }
    return WINXP;
}());
var Util = /** @class */ (function () {
    function Util() {
        throw new Error("attempted to construct a Util");
    }
    Util.bottomEdge = window.innerHeight;
    Util.topEdge = 0;
    Util.leftEdge = 0;
    Util.rightEdge = window.innerWidth;
    return Util;
}());
(function () {
    new WINXP();
})();
