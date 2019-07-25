'use strict';

const express 		= require('express')
const path 			= require('path')
const WebSocket 	= require('ws');
const SocketServer = WebSocket.Server;

const PORT = process.env.PORT || 80;

// Routage
const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.static(__dirname + '/views'))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) 			=> res.render('index', {'data':{'port':PORT}}))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

// Create server websocket
const wss = new SocketServer({ server });

// Events
wss.on('connection', function(ws) {
	console.log('Client connected');
	
	ws.on('message', function(message) {
		wss.broadcast(message);
	});
});

// Actions
wss.broadcast = function(data) {
	this.clients.forEach(function(client) {
		if(client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};