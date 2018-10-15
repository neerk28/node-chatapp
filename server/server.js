const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const moment = require('moment');
const {isRealString} = require('../utils/validation')
const {Users} = require('../utils/users');

var app = express();
var port = process.env.PORT || 3000;

var server = http.createServer(app);

server.listen(port, () =>{
    console.log(`Server started in port ${port}`);
});
/*
README:

Inbuilt events: 
connection, connect - Server and Client connection
disconnect, disconnect - Server and Client disconnection

Custom events:
newMessage, newLocationMessage, createMessage, createLocationMessage, join, updateUserslist

To listen to events:
socket/io.on('eventName' ,(args, callback))

To emit events:
io.to(room).emit('eventName', args, callback) - send message to every client connected to same room including yourself
socket.emit('eventName', args, callback) - send message to that particular client
socket.broadcast.to(room).emit('eventName', args, callback) - send message to every other user in room except yourself
*/

var io = socketIO(server); // creates a websocket server
var users = new Users(); //Users is a class

io.on('connection', (socket) => {
    console.log('New connection');

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) && !isRealString(params.room)){
            callback('Display Name and Room Name required');
        }
        socket.join(params.room); //join a room
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name.toUpperCase(), params.room);

        io.to(params.room).emit('updateUsersList', users.getUsersList(params.room));

        socket.emit('newMessage', {
            from: 'ADMIN',
            text: 'Welcome to the chat app',
            createdAt: moment()
        });
    
        socket.broadcast.to(params.room).emit('newMessage',{ // broadcast only to that room specified
            from: 'ADMIN',
            text: `${params.name.toUpperCase()} joined`,
            createdAt: moment()
        }); 
        callback();
    })

    socket.on('createMessage', (newMessage, callback) => {
        var user = users.getUser(socket.id);
        if(user && isRealString(newMessage.text)){
            io.to(user.room).emit('newMessage',{ // note: its io here not socket
                from: user.name,
                text: newMessage.text,
                createdAt: moment()
            });  
        }
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if(user){
        io.to(user.room).emit('newLocationMessage',{ // note: its io here not socket
            from: user.name,
            url: `https://maps.google.com?q=${coords.latitude},${coords.longitude}`,
            createdAt: moment()
        });
        }
    });

    socket.on('disconnect',() =>{
        console.log('Disconnected from client');
        var user = users.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('updateUsersList',users.getUsersList(user.room));
            io.to(user.room).emit('newMessage', {
                from: 'ADMIN',
                text: `${user.name} left`,
                createdAt: moment()
            })
        }
    });
});

app.use(express.static(path.join(__dirname,'../public')));