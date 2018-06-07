var slideCtrl = require('../model/slide');
var io = require('./io').io();
var time = require('../model/time');
var feedback = require('./feedback');
var alert = require('../model/alert');
var alertsock = require('./alert');
var question = require('./question');
var Question = require('../model/Question');
var tooltip = require('./tooltip');
var slide = {};

slide.audience = io.of('/socket/slide/audience');
slide.audience.on('connection', function(socket) {
    console.log('client connected to slides');
    socket.on('disconnect', function(socket) {
        console.log('client disconnected out slides');
    });


    let slides = slideCtrl.getSlide('slide_01');
    let initData = {
        slideData : slides
    }
    socket.emit('initdata', initData);
});


slide.presenter = io.of('/socket/slide/presenter');

slide.presenter.on('connection', function(socket) {
    console.log('presenter connected to slides');

    socket.on('disconnect', function(socket) {
        console.log('presenter disconnected out slides');
    });

    // Get Init Data
    let slides = slideCtrl.getSlide('slide_01');
    let initData = {
        slideData : slides
    }
    socket.emit('initdata', initData);

    // slideの操作
    socket.on('slidestatechanged', function(data) {
        slideCtrl.updateState('slide_01', data.slideData.state);
        slide.audience.emit('slidestatechanged', data);
        if (time.state === 'STARTED') {
            console.log('sending alerts');
            alertsock.presenter.emit('Alert', {
                realtimefeedback : feedback.send(),
                duration : slides.duration,
                passedTime : time.getTime(),
                timeAlert : alert.getTimeAlert()
            });
        }
    });

    socket.on('slidecontentchanged', function(data) {
        slideCtrl.updateSlide('slide_01', data.slideData);
        slide.audience.broadcast.emit('slidecontentchanged', data);
    });
});


module.exports = slide;