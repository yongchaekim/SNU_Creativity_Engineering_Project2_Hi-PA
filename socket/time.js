var io = require('./io').io();
var Time = require('../model/time');
var Script = require('../model/Script');
var script = require('./script');
var Question = require('../model/Question');
var question = require('./question');
var tooltip = require('./tooltip');
var feedback = require('./feedback');
var alert = require('../model/alert');

var time = {};
time.presenter = io.of('/socket/time/presenter');
time.presenter.on('connection', (socket) => {
    console.log('time socket on');
    socket.on('SetTimeState', function (data) {
        if (data.state == 'END') {
            Script.reset();
            Question.reset();
            question.io.emit('DELETE_ALL', {});
            script.audience.emit('DELETE_ALL', {});
            tooltip.term = {};
            feedback.reset();
            alert.alert.reset();
        }
        Time.setTimeState(data);
    });
    socket.on('tick', (data) => {
        var hr = data.time[0];
        var mn = data.time[1];
        var sc = data.time[2];
        Time.passedTime = hr * 3600 + mn * 60 + sc;
    });
 
    socket.on('disconnect', function(socket) {
        Time.setTimeState({state:'PAUSED'});
    });
});
module.exports = time;
