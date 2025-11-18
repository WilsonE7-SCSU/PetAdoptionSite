const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
//Amir: SQL connection
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '35.229.109.115',
    user: 'nodeuser330',
    password: '<m|L{03zF3o9|vCY',
    database: 'pet_db',
    port: 3306
});
//ends

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
		case "/signup":
    		    if (req.method === "POST") {
        		handleSignup(req, res);
    		    } else {
        		res.writeHead(405);
			res.end("Method Not Allowed");
    		    }
    		    break;
		case "/Sign-up.html":
			sendFile("/Sign-up.html", res);
			break;
		case "/submit-adoption":
			handleAdoptionRequest(urlObj.query, res);
			break;
		case "/create-profile":
			sendFile("/create-profile.html", res);
			break;
		case "/submit-profile":
			handleProfileCreation(req, res);
			break;
		case "/":
			sendFile("/login.html", res);
			break;
//Amir: request feature cases
		case "/api/sendAdoptionRequest":
			handleSendAdoptionRequest(req, res);
			break;
		case "/api/getInbox":
			handleGetInbox(req, res, urlObj.query);
			break;
		case "/api/sendReply":
			handleSendReply(req, res);
			break;
		case "/Inbox.html":
			sendFile("/Inbox.html", res);
			break;
//end
//Amir: routing static pages i made
		case "/api/getUserProfile":
			handleGetUserProfile(req, res, urlObj.query);
			break;
		case "/api/getShelters":
			handleGetShelters(req, res);
			break;
//end
		case "/api/createPet":
    			handleCreatePet(req, res);
    			break;
		default:
			sendFile(urlObj.pathname, res);
			break;
			//Amir: yea i updated this so we try to serve the file instead of forcing the homepage, was causing loading issues
			// Should probably be something else instead to handle errors
	}
});

// TODO: Creates and sends a pet's profile (Amir: Updated to incorporate more pet info and also update style)
// Creates and sends a pet's profile (with login params preserved)
function getPetProfile(qObj, res) {
    let petName = qObj.name;

    if (!petName) {
        res.writeHead(400);
        return res.end("Missing pet name");
    }

    const sql = `
        SELECT
            p.*,
            s.sName AS shelterName,
            s.address AS shelterAddress,
            s.email AS shelterEmail
        FROM Pets p
        LEFT JOIN Shelters s ON p.shelterId = s.shelterId
        WHERE p.name = ?
        LIMIT 1
    `;

    db.query(sql, [petName], function(err, rows) {
        if (err) {
            console.log("DB error:", err);
            res.writeHead(500);
            return res.end("DB error");
        }

        if (rows.length === 0) {
            res.writeHead(404);
            return res.end("Pet not found");
        }

        let pet = rows[0];

        // Build the page
        let html = `
<!DOCTYPE html>
<html>
<head>
    <title>${pet.name}'s Profile</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f4f4f9;
        }

        .navbar {
            background-color: #0056b3;
            padding: 15px 25px;
            color: white;
            font-size: 22px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .navbar a {
            color: white;
            text-decoration: none;
            margin-left: 20px;
            font-size: 18px;
        }

        .container {
            max-width: 700px;
            margin: 40px auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        h1 {
            text-align: center;
            color: #333;
        }

        .pet-info, .shelter-info {
            margin-top: 20px;
            line-height: 1.6;
            font-size: 16px;
        }

        label {
            font-weight: bold;
            display: block;
            margin-top: 15px;
            margin-bottom: 5px;
        }

        input, textarea {
            width: 100%;
            padding: 10px;
            font-size: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        textarea {
            resize: vertical;
        }

        .btn {
            margin-top: 20px;
            padding: 12px;
            width: 100%;
            background: #0056b3;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }

        .btn:hover {
            background: #003f82;
        }

        .back-link {
            text-decoration: none;
            display: inline-block;
            margin-top: 15px;
            color: #0056b3;
        }
    </style>
</head>

<body>

<div class="navbar">
    Web of Homes
    <div>
        <a href="/Homepage.html?username=${qObj.username}&userId=${qObj.userId}&userType=${qObj.userType}">Home</a>
        <a href="/profile.html?username=${qObj.username}&userId=${qObj.userId}&userType=${qObj.userType}">Profile</a>
        <a href="/login.html">Logout</a>
    </div>
</div>

<div class="container">

    <h1>${pet.name}'s Profile</h1>

    <div class="pet-info">
        <strong>Type:</strong> ${pet.petType || "N/A"}<br>
        <strong>Age:</strong> ${pet.age || "N/A"}<br>
        <strong>Description:</strong> ${pet.description || "No description available."}
    </div>

    <h3 style="margin-top: 30px;">Shelter Information</h3>

    <div class="shelter-info">
        <strong>Shelter Name:</strong> ${pet.shelterName || "N/A"}<br>
        <strong>Address:</strong> ${pet.shelterAddress || "N/A"}<br>
        <strong>Email:</strong> ${pet.shelterEmail || "N/A"}
    </div>

    <h3 style="margin-top: 30px;">Adoption Request Form</h3>

    <form action="/submit-adoption" method="GET">

        <input type="hidden" name="pet" value="${pet.name}">
        <input type="hidden" name="userId" value="${qObj.userId}">
        <input type="hidden" name="username" value="${qObj.username}">

        <label>Your Name:</label>
        <input type="text" name="fullname" required>

        <label>Email:</label>
        <input type="email" name="email" required>

        <label>Phone:</label>
        <input type="tel" name="phone" required>

        <label>Message:</label>
        <textarea name="message" rows="4" required></textarea>

        <button class="btn" type="submit">Submit Adoption Request</button>
    </form>

    <a class="back-link" href="/pets?username=${qObj.username}&userId=${qObj.userId}&userType=${qObj.userType}">Back to Pets</a>
</div>

</body>
</html>
`;

        res.writeHead(200, { "content-type": "text/html" });
        res.end(html);
    });
}

