# Description

NodeJs application, using WebSocket, Express and WebRTC to create a Web Peer to Peer Multimedia Streaming platform.

	Node version: 10.x
	Ejs: 2.6.x
	Express: 4.7.x
	Ws: 7.1.x
	
## 1 - How to deploy on local
### A - NodeJs and Npm

	https://nodejs.org/en/download/
	(include npm 6.x)
	
Add node and npm to your command $PATH
	
### B - Launch server

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


### C - Client

To see the results:

	Open *twice* your favorite browser (not internet explorer v6..) at http://localhost/.
	
You shold see in the top left corner:

	My id: [UUID]
	Peer id: [UUID]

Then:

	> Select the medias to be shared. (Checkbox)
	> Open. (PushButton)
	
When both clients are done:

	> Launch. (PushButton)
	
To change the parameters:

	> Refresh (F5 or Ctrl+R) both clients.
	> Re-itere the previous actions.
	
## 2 - How to deploy on the World Wide Web - Heroku solution

The solution described here use the free version of Heroku. It's interesting for test and development but may not be powerful enough for large scale business.

### A - Heroku initialization

Choose "Sign Up for Free" on https://www.heroku.com/.

Install heroku Command Line Interface (CLI).

Then

	# Clone this git repository on your computer
	git clone https://github.com/Saillou/WebStreamer.git
	
Create an Heroku app. (Limited at 5 for the free version).

	# Go to your cloned folder
	cd WebStreamer
	
	# And create the app
	heroku login
	heroku create [app_name]
	
Now, upload your local app to heroku server
	
	git push heroku
	
Heroku will build the app and deploy it.

### B - Usage and Management

To see the server answers (in real time):

	heroku logs --tail
	(Use ctrl+C) to stop
	
The application is accessible at https://[app_name].herokuapp.com/