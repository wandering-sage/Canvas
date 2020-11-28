// to implement queue in flood fill algo
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
var canvas = document.querySelector(".draw"); //selects canvas element
var c = canvas.getContext("2d");
var tools = document.querySelectorAll(".tool"); //contains array of tools
var userCursor = document.querySelector(".userCursor"); //selects the cursor div
var size = document.querySelector(".slider"); //selects slider input element
var color = document.querySelector(".colorChange"); //selects color input element
var isDrawing = false;
var currentTool = document.querySelector(".active"); //selects curently active tool element
var loader = document.querySelector(".loader");
var lwidth = 10; // for current lineWidth
var userColor = color.value; // for StrokeColor

// initlizing a white Canvas
canvas.width = window.innerWidth - 195;
canvas.height = window.innerHeight - 30;
c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

// on brush-size change
size.oninput = () => {
	lwidth = size.value;

	// to update cursor size on user input (size is one more than the stroke size)
	let bsize = +size.value + 1;
	userCursor.style.width = bsize + "px";
	userCursor.style.height = bsize + "px";
};
// on brush color change
color.oninput = () => {
	userColor = color.value;
	// to change cursor color
	userCursor.style.borderColor = userColor;
};

//click event listener on tools array
tools.forEach((e) => e.addEventListener("click", toolClicked));

canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mouseout", hideCursorAndStopDrawing);
canvas.addEventListener("mouseenter", showCursor);

canvas.addEventListener("mousemove", trackCursorAndDraw);

// ********************Functions*************************
// ******************************************************

function toolClicked(e) {
	let tool = e.target;
	let name = tool.getAttribute("data-name");
	switch (name) {
		case "save":
			saveCanvas();
			break;
		case "reset":
			resetCanvas();
			break;
		case "brush":
		case "bucket":
		case "eraser":
			switchTool();
			break;
	}

	// **************************Functions*********************

	function saveCanvas() {
		if (confirm("Do you want to save this Canvas as png?")) {
			if (window.navigator.msSaveBlob) {
				// IE/Edge support
				window.navigator.msSaveBlob(
					canvas.msToBlob(),
					"canvas-image.png"
				);
			} else {
				const a = document.createElement("a");

				document.body.appendChild(a);
				a.href = canvas.toDataURL();
				a.download = "canvas-image.png";
				a.click();
				document.removeChild(a);
			}
		}
	}

	function resetCanvas() {
		if (confirm("Are you sure you want to reset this Canvas?")) {
			c.fillStyle = "white";
			c.fillRect(0, 0, canvas.width, canvas.height);
		}
	}

	function switchTool() {
		currentTool.classList.remove("active");
		userCursor.classList.remove(
			`${currentTool.getAttribute("data-name")}Cursor`
		);
		userCursor.classList.add(`${name}Cursor`);
		tool.classList.add("active");
		userCursor.style.borderColor = userColor;
		currentTool = tool;
	}
}

function mouseDown(e) {
	if (currentTool.getAttribute("data-name") == "bucket") {
		bucketTool(e);
	} else {
		isDrawing = true;
		// to move the start of line to current mouse position
		lastX = e.offsetX;
		lastY = e.offsetY;
	}
}

function mouseUp() {
	isDrawing = false;
}

function hideCursorAndStopDrawing() {
	isDrawing = false;
	userCursor.classList.toggle("hidden");
}

function showCursor() {
	userCursor.classList.toggle("hidden");
}

function trackCursorAndDraw(e) {
	// to change cursor position with mouse-move and only starts drawing when mouse clicked
	userCursor.style.left = e.pageX + "px";
	userCursor.style.top = e.pageY + "px";

	if (!isDrawing) return;

	// Only executes if mouse is pressed while moving the mouse
	c.lineJoin = "round";
	c.lineCap = "round";

	// use white color to paint if eraser is selected
	let strokeColor = userColor;
	if (currentTool.getAttribute("data-name") == "eraser")
		strokeColor = "white";

	c.strokeStyle = strokeColor;
	c.lineWidth = lwidth;

	//start drawing line
	c.beginPath();
	c.moveTo(lastX, lastY);
	c.lineTo(e.offsetX, e.offsetY);
	c.stroke();
	lastX = e.offsetX;
	lastY = e.offsetY;
}

function bucketTool(e) {
	var pixelData = c.getImageData(0, 0, canvas.width, canvas.height);

	// to get currrent pixel's position
	let x = e.offsetX;
	let y = e.offsetY;
	const pos = (y * pixelData.width + x) * 4;

	// converting hex to rgb i.e. from #ffd700 to (255,215,0)
	let r = "0x" + userColor[1] + userColor[2];
	let g = "0x" + userColor[3] + userColor[4];
	let b = "0x" + userColor[5] + userColor[6];

	let replacementColor = [r, g, b];

	let clickedPixelColor = [
		pixelData.data[pos],
		pixelData.data[pos + 1],
		pixelData.data[pos + 2],
	];

	// to set loading gif's location at current mous position
	loader.style.top = e.pageY + "px";
	loader.style.left = e.pageX + "px";

	// to start loading Gif
	toggleLoading();

	// to make the loading Gif Work
	setTimeout(fillColor, 1);

	// **************Functions*************************

	function fillColor() {
		c.putImageData(floodFill(pos), 0, 0);
		// to end loading Gif
		toggleLoading();
	}
	function toggleLoading() {
		loader.classList.toggle("hidden");
	}

	function floodFill(i) {
		if (checkSameColor(clickedPixelColor, replacementColor))
			return pixelData;

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
		return pixelData;

		// **************Functions*************************

		function checkSameColor(a, b) {
			return a.reduce((acc, crr, i) => acc && crr == b[i], true);
		}

		function setPixelColor(pixel, color) {
			for (let i = 0; i < 3; i++) {
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
			// allows a variation of +- 4 in colors
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