//handles adotption form submissions (updated)
function handleAdoptionRequest(qObj, res){
    let petName = qObj.pet;
    let senderId = parseInt(qObj.userId);   // logged-in pet owner
    let userName = qObj.username;           // logged-in username

    let email = qObj.email;
    let phone = qObj.phone;
    let userMsg = qObj.message;

    let fullMsg = `
Adoption Request
-----------------------
From: ${userName}
Email: ${email}
Phone: ${phone}

Pet: ${petName}

Message:
${userMsg}
-----------------------
`;

    db.query(
        "SELECT petId, shelterId FROM Pets WHERE name = ? LIMIT 1",
        [petName],
        (err, rows) => {
            if (rows.length === 0) return;

            let petId = rows[0].petId;
            let shelterId = rows[0].shelterId;

            db.query(
                "INSERT INTO Messages (senderId, recipientID, petId, msgText, formName) VALUES (?, ?, ?, ?, ?)",
                [senderId, shelterId, petId, fullMsg, null],
                () => {}
            );

            res.writeHead(200, {'content-type':'text/html'});
            res.end(`<h2>Adoption Request Submitted!</h2>
                     <a href="/pets">Back to Pets</a>`);
        }
    );
}

function handleProfileCreation(req, res) {
	if (req.method ==="GET") {
		let urlObj = url.parse(req.url, true);
		let query = urlObj.query;

		let petName = query.petName || "Unnamed Pet";
		let petType = query.petType || "Unknown";
		let petAge = query.petAge || "Unknown";
		let petDescription = query.petDescription || "No description provided";

		console.log("NEW PET PROFILE CREATED:");
		console.log("Name: " + petName);
		console.log("Type: " + petType);
		console.log("Age:  " + petAge);
		console.log("Description: " + petDescription);

		let html = `
		<html>
		<body>
			<h2>Profile Created Successfully!</h2>
			<p><strong>${petName}</strong> has been added to the system.</p>
			<p>Type: ${petType}</p>
			<p>Age: ${petAge}</p>
			<p>Description: ${petDescription}</p>
			<br>
			<a href="/create-profile">Create Another Profile</a> |
			<a href="/">Home</a>
		<body>
		</html>
		`;

		res.writeHead(200, {'content-type': 'text/html'});
		res.write(html);
		res.end();
		} else {
			respond(res, 405, "Method not allowed");
		}
	}

