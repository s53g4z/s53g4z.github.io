// 



class Taskbar {
	constructor() {
		
	}
}

class WINXP {
	constructor() {
		new Taskbar();
		constructDesktopBackground();
		constructExplorer();
	}
}

class Util {
	
	constructor() {
		throw new Error("attempted to construct a Util");
	}
}

(() => {
	new WINXP();
})();
