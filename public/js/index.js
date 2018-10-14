var socket = io(); //function given by loading the socket.io js file
socket.on('connect', () => {
    console.log('Connected to Server');
});

socket.on('newMessage', (newMessage) => {
    var li = jQuery('<li></li>');
    li.text(`${newMessage.from}: ${newMessage.text}`);
    jQuery('#messages').append(li);
});

socket.on('newLocationMessage', (location) => {
    var li = jQuery('<li></li>');
    var a = jQuery('<a target="_blank">My Current Location</a>');
    li.text(`${location.from}: `)
    a.attr('href', location.url);
    li.append(a);
    jQuery('#messages').append(li);
});

socket.on('disconnect', () => {
    console.log('Disconnected from Server');
})

var messageBox = jQuery('[name=message]');
jQuery('#input-message').on('submit', function(e){
    e.preventDefault(); // stop browser refreshing
    socket.emit('createMessage', {
        from: 'User',
        text: messageBox.val()
    }, function(){
        messageBox.val('');
    });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function(){
    if(!navigator.geolocation){
        return alert('Geolocation not supported in this browser');
    }
    locationButton.attr('disabled','disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function(position){
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            from: 'User',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    },function(error){
        locationButton.removeAttr('disabled').text('Send location');
        return alert('Unable to fetch location');
    })
    
})