var socket = io(); //function given by loading the socket.io js file
socket.on('connect', () => {
    console.log('Connected to Server');

    socket.emit('createMessage', {
        to: 'Logaraja',
        text: 'hey!'
    });
});

socket.on('newMessage', (newMessage) => {
    console.log('Got new message ', newMessage);
});

socket.on('disconnect', () => {
    console.log('Disconnected from Server');
})