var io = require('./io').io();

var alert = {};
alert.presenter = io.of('/socket/alert/presenter');
alert.presenter.on('connection', function(socket) {
    console.log('alert connected');
    socket.on('disconnect', function(socket) {
        console.log('alert disconnected');
    });
});
module.exports = alert;
