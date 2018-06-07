var slide = require('./slide').getSlide('slide_01');
var timer = require('elapsed-time');
var timescale = require('timescale');

var time = {
    state : 'END',
    duration : slide.duration,
    passedTime : 0,
    slideTime : slide.duration / slide.slideNo,
    et : timer.new()
}

function getTime() {
    //return Math.floor(timescale(time.et.getRawValue(),'ns','s'));
    return time.passedTime;
}

function setTimeState(data) {
    switch(time.state) {
        case 'STARTED':
            if (data.state === 'END') {
                time.et.reset();
                time.state = 'END';
            } else if (data.state === 'PAUSED') {
                time.et.pause();
                time.state = 'PAUSED';
            }
            break;
        case 'END':
            if (data.state === 'STARTED') {
                time.et.start();
                time.state = 'STARTED';
            }
            break;
        case 'PAUSED':
            if (data.state === 'STARTED') {
                time.et.resume();
                time.state = 'STARTED';
            } else if (data.state === 'END') {
                time.et.reset();
                time.state = 'END';
            }
            break;
    }
}

function getTimeState() {
    console.log(time.state);
    /*if (time.state !== 'END')
        time.passedTime = getTime();
    else
        time.passedTime = 0;*/
    return time;
}
time.getTime = getTime;
time.setTimeState = setTimeState;
time.getTimeState = getTimeState;

module.exports = time;
