var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var liveConnections = {};
var sender;//There can be only one
io.on('connection', function(socket){
	liveConnections[socket.handshake.address] = "live";
	var path = socket.handshake.headers['referer'].split('/');
	path = path[path.length-1];
	if(path === 'sender.html'){
		console.log("a sender is attempting to connect");
		if(sender === undefined){
			console.log("a sender has connected.");
			sender = socket;
		}else{
			//There is already a sender connected;
			console.log("There is already a sender connected");
			socket.emit('displayAlreadyHasSender');
			socket.disconnect();
		}
	}
	printConnections();
	console.log('Newest: ' + socket.handshake.address);
  socket.on('mouse', function(msg){
    io.emit('mouse', msg);
  });
  socket.on('ballSpawn', function(msg){
    io.emit('ballSpawn', msg);
  });
  socket.on('initGame', function(msg){
	io.emit('initGame',msg);
  });
  socket.on('initGameConfirmed',function(msg){
	io.emit('initGameConfirmed');
  });
  socket.on('velocity',function(msg){
	io.emit('velocity',msg);
  });

	socket.on('disconnect', function () {
		liveConnections[socket.handshake.address] = "dead";
		printConnections();
		console.log('Disconnected: ' + socket.handshake.address);
		if(socket === sender){
			console.log("The sender has disconnected");
			sender = undefined;
		}
	});
});

//http.listen(3000, '127.0.0.1', function(){
http.listen(3000, '192.168.251.88', function(){
  console.log('listening on *:3000');
});

function printConnections(){
	console.log('-----------------------------');
	if(sender!==undefined)console.log("Sender: " + sender.handshake.address);
	for(var i in liveConnections){
		console.log(i + ":" + liveConnections[i]);
	}
	console.log('-----------------------------');
}
