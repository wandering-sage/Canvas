var canvas = document.querySelector(".draw");
var c = canvas.getContext("2d");
var size = document.querySelector(".slider");
var color = document.querySelector(".colorChange");
var isDrawing = false;
var lwidth = 10; // for current lineWidth
var bColor = "#000"; // for StrokeColor

canvas.width = window.innerWidth - 195;
canvas.height = window.innerHeight - 30;

size.oninput = () => (lwidth = size.value);
color.oninput = () => (bColor = color.value);

canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mouseout", mouseUp);

canvas.addEventListener("mousemove", brushDraw);

c.lineJoin = "round";
c.lineCap = "round";

function brushDraw(e) {
	if (!isDrawing) return;
	c.strokeStyle = bColor;
	c.beginPath();
	c.moveTo(lastX, lastY);
	c.lineTo(e.offsetX, e.offsetY);
	c.stroke();
	lastX = e.offsetX;
	lastY = e.offsetY;
	if (c.lineWidth < lwidth) c.lineWidth += lwidth / 20;
}

function mouseDown(e) {
	if (e.button != 0) return;
	isDrawing = true;
	lastX = e.offsetX;
	lastY = e.offsetY;
}

function mouseUp() {
	isDrawing = false;
	c.lineWidth = lwidth / 4;
}