//Amir's Login and signup Function code (updated to work using SQL)
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

        db.query(
            "SELECT * FROM Users WHERE username = ? AND password = ?",
            [username, password],
            function(err, rows) {
                if (err) {
                    res.writeHead(500, {'content-type':'application/json'});
                    res.end(JSON.stringify({status:"fail", message:"db error"}));
                    return;
                }

                if (rows.length === 0) {
                    res.writeHead(200, {'content-type':'application/json'});
                    res.end(JSON.stringify({status:"fail"}));
                    return;
                }

                let user = rows[0];

                res.writeHead(200, {'content-type':'application/json'});
                res.end(JSON.stringify({
                    status: "ok",
                    username: user.username,
                    userId: user.userId,
                    userType: user.userType
                }));
            }
        );
    });
}

function handleSignup(req, res) {
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
        let data = new URLSearchParams(body);

        let username = data.get("username");
        let password = data.get("password");
        let userType = data.get("userType");

        let fullName = data.get("fullName");
        let email = data.get("email");
        let phone = data.get("phone");
        let address = data.get("address");

        if (!username || !password || !userType) {
            res.writeHead(400);
            return res.end("Missing required fields");
        }

        db.query(
            "SELECT * FROM Users WHERE username = ?",
            [username],
            function(err, rows) {
                if (rows.length > 0) {
                    res.writeHead(400);
                    return res.end("Username already exists");
                }

                db.query(
                    "INSERT INTO Users (username, password, userType, fullName, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [username, password, userType, fullName, email, phone, address],
                    function(err2) {
                        if (err2) {
                            console.log(err2);
                            res.writeHead(500);
                            return res.end("DB error");
                        }

                        res.writeHead(200);
                        res.end("ok");
                    }
                );
            }
        );
    });
}

//Amir's code ends

// Respond to requests
function respond(res, status, message){
	res.writeHead(status, {'content-type':'text/plain'});
	res.write(message);
	res.end();
}

