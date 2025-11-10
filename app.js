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
		case "/login.html":
			sendFile("/login.html", res);
			break;
//Amir's Code
                case "/dologin":
                        // only allow POST requests
		    if(req.method !== "POST"){
		        res.writeHead(405, {'content-type':'application/json'}); // 405 = method not allowed
		        res.end(JSON.stringify({status:"fail", message:"POST required"}));
			return;
		    } else {
		        handleLogin(req,res);
		    }
		    break;
//Clarification below:
//"/dologin" handles POST login requests separately from other pages
//It won’t interfere with /login, /pets, or /profiles because each case
//checks urlObj.pathname individually. So its safe to add
//Amir's Code ends
		case "/Sign-up.html":
			sendFile("/Sign-up.html", res);
			break;
		case "/submit-adoption":
			handleAdoptionRequest(urlObj.query, res);
			break;
		case "/":
			sendFile("/Homepage.html", res);
			break;
		default:
			sendFile("/Homepage.html", res);
			break;
			// Should probably be something else instead to handle errors
	}
});

// TODO: Creates and sends a pet's profile
function getPetProfile(qObj, res){
	let petName = qObj.name || "Unknown Pet";

	let html = `
	<html>
	<head><title>${petName}'s Profile</title></head>
	<body>
		<h1>${petName}'s Profile</h1>
		<p>Pet details would go here...</p>

		<!-- Adoption Form -->
		<h3>Adoption Request Form</h3>
		<form action="/submit-adoption" method="GET">
			<input type="hidden" name="pet" value="${petName}">
			Your Name: <input type="text" name="fullname"><br>
			Email: <input type="text" name="email"><br>
			Phone: <input type="text" name="phone"><br>
			Message: <textarea name="message"></textarea><br>
			<input type="submit" value="Submit Adoption Request">
		</form>

		<br>
		<a href="/pets">Back to Pets</a>
	</body>
	</html>
	`;

	res.writeHead(200, {'content-type': 'text/html'});
	res.write(html);
	res.end();
}

//handles adotption form submissions
function handleAdoptionRequest(qObj, res){
	let petName = qObj.pet || "unknown pet"
	let userName = qObj.fullname || "unknown user"

// log request
console.log("ADOPTION REQUEST for " + petName + " from " + userName);

let html = `
<html>
<body>
	<h2>Adoption Request Submitted!</h2>
	<p>Your request for ${petName} has been sent to the shelter.</p>
	<a href="/pets">Back to Pets</a>
</body>
</html>
`;

res.writeHead(200, {'content-type': 'text/html'});
res.write(html);
res.end();

}

//Amir's Login Function code
function handleLogin(req, res){
    let body="";

    req.on("data", function(chunk){
        body += chunk;
    });

    req.on("end", function(){
        let data = new URLSearchParams(body);
        let username = data.get("username");
        let password = data.get("password");

// simple error checking: username and password must exist
	if(!username || !password){
	    res.writeHead(400, {'content-type':'application/json'});
	    res.end(JSON.stringify({status:"fail", message:"username and password required"}));
	    return;
	}

        let found = userData.users.find(u => u.username === username && u.password === password);
        if(found){
            res.writeHead(200, {'content-type':'application/json'});
            res.end(JSON.stringify({status:"ok"}));
        } else {
            res.writeHead(200, {'content-type':'application/json'});
            res.end(JSON.stringify({status:"fail"}));
        }
    });
}
//Amir's Login Function ends

// Respond to requests
function respond(res, status, message){
	res.writeHead(status, {'content-type':'text/plain'});
	res.write(message);
	res.end();
}

// Send static files
//Amir: (FIXED) Issue with the line || let fname = "./public-html" + fPath; ||NEEDS TO CHANGE TO|| let fname = "./public_html" + fPath; ||BECAUSE|| the file directory uses an underscore 
function sendFile(fPath, res){
	let fname = "./public_html" + fPath;
	fs.readFile(fname, function(err, data) {
		if (err){
			respond(res, 404, "File not found");
			return;
		}
//Amir: Here you need to add return so the execution stops and headers are only sent once
		else {
			let ext = getContentType(fPath, res);
			if (ext) {
				res.writeHead(200, {'content-type': ext});
				res.write(data);
//Amir: (FIXED) The line above sending the file content should just be res.write(data) the initial res.writeHead sets the HTTP headers already
				res.end();
				return;
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
		// unknown file type error check
    		    console.log("Unsupported file type requested:", path.extname(pathname));
		    respond(res, 400, "Unsupported file type");
    		    return null;

	}
}

// Start server
myServer.listen(80, function(){console.log("Listening on port 80");});
