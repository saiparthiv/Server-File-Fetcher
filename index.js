var config = {
    "myPort": process.argv[3] | 8008,
    "originalHost": "www.scu.edu",
    "originalHostPort": 443,
    "directory": __dirname
}

const https = require('https');
const fs = require('fs');
const shell = require('shelljs')
const http = require("http");

const myAgent = new http.Agent({
    keepAlive: true,
    maxSockets: 1,
    keepAliveMsecs: 1500
  })

  var headers = {'Content-Type': 'text/html',
  'agent': myAgent,
  'Date': (new Date()).toUTCString(),
  'Connection': 'Keep-Alive',
}

const server = http.createServer(handler);
config.directory = process.argv[2] ? process.argv[2] : config.directory;
var myCheck;
function handler(req, res) {
    myCheck = checkParams(req); // checks if there is any query parameter in the url
	if(req.method == "GET") { //GET mnethod
		var pathname = isHTML(req.url) ? config.directory+req.url : config.directory+(req.url).split('?')[0]+'/index.html';    //Check whether its HTML page that is requested or a media file
		fs.readFile(pathname, function(err, data) {
			if(err) {
				// console.error(err.message);
                console.log("Fetching files from www.scu.edu ");
				fetchTheFiles(req.url, (dt, resCode, error) => { //File not found on local system, downloading the file from scu.edu
					if(error) {
						console.error(error.message);
					} else {
                        try {
                            dt = fs.readFileSync(pathname);
                        } catch (err) {
                            resCode = resCode;
                        }
                        headers['Content-Length'] = dt.length;
						res.writeHead(resCode, headers);
						res.write(dt);
						res.end()
					}
				});
			} else {
				headers['Content-Length'] = data.length;
				res.writeHead(200, headers);
				res.write(data);
				res.end();
			}
		})
	} else {
        console.log("Method not allowed: "+ req.method);
		res.writeHead(405, headers);
		res.end();
    }
}

// Downloads the files from HOST server
function fetchTheFiles(path, callback) {
    const options = {
        hostname: config.originalHost,
        port: config.originalHostPort,
        path: path
    }
    const req = https.request(options, res => {
        var regex = /\/.*\//
        var check = isHTML(path);
        var newPath = path.match(regex);
        var pathSplit = path.split('/');
        var code = res.statusCode;
        // console.log(myCheck, code);
        // Checks whether its HTML or media file
        // Creates directory and save index.html or media file

        if(check) {
			var myData = '';
            res.on('data', dt => {
                // console.log(config.directory + newPath, pathSplit,);
                shell.mkdir('-p', config.directory + newPath);
                try {
                    fs.appendFileSync( config.directory+path,dt);
                } catch (err) {
                    console.log("Illegal Files");
                    code = myCheck ? 400 : 404; 
                }
                myData += dt;
            })
        } else {
            res.on('data', dt => {
                try {
                    newPath = myCheck ? path.split('?')[0] + '/' : path
                    shell.mkdir('-p', config.directory + newPath);
                    fs.appendFileSync( config.directory+path+'index.html',dt);
                } catch (err) {
                    console.log("Illegal File", path, myCheck);
                    code = myCheck ? 400 : 404; 
                }
				myData += dt;
            })
        }

        //On connection close trigger callback
		res.on('close', function() {
			callback(myData, code, false);
		})

        //On error trigger appropriate callback
        res.on('error', er => {
            console.log(er.message, "there is an error");
            callback(config.directory+path, code, true);
        })
    })

    req.end();
}

// check if requesting HTML
function isHTML(path) {
    if(path.split('.').length > 1)
        return true;
    return false;
}

//Check for query parameters
function checkParams(req) {
    var params = req.url.split('?');
    if(params.length > 1) {
        req.params = params[1].split('&');
        return true;
    }
    return false;
}


//Starting server on requested port
server.listen(config.myPort, function(err){
	console.log("The server is up and ready @ localhost:"+config.myPort+"/");
});

// console.log(process.argv[3]);


