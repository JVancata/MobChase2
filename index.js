var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('images'));
app.use(express.static('js'));
app.use(express.static('../softik'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

let counter = 0;
let monster = {
	x: 69,
	y: 69
};
getCoordinates = () => {
	let obj = {
		x: 32 + Math.floor((Math.random() * (1000 - 64))),
		y: 32 + Math.floor((Math.random() * (1000 - 64))),
		counter: counter
	};
	console.log("New x:" + obj.x + " y: " + obj.y);
	return obj;
}
let clientCounter = 0;
let users = [];
//players
let gameData = {};
setInterval(() => {
	users = users.filter(Boolean);
	gameData.users = users;
	gameData.monster = monster;
	io.emit('gameData', gameData)
	//io.emit("users", users);
	//io.emit("monster", monster);
}, 1000 / 60);

io.on('connection', function (socket) {
	const id = clientCounter++;
	console.log("New Id:" + id);
	console.log('a user connected');
	io.emit('id', id);
	socket.on('disconnect', () => {
		console.log('user disconnected');
		users[id] = undefined;
	});
	socket.on('position', function (pos) {
		if (pos) {
			users[id] = { x: Math.floor(pos.x), y: Math.floor(pos.y), id: id }
			//console.log("My pos: x:" + users[id].x + " y:" + users[id].y);
			//console.log("Monster pos: x:" + monster.x + " y:" + monster.y);
			if (pos.x <= (monster.x + 32) && monster.x <= (pos.x + 32) && pos.y <= (monster.y + 32) && monster.y <= (pos.y + 32)) {
				counter++;
				monster = getCoordinates();
			}
		}
	});
});

http.listen(80, function () {
	console.log('listening on *:80');
});