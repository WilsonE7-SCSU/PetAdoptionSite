const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

// User data in JSON format goes here (I'm following the format I used in CSC235)
let userData = {
	"users":[
	    {"fname": "John", "lname": "Sample", "type":"petOwner", "username": "testUser1000101", "password": "P455w0rd"}
	]
};

// Pet data in JSON format stored in pets.json on server

// Server functions:
    // Create Server and callback function
const myServer = http.createServer(function(req, res) {
	// Parse URL and print to console (for debugging)
	let urlObj = url.parse(req.url, true);
	console.log(urlObj);

	// Check pathname
	switch(urlObj.pathname){
		/*
		We want at least 4 pages for now:
		1. Login screen (default, "/login", "/")
		2. Page to show a selection of pets to pet owners ("/pets")
		3. A profile page that can dynamically change depending
		   on which pet was chosen ("/profiles?name=<name>")
		4. A request form that can be submitted to the server
		(Also, if anyone wants to edit this to include error checking,
		I would be very grateful! I got points off for that on previous assignments...)
		*/
		case "/pets":
			sendFile("/pets.html", res);
			break;
		case "/profiles":
			getPetProfile(urlObj.query, res);
			break;
		case "/login":
			sendFile("/login.html", res);
			break;
		case "/signup":
			sendFile("/signup.html", res);
			break;
		case "/":
			sendFile("/login.html", res);
		default:
			sendFile("/login.html", res);
			// Should probably be something else instead to handle errors
	}
});

// TODO: Creates and sends a pet's profile
function getPetProfile(qObj, res){
}

// Respond to requests
function respond(res, status, message){
	res.writeHead(status, {'content-type':'text/plain'});
	res.write(message);
	res.end();
}

// Send static files
function sendFile(fPath, res){
	let fname = "./public-html" + fPath;
	fs.readFile(fname, function(err, data) {
		if (err)
			respond(res, 404, "File not found");
		else {
			let ext = getContentType(fPath, res);
			if (ext) {
				res.writeHead(200, {'content-type': ext});
				res.writeHead(data);
				res.end();
			}
		}
	});
}

// Returns content type for HTTP header in sendFile
function getContentType(pathname, res) {
	switch (path.extname(pathname)) {
		case ".html":
			return "text/html";
			break;
		case ".css":
			return "text/css";
			break;
		case ".js":
			return "text/javascript";
			break;
		case ".json":
			return "application/json";
			break;
		default:
			respond(res, 400, "Unsupported file type");
	}
}

// Start server
myServer.listen(80, function(){console.log("Listening on port 80");});
