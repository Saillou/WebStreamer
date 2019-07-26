// Constantes
const Format 	= {
	FullHd : {w:1920, h:1080}, 
	Hd		 : {w:1080, h:720}, 
	Vga	 : {w:640, h:480}, 
	Qvga	 : {w:320, h:240}
};
const Emitter = {
	Sender 	: 1,
	Receiver	: 2,
};
const Request = {
	Accepted 	: 1,
	Refused		: 2,	
	Timeout		: 3,	
};

const peerConnectionConfig = {
	bundlePolicy: 'balanced',
	iceServers: [
		{'urls': 'stun:stun.stunprotocol.org:3478'},
		{'urls': 'stun:stun.l.google.com:19302'}
	],
	iceTransportPolicy: 'all',
	peerIdentity: null
};

var uuid 		= G_Server['uuid'];
var peerUuid 	= G_Server['peerUuid'];

// Variables
var cameraList = {
	dom	: document.getElementById('CameraList'),
	elts	: [],
};
var previewList = {
	dom	: document.querySelector('#Preview .VideoList'),
	elts	: [],	
}
var receivedList = {
	dom	: document.querySelector('#Received .VideoList'),
	elts	: [],	
}

// Object
class CameraDescription  {	
	// Constructor
	constructor(mediaDevice_, checkbox_, formatUl_) {
		this.mediaDevice 	= mediaDevice_;
		this.checkbox 		= checkbox_;
		this.formatUl 			= formatUl_;
	}
	
	// Getter
	getConstraints() {
		let format = Format.Vga;
		
		for(let input of this.formatUl.getElementsByTagName('input')) {
			if(input.type != "radio")
				continue;
			if(input.checked) {
				format = Format[input.value];
				break;
			}
		}
		
		return {
			video: {
				width		:	format.w,
				height	:	format.h,
				deviceId	: { exact: this.getId() }
			},
			audio: false
		};
	}
	getSelected() {
		return this.checkbox.checked;
	}
	getDevice() {
		return this.mediaDevice;
	}
	getName() {
		return this.mediaDevice.label;
	}
	getId() {
		return this.mediaDevice.deviceId;
	}
}

// WebSocket and P2P
var ws 	= new WebSocket(location.origin.replace(/^http/, 'ws'), 'echo-protocol');
var pcS	= new RTCPeerConnection(peerConnectionConfig);
var pcR	= new RTCPeerConnection(peerConnectionConfig);

// Events
ws.onopen 		= createGui;
ws.onmessage	= onMessage;

pcS.onicecandidate 	= (ice) => onIce(ice, Emitter.Sender);
pcR.onicecandidate 	= (ice) => onIce(ice, Emitter.Receiver);
pcR.ontrack 			= onTrack;


// Create
function createGui() {
	navigator.mediaDevices.enumerateDevices().then(devices => {
		for(let device of devices) {
			if(device.kind != "videoinput")
				continue;
			
			createCamera(device); 
		}
		
		pageReady();
	});
}

function createCamera(device) {
/* Example:
	<li class="camera">
		<label>Camera 1</label> 
		<input type="checkbox" />
		<input type="hidden" data-title="deviceId" value="deviceId" />
		<ul class="FormatList">
			<li><input type="radio" name="format" value="0" /> <label>320x240</label> </li>
			...
		</ul>
	</li>
*/

	let li 				= document.createElement('li');
	let label 		= document.createElement('label');
	let checkbox 	= document.createElement('input');
	let deviceId 	= document.createElement('input');
	let ul				= document.createElement('ul');
	
	li.className 		= "camera";
	ul.className		= "FormatList";
	ul.style.display	= 'none';
	
	label.innerHTML	= device.label;
	
	checkbox.type 	= 'checkbox';
	checkbox.onclick	= function() {ul.style.display = checkbox.checked ? 'block' : 'none';};
	
	deviceId.type 		= 'hidden';
	deviceId.value		= device.deviceId;
	deviceId.dataset['title']	= 'deviceId';
	
	li.appendChild(label);
	li.appendChild(checkbox);
	li.appendChild(deviceId);
	li.appendChild(ul);
	
	// Format
	for(fmtName in Format) {
		let li_fmt = document.createElement('li');
		let in_fmt = document.createElement('input');
		let lbl_fmt = document.createElement('label');
		
		in_fmt.type = "radio";
		in_fmt.name = "format_"+device.deviceId;
		in_fmt.value = fmtName;
		if(fmtName == "Vga")
			in_fmt.checked = true;
		
		lbl_fmt.innerHTML = Format[fmtName].w + 'x' + Format[fmtName].h;
		
		li_fmt.appendChild(in_fmt);
		li_fmt.appendChild(lbl_fmt);
		ul.appendChild(li_fmt);
	}
	
	cameraList.dom.appendChild(li);
	cameraList.elts.push(new CameraDescription(device, checkbox, ul));
}

