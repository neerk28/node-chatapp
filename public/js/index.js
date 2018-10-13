var socket = io(); //function given by loading the socket.io js file
socket.on('connect', () => {
    console.log('Connected to Server');
});

socket.on('newMessage', (newMessage) => {
    console.log('Got new message ', newMessage);
    var li = jQuery('<li></li>');
    li.text(`${newMessage.from}: ${newMessage.text}`);
    jQuery('#messages').append(li);
});

socket.on('disconnect', () => {
    console.log('Disconnected from Server');
})

jQuery('#input-message').on('submit', function(e){
    e.preventDefault(); // stop browser refreshing
    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val()
    }, function(){

    });
})