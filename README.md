# Description

NodeJs application, using WebSocket, Express and WebRTC to create a Web Peer to Peer Multimedia Streaming platform.

	Node version: 10.x
	Ejs: 2.6.x
	Express: 4.7.x
	Ws: 7.1.x
	
## 1 - How to deploy on local
### NodeJs and Npm

	https://nodejs.org/en/download/
	(include npm 6.x)
	
Add node and npm to your command $PATH
	
### Launch server

	# Create applications folder
	mkdir WebApplications
	cd WebApplications
	
	# Download source
	git clone https://github.com/Saillou/WebStreamer.git
	
	# Go to sources and install dependencies
	cd WebStreamer
	npm update
	
	# Launch server on port 80, i.e. http://localhost/
	node server.js


### Client

To see the results:

	Open *twice* your favorite browser (not internet explorer v6..) at http://localhost/.
	
You shold see in the top left corner:

	My id: [UUID]
	Peer id: [UUID]

Then:

	> Select the medias to be shared. (Checkbox)
	> Open. (PushButton)
	
	#When both clients are done
	> Launch. (PushButton)
	
To change the parameters:

	> Refresh (F5 or Ctrl+R) both clients.
	> Re-itere the previous actions.
	
## 2 - How to deploy on the World Wide Web - Heroku solution

Pry