function createVideoPreview(camera, stream) {
/* Example:
	<li class="videoPreview">
		<h3>Camera 1</h3>
		<video autoplay></video>
	</li>
*/	

	let li 			= document.createElement('li');
	let title 		= document.createElement('h3');
	let video	= document.createElement('video');
	
	li.className 		= 'videoPreview';
	title.innerHTML 	= camera.label;
	video.autoplay 	= true;
	video.srcObject 	= stream;
	
	li.appendChild(title);
	li.appendChild(video);
	
	previewList.dom.appendChild(li);
	previewList.elts.push({
		camera	: camera, 
		video		: video
	});
}

function createVideoReceived(stream) {
/* Example:
	<li class="videoReceived">
		<h3>Camera 1</h3>
		<video autoplay></video>
	</li>
*/	
	let li 			= document.createElement('li');
	let title 		= document.createElement('h3');
	let video	= document.createElement('video');
	
	li.className 		= 'videoReceived';
	title.innerHTML 	= 'Camera ' + (receivedList.elts.length+1);
	video.autoplay 	= true;
	video.srcObject 	= stream;
	
	li.appendChild(title);
	li.appendChild(video);
	
	receivedList.dom.appendChild(li);
	receivedList.elts.push({
		video		: video
	});	
}


// Open
async function openCameras() {
			
	// Read the list
	for(let cam of cameraList.elts) {	
		if(!cam.getSelected())
			continue;

			try {
				let stream = await navigator.mediaDevices.getUserMedia(cam.getConstraints());
				createVideoPreview(cam.getDevice(), stream);
				
			} catch (reason) {
				console.log("Can't open camera", cam.getName(), ':', reason);	
			};
	}
	
	// Camera can't change | Launch available
	for(let input of cameraList.dom.getElementsByTagName('input'))
		input.disabled = (input.value !== "Launch");
}


// Launch
async function askLaunchCameras() {
	ws.send(JSON.stringify({'askLaunch': true}));
	
	document.getElementById('RequestWait').style.display = 'flex';
}

async function launchCameras() {
	// Streams
	for(let preview of previewList.elts) {
		let stream = preview.video.srcObject;
		
		for(let track of stream.getTracks())
			pcS.addTrack(track, stream);
	}
	
	// Answer (from sender)
	pcS.createOffer().then(description => {
		
		// Set and broadcast offer
		pcS.setLocalDescription(description).then(() => {
			ws.send(JSON.stringify({'sdp': description, 'emitter': Emitter.Sender}));
		});
	});
	
	// Disable launch
	for(let input of cameraList.dom.getElementsByTagName('input'))
		input.disabled = true;
}

async function answerRequest(result) {
	// Delete prompt
	document.getElementById('PromptRequest').style.display = 'none';
	
	// Send result
	ws.send(JSON.stringify({'launch': true, 'requestStatus': result, 'emitter': Emitter.Sender}));
	
	if(result == Request.Accepted)
		launchCameras();	
}


// Events
function onMessage(message) {
	var signal = JSON.parse(message.data);
	
	// Manage peer communication
	let pc;
	if(!signal.emitter)										pc = null;
	else if(signal.emitter == Emitter.Sender) 		pc = pcR;
	else if(signal.emitter == Emitter.Receiver) 	pc = pcS;
	
	// Manage signal
	if(pc !== null && signal.sdp)
		manageSdpSignal(pc, signal);
	
	if(pc !== null && signal.ice)
		manageIceSignal(pc, signal);
	
	if(signal.askLaunch)
		document.getElementById('PromptRequest').style.display = 'flex';
	
	if(signal.launch) {
		// Delete request windows
		document.getElementById('RequestWait').style.display = 'none';
		
		if(signal.requestStatus == Request.Accepted)
			launchCameras();
	}
	
	if(signal.uuid) {
		if(signal.whose == 'mine')
			uuid = signal.uuid;
		if(signal.whose == 'peer')
			peerUuid = signal.uuid;
		
		updateUUID();
	}
}

function manageSdpSignal(pc, signal) {
	// Remote
	pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
		// Only create answers in response to offers
		if(signal.sdp.type !== 'offer')
			return;
		
		// Answer (from receiver)
		pc.createAnswer().then(description => {
			// Set and broadcast answer
			pc.setLocalDescription(description).then(() => {
				ws.send(JSON.stringify({'sdp': description, 'emitter': Emitter.Receiver}));
			});
		});
	});	
}

function manageIceSignal(pc, signal) {
	pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(reason => {
		console.log('Error add Ice: ', reason);
	});
}


 // P2P Events
function onIce(ice, emitter) {
	if(ice.candidate == null)
		return;
	
	// Broadcast ice
	ws.send(JSON.stringify({'ice': ice.candidate, 'emitter':emitter}));
}

function onTrack(track) {
	for(let stream of track.streams) {
		createVideoReceived(stream);
	}
}


// Web socket connected and camera created
function pageReady() {
	// Camera can change | Launch unavailable
	for(let input of cameraList.dom.getElementsByTagName('input'))
		input.disabled = (input.value === "Launch");
	
	// UUIDs
	updateUUID();
}

function updateUUID() {
	document.getElementById('_myId').innerHTML	= uuid ? uuid : "Creating..";
	document.getElementById('_peerId').innerHTML	= peerUuid ? peerUuid : "Waiting..";	
}