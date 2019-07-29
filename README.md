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
	
Add node and npm to your <quote>PATH</quote>
	
### Launch server

	# Create applications folder
	mkdir WebApplications
	cd WebApplications
	
	# Download source
	git clone https://github.com/Saillou/WebStreamer.git
	
	# Go to sources  and install dependencies
	cd WebStreamer
	npm update
	
	# Launch server (on port 80, http://localhost/)
	node server.js

Content
