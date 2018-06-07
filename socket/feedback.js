var io = require('./io').io();
var config = require('../config');

var feedback = {};
feedback.speed = {fast : 0, slow : 0};
feedback.sound = {loud : 0, small : 0};
feedback.threshold = {
    speed : config.speed,
    sound : config.sound
}
feedback.reset = () => {
    feedback.speed = {fast : 0, slow : 0};
    feedback.sound = {loud : 0, small : 0};
}
feedback.presenter = io.of('/socket/feedback/presenter');
feedback.audience = io.of('/socket/feedback/audience');
feedback.audience.on('connection', (socket) => {
    console.log('feedback audience connected');
    socket.on('disconnect', (socket) => {
        console.log('feedback audience disconnected');
    });
    socket.on('SpeedFeedback', (data) => {
        switch(data.sign) {
            case -1:
                feedback.speed.slow++;
                break;
            case 1:
                feedback.speed.fast++;
                break;
        }
        feedback.presenter.emit('SpeedFeedback', feedback.speed);
    });
    socket.on('VolumeFeedback', (data) => {
        switch(data.sign) {
            case -1:
                feedback.sound.small++;
                break;
            case 1:
                feedback.sound.loud++;
        }
        feedback.presenter.emit('VolumeFeedback', feedback.sound);
    });
});
feedback.send = () => {
    var clientNo = io.engine.clientsCount;
    var speed = 0;
    var volume = 0;
    if (feedback.speed.fast > feedback.threshold.speed /* clientNo*/) {
        speed = 1;
    } else if (feedback.speed.slow > feedback.threshold.speed /* clientNo*/) {
        speed = -1;
    }
    if (feedback.sound.loud > feedback.threshold.sound /* clientNo*/) {
        volume = 1;
    } else if (feedback.sound.small > feedback.threshold.sound /* clientNo*/) {
        volume = -1;
    }
    if (speed != 0) {
        feedback.speed = {fast : 0, slow : 0};
    }
    if (volume != 0) {
        feedback.sound = {loud : 0, small : 0};
    }
    console.log('sending');
    return {speed : speed, volume : volume};
}
module.exports = feedback;
