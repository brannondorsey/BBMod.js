var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sendAudioData = null; // function
var sockets = []; // THIS IS A MEMORY LEAK



// app.get('/', function (req, res) {
//     res.sendfile('index.html');
// });

app.use(express.static('public'));


// app.get('/analysis.html', function (req, res) {
//     res.sendfile('analysis.html');
// });

// app.get('/BB.js', function(req, res) {
//     res.sendfile('BB.js');
// });

io.on('connection', function (socket) {
 
    sockets.push(socket); // THIS WILL CAUSE A MEMORY LEAK
});

server.listen(5555);
console.log("Server listening at port 127.0.0.1:5555");
