class Queue {
	constructor() {
		this.items = [];
	}
	enqueue(element) {
		this.items.push(element);
	}
	dequeue() {
		return this.items.shift();
	}
	isEmpty() {
		return this.items.length == 0;
	}
}
var canvas = document.querySelector(".draw");
var c = canvas.getContext("2d");
var size = document.querySelector(".slider");
var color = document.querySelector(".colorChange");
var isDrawing = false;
var lwidth = 10; // for current lineWidth
var userColor = "#00000ff"; // for StrokeColor

// initlizing a white Canvas
canvas.width = window.innerWidth - 195;
canvas.height = window.innerHeight - 30;
c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

// on color/brushsize change
size.oninput = () => (lwidth = size.value);
color.oninput = () => (userColor = color.value);

canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mouseout", mouseUp);

canvas.addEventListener("mousemove", brushDraw);

// ********************Functions*************************
// ******************************************************

function brushDraw(e) {
	if (!isDrawing) return;
	c.lineJoin = "round";
	c.lineCap = "round";
	c.strokeStyle = userColor;
	c.lineWidth = lwidth;
	c.beginPath();
	c.moveTo(lastX, lastY);
	c.lineTo(e.offsetX, e.offsetY);
	c.stroke();
	lastX = e.offsetX;
	lastY = e.offsetY;
}

function mouseDown(e) {
	if (e.button == 0) {
		if (!e.shiftKey) {
			isDrawing = true;
			lastX = e.offsetX;
			lastY = e.offsetY;
			return;
		}
		bucketTool(e);
	}
}

function mouseUp() {
	isDrawing = false;
	c.lineWidth = lwidth / 4;
}

function bucketTool(e) {
	var pixelData = c.getImageData(0, 0, canvas.width, canvas.height);
	let x = e.offsetX;
	let y = e.offsetY;
	const pos = (y * pixelData.width + x) * 4;
	// from #ffd700 to (255,215,0)
	let r = "0x" + userColor[1] + userColor[2];
	let g = "0x" + userColor[3] + userColor[4];
	let b = "0x" + userColor[5] + userColor[6];
	let replacementColor = [r, g, b, 255];
	let clickedPixelColor = [
		pixelData.data[pos],
		pixelData.data[pos + 1],
		pixelData.data[pos + 2],
		pixelData.data[pos + 3],
	];
	floodFill(pos);
	c.putImageData(pixelData, 0, 0);

	// **************Functions*************************

	function floodFill(i) {
		if (checkSameColor(clickedPixelColor, replacementColor)) return;
		setPixelColor(i, replacementColor);
		var q = new Queue();
		q.enqueue(i);
		while (!q.isEmpty()) {
			let currentPixel = q.dequeue();
			let up = pixelUp(currentPixel);
			let down = pixelDown(currentPixel);
			let left = pixelLeft(currentPixel);
			let right = pixelRight(currentPixel);
			if (checkPixelColor(up)) {
				setPixelColor(up, replacementColor);
				q.enqueue(up);
			}
			if (checkPixelColor(down)) {
				setPixelColor(down, replacementColor);
				q.enqueue(down);
			}
			if (checkPixelColor(left)) {
				setPixelColor(left, replacementColor);
				// checks if this pixel is at border
				if (left % (pixelData.width * 4) != 0) q.enqueue(left);
			}
			if (checkPixelColor(right)) {
				setPixelColor(right, replacementColor);
				// checks if this pixel is at border
				if (
					(right - (pixelData.width - 1) * 4) %
						(pixelData.width * 4) !=
					0
				)
					q.enqueue(right);
			}
		}

		// **************Functions*************************

		function checkSameColor(a, b) {
			return a.reduce((acc, crr, i) => acc && crr == b[i], true);
		}
		function setPixelColor(pixel, color) {
			for (let i = 0; i < 4; i++) {
				pixelData.data[pixel + i] = color[i];
			}
		}
		function pixelDown(p) {
			return p + pixelData.width * 4;
		}
		function pixelUp(p) {
			return p - pixelData.width * 4;
		}
		function pixelLeft(p) {
			return p - 4;
		}
		function pixelRight(p) {
			return p + 4;
		}
		function checkPixelColor(a) {
			if (
				pixelData.data[a] < clickedPixelColor[0] + 4 &&
				pixelData.data[a] > clickedPixelColor[0] - 4 &&
				pixelData.data[a + 1] < clickedPixelColor[1] + 4 &&
				pixelData.data[a + 1] > clickedPixelColor[1] - 4 &&
				pixelData.data[a + 2] < clickedPixelColor[2] + 4 &&
				pixelData.data[a + 2] > clickedPixelColor[2] - 4
			)
				return true;
			return false;
		}
	}
}
