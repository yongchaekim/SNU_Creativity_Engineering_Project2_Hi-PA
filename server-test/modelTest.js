var header = require('./testHeader');
var expect = header.expect;
var Question = require('../model/Question');
var Script = require('../model/Script');
var db = require('../db');
var url = db.test;

describe('db model test', () => {
    describe('#Question', () => {
        before((done) => {
            db.conn();
            Question.remove({}, done);
        });
        beforeEach((done) => {
            Question.remove({}, done);
        });
        after((done) => {
            Question.remove({});
            db.disconnect(done);
        });
        it('should save object with required paths', (done) => {
            var q1 = new Question({slideNumber : 1, question : "Who am I?", password : "1234"});
            q1.save((err, q) => {
                Question.find({_id : q._id}, (err, result) => {
                    result.length.should.equal(1);
                    done();
                });
            });
        });
        it('should fail if no required paths', (done) => {
            var q1 = new Question({slideNumber : 1});
            q1.save((err,q) => {
                expect(err).to.not.equal(null);
                done();
            });
        });
        it('should hash password', (done) => {
            var q1 = new Question({question : "Does it Hash?", password : "1234"});
            q1.save((err, q) => {
                Question.find({_id:q._id}, (err, results) => {
                    expect(results.length).to.equal(1);
                    expect(results[0].password).to.not.equal("1234");
                    results[0].comparePassword("1234", (err, match) => {
                        expect(match).to.equal(true);
                        done();
                    });
                });
            });
        });
    });
    describe('#Script', () => {
        before((done) => {
            db.conn();
            Script.remove({}, done);
        });
        beforeEach((done) => {
            Script.remove({}, done);
        });
        after((done) => {
            Script.remove({});
            db.disconnect(done);
        });
        it('should save object with required paths', (done) => {
            var s1 = new Script({startSlide : 1, endSlide : 1, text : "script" });
            s1.save((err, q) => {
                Script.find({_id : q._id}, (err, result) => {
                    result.length.should.equal(1);
                    done();
                });
            });
        });
        it('should fail if no required paths', (done) => {
            var s1 = new Script({startSlide : 1});
            s1.save((err,q) => {
                expect(err).to.not.equal(null);
                done();
            });
        });
    });
});

var app = require('express')();
var server = require('http').Server(app);
var io = require('../socket/io').init(server)
var time = require('../model/time');
var alert = require('../model/alert');
var tooltip = require('../socket/tooltip');
var feedback = require('../socket/feedback');

var endState = {state:'END'},
    startState = {state:'STARTED'},
    pauseState = {state:'PAUSED'};
describe('non db model test', () => {
    describe('#time', () => {
        describe('FSM should work', () => {
            it('should start with END', () => {
                time.getTimeState().state.should.equal('END');
            });
            it('should change to start when STARTED', () => {
                time.setTimeState(startState);
                time.getTimeState().state.should.equal('STARTED');
            });
            it('should change to pause when PAUSED', () => {
                time.setTimeState(pauseState);
                time.getTimeState().state.should.equal('PAUSED');
            });
            it('should restart when STARTED', () => {
                time.setTimeState(startState);
                time.getTimeState().state.should.equal('STARTED');
            });
            it('should end when END', () => {
                time.setTimeState(endState);
                time.getTimeState().state.should.equal('END');
            });
        });
        it('should get time in integer',(done) => {
            time.setTimeState(startState);
            setTimeout((d) => {
                time.getTime().should.equal(1);
                time.setTimeState(endState);
                d();
            }, 1200, done);
        });
    });

    describe('#alert', () => {
        before((done) => {
            db.conn();
            time.setTimeState(startState);
            var q = new Question({question : 'hi', password : 'hi', like : 100, slideNumber:0});
            var q1 = new Question({question : 'hi', password : 'hi', like : 0, slideNumber:0});
            q.save(done);
        });
        after((done) => {
            time.setTimeState(endState);
            Question.remove({});
            db.disconnect(done);
        });
        it('should alert question', (done) => {
            alert.getQuestionAlert((question, leftTime, noQuestion) => {
                expect(noQuestion).to.equal(false);
                expect(question).to.not.equal(null);
                done();
            });
        });
        it('should have done question', (done) => {
            alert.alert.doneQuestionIDs.length.should.equal(1);
            alert.getQuestionAlert((question, leftTime, noQuestion) => {
                expect(noQuestion).to.equal(false);
                expect(question).to.equal(null);
                done();
            });
        });
        it('should alert tooltip', () => {
            tooltip.term['tooltip'] = 1000;
            expect(alert.getTooltipAlert()).to.not.equal(null);
        });
        it('should have done tooltip', () => {
            expect(alert.alert.doneTerms.length).to.equal(1);
            expect(alert.getTooltipAlert()).to.equal(null);
        });
        it('should alert time', (done) => {
            time.slideTime = 0;
            alert.alert.threshold.time = 1;
            setTimeout((d) => {
                alert.getTimeAlert().should.equal(true);
                d();
            }, 1900, done);
        });
        it('should not alert time right after', () => {
            alert.getTimeAlert().should.not.equal(true);
        });
        it('should alert after some time', (done) => {
            setTimeout((d) => {
                alert.getTimeAlert().should.equal(true);
                d();
            }, 1600, done);
        });
    });
});

