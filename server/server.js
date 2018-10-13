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

    socket.emit('newMessage', {
        from: 'Admin',
        text: 'Welcome to the chat app',
        createdAt: new Date().getTime()
    });

    socket.broadcast.emit('newMessage',{
        from: 'Admin',
        text: 'New user joined',
        createdAt: new Date().getTime()
    }); 

    socket.on('createMessage', (newMessage, callback) => {
        io.emit('newMessage',{ // note: its io here not socket
            from: newMessage.from,
            text: newMessage.text,
            createdAt: new Date().getTime()
        });
        callback('This is from server');
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage',{ // note: its io here not socket
            from: coords.from,
            url: `https://maps.google.com?q=${coords.latitude},${coords.longitude}`
        });
    });

    socket.on('disconnect',() =>{
        console.log('Disconnected from client');
    });
});

app.use(express.static(path.join(__dirname,'../public')));