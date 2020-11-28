var http = require("http");
var fs = require("fs");
var path = require("path");

var server = http.createServer((req, res) => {
	if (req.url == "/") {
		res.writeHead(200, { "Content-Type": "text/html" });
		var myPath = path.join(__dirname, "src/index.html");
		var myReadStream = fs.createReadStream(myPath, "utf8");
		myReadStream.pipe(res);
	} else if (req.url.match(".css$")) {
		sendAptFile(req, res, "text/css", "utf8");
	} else if (req.url.match(".js$")) {
		sendAptFile(req, res, "text/javascript", "utf8");
	} else if (req.url.match(".ico$")) {
		sendAptFile(req, res, "image/ico");
	} else if (req.url.match(".gif$")) {
		sendAptFile(req, res, "image/gif");
	}
});

server.listen(3000, "127.0.0.1");
console.log("Running At: http://127.0.0.1:3000/");

// *************************Functions***************************

function sendAptFile(req, res, ct, encd) {
	res.writeHead(200, { "Content-Type": ct });
	var myPath = path.join(__dirname, "src", req.url);
	var fileStream = fs.createReadStream(myPath, encd);
	fileStream.pipe(res);
}
