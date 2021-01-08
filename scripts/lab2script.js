//

function Node(payload, children_arr) {
	if (!children_arr)
		this.children = new Array();
	else
		this.children = children_arr;
	this.payload = payload;
}

Node.prototype.addChild = function(child) {
	this.children.push(child);
}

function createExampleTree1() {
	let I = new Node("B");
	let H = new Node("B");
	let G = new Node("B", [H, I]);
	let F = new Node("B");
	let E = new Node("E");
	let D = new Node("D");
	let C = new Node("C", [F, G]);
	let B = new Node("B", [D, E]);
	let A = new Node("A", [B, C]);
	return A;
}

function createExampleTree2() {
	let I = new Node("I");
	let H = new Node("H");
	let G = new Node("G");
	let F = new Node("F");
	let E = new Node("E");
	let D = new Node("D");
	let C = new Node("C", [F]);
	let B = new Node("B", [D, E]);
	let A = new Node("A", [B, C]);
	return A;
}

function createExampleTree3() {
	let I = new Node("I");
	let H = new Node("H");
	let G = new Node("G");
	let F = new Node("B");
	let E = new Node("B");
	let D = new Node("B");
	let C = new Node("C", [F]);
	let B = new Node("X", [D, E]);
	let A = new Node("A", [B, C]);
	return A;
}

function createExampleTree4() {
	let D = new Node("B");
	let C = new Node("Y", [D]);
	let B = new Node("X", [C]);
	let E = new Node("F", [B]);
	let A = new Node("W", [E]);
	return A;
}

function printBinTreeSideways(node, spaces) {
	if (!node)
		return;
	if (!spaces)
		spaces = "";
	let children = node.children;
	if (children.length > 2)
		throw new Error("fn only works on binary trees");
	let left = children[0];
	let right = children[1];
	
	printBinTreeSideways(right, spaces + "     ");
	console.log(spaces + node.payload);
	printBinTreeSideways(left, spaces + "     ");
}

function printBinTree(node) {
	if (!node)
		return;
	if (node.children.length > 2)
		throw new Error("fn only works on binary trees");
	
	printBinTree(node.children[0]);
	printBinTree(node.children[1]);
	console.log(node.payload);
}

let keep = ["B", "F"];

function mangle(node, path) {  // path is an array of nodes
	if (!node)
		return;
	if (!path)
		path = new Array();
	
	let ret = false;
	for (let i = 0; i < keep.length; i++) {  // keep the present node?
		let keeper = keep[i];
		if (node.payload == keeper) {
			keep.splice(i, 1);
			for (ancestor of path) {
				keep.push(ancestor.payload);
			}
			ret = true;
			break;
		}
	}
	
	path.push(node);
	
	let dontDelete = false;  // either keep or discard all children
	for (let i = 0; i < node.children.length; i++) {
		let child = node.children[i];
		let keepChild = mangle(child, [...path]);
		if (keepChild || dontDelete) {
			ret = true;
			dontDelete = true;
		}
	}
	if (!dontDelete)  // destroy all children?
		node.children.splice(0, node.children.length);

	return ret;
}

function main() {
	let node2 = createExampleTree4();
	let node = new Node("1", [node2]);
	mangle(node);
	printBinTreeSideways(node.children[0]);
}

(function() {
	main();
})();
