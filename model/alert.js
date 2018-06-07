var time = require('./time');
var Question = require('./Question');
var io = require('../socket/io').io();
var slideCtrl = require('./slide');
var slide = slideCtrl.getSlide('slide_01');
var tooltip = require('../socket/tooltip');
var rawtime = require('time');
var config = require('../config');

var alert = {};
alert.doneQuestionIDs = [];
alert.doneTerms = [];
alert.reset = () => {
    alert.doneQuestionsIDs = [];
    alert.doneTerms = [];
    alert.lastTimeAlert = 0;
}
alert.lastTimeAlert = 0;
alert.threshold = {
    question : config.question,
    questionOnly : config.questionOnly,
    tooltip :config.tooltip,
    time : config.time
}
alert.slide = slide;

function getClientNo() {
    return io.engine.clientsCount;
}

function getTimeAlert() {
    var slideNo = slide.state.indexh;
    var slideLeftTime = time.slideTime * (slideNo) - time.getTime();
    console.log({time:time.slideTime, slideNo, gottime:time.getTime()});
    if (slideLeftTime <= 0 && rawtime.time() - alert.lastTimeAlert >= alert.threshold.time) {
        alert.lastTimeAlert = rawtime.time();
        return true;
    } else {
        return false;
    }
}

function getQuestionAlert(callback){
    var slideNo = slide.state.indexh;
    Question.find({slideNumber:slideNo}, function(er, res){
        var result;
        var questionFactor = res.filter(function (el, i, a){return !alert.doneQuestionIDs.includes(''+el._id);}).reduce(function (prevVal, elem){return prevVal + elem.like}, 0);
        var slideLeftTime = time.slideTime * (slideNo + 1) - time.getTime();
        if (questionFactor >= alert.threshold.question) {//getClientNo()/3) {
            res.sort(function (a, b) {return b-a;});
            var i = 0;
            for (; i < res.length; i++) {
                if (res[i].like >= alert.threshold.questionOnly) {
                    if (alert.doneQuestionIDs.includes(''+res[i]._id)) {
                        continue;
                    } else {
                        break;
                    }
                }
            }
            if (i == res.length) {
                result = null;
            } else {
                alert.doneQuestionIDs.push(''+res[i]._id);
                console.log(alert.doneQuestionIDs);
                result = res[i];
            }
        } else {
            result = null;
        }
        Question.count({}, (err, count) => {
            let noQuestion = (count <= 0);
            callback(result, slideLeftTime, noQuestion);
        });
    });
}

function getTooltipAlert(){
    var urgents = Object.keys(tooltip.term).filter(function (el, i, a) {
        return tooltip.term[el] >= alert.threshold.tooltip /* getClientNo()*/ && !alert.doneTerms.includes(el);
    });
    if (urgents.length > 0) {
        urgents.sort(function (a, b) {return a-b;});
        var urgent = urgents.pop();
        alert.doneTerms.push(urgent);
        return urgent;
    } else {
        return null;
    }
}

module.exports = {
    alert,
    getTimeAlert,
    getQuestionAlert,
    getTooltipAlert
};
