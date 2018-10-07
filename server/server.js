const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

var app = express();
var port = process.env.PORT || 3000;

var server = http.createServer(app);

server.listen(port, () =>{
    console.log(`Server started in port ${port}`);
});

var io = socketIO(server); // creates a websocket server

io.on('connection', (socket) => {
    console.log('New connection');

    socket.on('disconnect',() =>{
        console.log('Disconnected from client');
    })
});

app.use(express.static(path.join(__dirname,'../public')));