'use strict';

const express 		= require('express')
const path 			= require('path')
const WebSocket 	= require('ws');
const SocketServer = WebSocket.Server;

const PORT = process.env.PORT || 80;
var clients = null;

// Create rendering server
const server = express()
	.use(express.static(path.join(__dirname, 'views')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')

	// Routage	
	.get('/', (req, res) => {
		if(count(clients) == 2) {
			return res.render('wait');
		}
		
		// Result
		return res.render('index', {
			'data':{
				'port':PORT,
			}
		});
	})

	// Launch	
	.listen(PORT, () => console.log('Listening on', PORT));

	
// Create server websocket
const wss = new SocketServer({ server });

// Events
wss.on('connection', function(client) {
	// Update clients
	client.id = wss.getUniqueID();
	clients = wss.clients;
	
	console.log('Client connected', client.id);
	
	// Send uuids
	for(let wssClientA of wss.clients) {
		if(wssClientA.readyState !== WebSocket.OPEN)
			continue;
			
		for(let wssClientB of wss.clients) {
			if(wssClientB.readyState !== WebSocket.OPEN)
				continue;
			
			wssClientA.send(JSON.stringify({'uuid':wssClientB.id, 'whose': (wssClientA.id == wssClientB.id) ? 'mine' : 'peer'}));
		}
	}
	
	// Events
	client.on('close', function() {
		console.log('Client disconnected', client.id);
	});
	
	client.on('message', function(message) {
		wss.broadcast(message, client.id)
	});
});

// Actions
wss.getUniqueID = () => {
	const s4 = () => 
		Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
wss.broadcast =  function(message, idEmitter) {
	for(let wssClient of this.clients) {
		// Don't send back to sender
		if(wssClient.id === idEmitter) 
			continue;
			
		// Client ok
		if(wssClient.readyState === WebSocket.OPEN)
			wssClient.send(message);
	}
}


function count(clients) {
	if(!clients)
		return 0;
	
	let i = 0;
	for(let c of clients)
		i++;
	
	return i;
}