// Send static files
//Amir: (sprint 2) edited again due to query params messing with reading files
//Amir: (FIXED) Issue with the line || let fname = "./public-html" + fPath; ||NEEDS TO CHANGE TO|| let fname = "./public_html" + fPath; ||BECAUSE|| the file directory uses an underscore 
function sendFile(fPath, res){
    let cleanPath = fPath.split("?")[0];

    let fname = "./public_html" + cleanPath;

    fs.readFile(fname, function(err, data) {
        if (err){
            respond(res, 404, "File not found");
            return;
        }
//Amir: Here you need to add return so the execution stops and headers are only sent once
	else {
            let ext = getContentType(cleanPath, res); // use clean path
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

function handleSendAdoptionRequest(req, res) {
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
        let data = new URLSearchParams(body);
        let username = data.get("username");
        let petId = data.get("petId");
        let msgText = data.get("msgText");

        db.query(
            "SELECT userId FROM Users WHERE username = ?",
            [username],
            function (err, senderResult) {
                if (err || senderResult.length === 0) {
                    res.writeHead(400);
                    return res.end("Invalid sender");
                }

                let senderId = senderResult[0].userId;

                db.query(
                    "SELECT shelterId FROM Pets WHERE petId = ?",
                    [petId],
                    function (err, petResult) {
                        if (err || petResult.length === 0) {
                            res.writeHead(400);
                            return res.end("Invalid pet");
                        }

                        let shelterId = petResult[0].shelterId;

                        db.query(
                            "INSERT INTO Messages (senderId, recipientID, petId, msgText) VALUES (?, ?, ?, ?)",
                            [senderId, shelterId, petId, msgText],
                            function (err) {
                                if (err) {
                                    res.writeHead(500);
                                    res.end("DB error");
                                } else {
                                    res.writeHead(200);
                                    res.end("ok");
                                }
                            }
                        );
                    }
                );
            }
        );
    });
}

function handleGetInbox(req, res, q) {
    let username = q.username;

    db.query(
        "SELECT userId FROM Users WHERE username = ?",
        [username],
        function (err, userResult) {
            if (err || userResult.length === 0) {
                res.writeHead(400);
                return res.end("Invalid user");
            }

            let userId = userResult[0].userId;

	    const sql = `
	       SELECT
		   m.messageId,
        	   m.msgText,
        	   m.senderId,
        	   m.recipientID,
        	   m.petId,
        	   p.name AS petName,
        	   COALESCE(u.username, m.formName, 'Unknown Sender') AS senderName,
        	   m.senderId AS ownerId
    	       FROM Messages m
	       JOIN Pets p ON m.petId = p.petId
               LEFT JOIN Users u ON m.senderId = u.userId
               WHERE m.recipientID = ?
               ORDER BY m.messageId ASC
            `;


            db.query(sql, [userId], function (err, results) {
                if (err) {
                    console.log("Inbox SQL Error:", err);
                    res.writeHead(500);
                    return res.end("DB error");
                }

                res.writeHead(200, { 'content-type': 'application/json' });
                res.end(JSON.stringify(results));
            });
        }
    );
}

//Amir: reply handler
function handleSendReply(req, res) {
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
        let data = new URLSearchParams(body);

        let senderId = parseInt(data.get("senderId"));
        let recipientId = parseInt(data.get("recipientId"));
        let msgText = data.get("msgText");
        let petId = parseInt(data.get("petId"));

        console.log("DEBUG REPLY RECEIVED:", {
            senderId,
            recipientId,
            petId,
            msgText
        });

        if (isNaN(senderId) || isNaN(recipientId) || isNaN(petId) || !msgText) {
            console.log(" REPLY FAILED — Missing fields above");
            res.writeHead(400);
            return res.end("Missing fields");
        }

        db.query(
            "INSERT INTO Messages (senderId, recipientID, petId, msgText, formName) VALUES (?, ?, ?, ?, NULL)",
            [senderId, recipientId, petId, msgText],
            function(err){
                if(err){
                    console.log(" REPLY DB ERROR:", err);
                    res.writeHead(500);
                    return res.end("DB error");
                }

                console.log(" REPLY SAVED SUCCESSFULLY");
                res.writeHead(200);
                res.end("ok");
            }
        );
    });
}

//end of request and reply handlers

//Amir: Login and shelter page handlers
function handleGetUserProfile(req, res, q) {
    let userId = q.userId;

    db.query(
        "SELECT username, userType, fullName, email, phone, address FROM Users WHERE userId = ?",
        [userId],
        (err, rows) => {
            if (err) {
                res.writeHead(500, {'content-type': 'application/json'});
                return res.end(JSON.stringify({status: "error"}));
            }

            if (rows.length === 0) {
                res.writeHead(404, {'content-type': 'application/json'});
                return res.end(JSON.stringify({status: "not_found"}));
            }

            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify(rows[0]));
        }
    );
}

function handleGetShelters(req, res) {
    db.query("SELECT * FROM Shelters", (err, rows) => {
        if (err) {
            res.writeHead(500, {'content-type': 'application/json'});
            return res.end(JSON.stringify({status: "error"}));
        }

        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify(rows));
    });
}

function handleCreatePet(req, res) {
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
        let data = new URLSearchParams(body);

        let name = data.get("name");
        let age = data.get("age");
        let type = data.get("petType");
        let description = data.get("description");
        let shelterId = data.get("shelterId");

        db.query(
            "INSERT INTO Pets (name, age, petType, description, shelterId) VALUES (?, ?, ?, ?, ?)",
            [name, age, type, description, shelterId],
            err => {
                if (err) {
                    res.writeHead(500);
                    return res.end("DB error");
                }
                res.writeHead(200);
                res.end("ok");
            }
        );
    });
}

// Start server
myServer.listen(80, function(){console.log("Listening on port 80");});
