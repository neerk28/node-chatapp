var socket = io(); //function given by loading the socket.io js file

socket.on('connect', () => {
    console.log('Connected to Server');
    var params = jQuery.deparam(window.location.search);
    params.name= params.name.toUpperCase();
    params.room = params.room.toUpperCase();
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/'; //redirect to home page
        }
    })
});
function scrollBottom() {
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var msgHeight = newMessage.innerHeight();
    var lastMsgHeight = newMessage.prev().innerHeight();
    if (clientHeight + scrollTop + msgHeight + lastMsgHeight > scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('newMessage', (newMessage) => {
    var formattedDate = moment(newMessage.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html(); //get the html template in this id
    var html = Mustache.render(template, {
        from: newMessage.from,
        createdAt: formattedDate,
        text: newMessage.text
    });
    jQuery('#messages').append(html);
    scrollBottom();
});

socket.on('newLocationMessage', (location) => {
    var formattedDate = moment(location.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html(); //get the html template in this id
    var html = Mustache.render(template, { //render the html using Mustache
        from: location.from,
        createdAt: formattedDate,
        url: location.url
    });
    jQuery('#messages').append(html);
    scrollBottom();
});

socket.on('updateUsersList', (users) => {
    var ol = jQuery('<ol></ol>');
    users.forEach(element => {
        ol.append(jQuery('<li></li>').text(element));
    });
    jQuery('#users').html(ol);
});

socket.on('disconnect', () => {
    console.log('Disconnected from Server');
})

var messageBox = jQuery('[name=message]');
jQuery('#input-message').on('submit', function (e) {
    e.preventDefault(); // stop browser refreshing
    socket.emit('createMessage', {
        text: messageBox.val()
    }, function () {
        messageBox.val('');
    });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported in this browser');
    }
    locationButton.attr('disabled', 'disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function (error) {
        locationButton.removeAttr('disabled').text('Send location');
        return alert('Unable to fetch location');
    })

})