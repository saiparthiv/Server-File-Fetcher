# DESCRIPTION   

The program runs in an Event-driven architecture using Nodejs which implements an event loop that improves request taking efficiency and concurrency.
The Program starts a server on any desired port and handles only GET requests and sends 405 HTTP Status for any other method request.
It returns appropriate files from the server directory and if not fetches the files from the original server i.e scu.edu in this case.
The Program builds the servers files directory by fetching the files from original Server and saving them in the Host Server directory appropriately, basically creating a clone.
It also responds with the appropriate HTTP Status Codes.
Runs over HTTPS 1.1 with a configurable keep-alive time.

# FILES 

- index.js
- PA-1.docx
- package.json
- README.txt
- server

# ENVIRONMENT

To Execute the system we must have Nodejs version >= 8.0 && NPM (node package manager) 
To install: $ sudo apt install nodejs npm
To check: $ node -v && npm -v

# EXECUTE
example command:
Runnig first time:
$ npm i # just for first time execution
Then:
$ ./server -document_root "/path/to/folder" -port 8008
