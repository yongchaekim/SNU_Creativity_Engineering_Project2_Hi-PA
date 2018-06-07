var header = require('./testHeader');
var expect = header.expect;
var chai = header.chai;
var sinon = header.sinon;
var jquery = header.jquery;

require('./testForh5');

var alertController = require('../public/javascripts/controller/AlertController');

describe('AlertController', function() {
    before(function() {
        alertController.socket = {emit: function(){}};
        sinon.stub(alertController, '_alertQueuePop');
        //sinon.stub(console,'log');
    });

    after(function() {
        delete alertController.view;
        alertController.socket = null;
        alertController._alertQueuePop.restore();
        //console.log.restore();
    });

    beforeEach(function() {
        alertController.alerttime = {
            'question': -1,
            'time': -1,
            'volume': -1,
            'speed': -1
        };
    });

    describe('check_time', function() {

        it('when no check_time', function() {
            expect(alertController._check_time('time', 0)).to.equal(true);
        });

        describe('when there is check_time', function() {
            beforeEach(function() {
                alertController.alerttime['time'] = 10;
            });
            afterEach(function() {
                alertController.alerttime['time'] = -1;
            });

            it('when over 30', function() {
                expect(alertController._check_time('time', 41)).to.equal(true);
            });

            it('when under 30', function() {
                expect(alertController._check_time('time', 20)).to.equal(false);
            });
        });
    });

    describe('handle_question_data', function() {
        function generateData(leftTime, questionID, question, tooltip) {
            return {leftTime, questionID, question : {question: question}, tooltip};
        }

        var stubAlert;

        beforeEach(function() {
            stubAlert = sinon.stub(alertController, '_alert');
        });

        afterEach(function() {
            stubAlert.restore();
        });

        it('not much time', function() {
            let data = generateData(10, null, null, null);
            alertController._handle_question_data(data);
            expect(stubAlert.withArgs("Since we are out of time, let's go to the next slide").calledOnce).equal(true);
            stubAlert.reset();
            alertController._handle_question_data(data);
            expect(stubAlert.notCalled).equal(true);
        });

        it('question', function() {
            let data = generateData(60, '102', 'ASDFASDF', null);
            alertController._handle_question_data(data);
            expect(stubAlert.calledOnce).equal(true);
            expect(stubAlert.args[0][0].includes('ASDFASDF')).equal(true);

            stubAlert.reset();

            data = generateData(60, '102', 'ASDFASDF', 'tooltip');
            alertController._handle_question_data(data);
            expect(stubAlert.calledOnce).equal(true);
            expect(stubAlert.args[0][0].includes('ASDFASDF')).to.equal(true);
        });

        it('tooltip', function() {
            let data = generateData(60, null, null , 'QWERQWER');
            alertController._handle_question_data(data);
            expect(stubAlert.calledOnce).equal(true);
            expect(stubAlert.args[0][0].includes('QWERQWER')).to.equal(true);
        });

        it('no question', function() {
            let data = generateData(60, null, null , null);
            alertController._handle_question_data(data);
            expect(stubAlert.calledOnce).equal(true);
            expect(stubAlert.args[0][0].includes('no question')).to.equal(true);
        });
    });

    describe('_handle_data & get alert content', function() {
        function generateData(timeAlert, duration, passedTime, volume, speed) {
            return {timeAlert, duration, passedTime, realtimefeedback: {volume, speed}};
        }

        var stubAlert;

        beforeEach(function() {
            stubAlert = sinon.stub(alertController, '_alert');
        });

        afterEach(function() {
            stubAlert.restore();
        });

        it('time alert', function() {
            let data = generateData(true, 999, 9, 0, 0);
            alertController._handle_data(data);
            expect(stubAlert.calledOnce).equal(true);
            expect(stubAlert.args[0][0].includes('990')).to.equal(true);
        });

        describe('feedback alert', function() {
            function THIncludeWord(volume, speed, includeWord) {
                let data = generateData(false, 999, 9, volume, speed);
                alertController._handle_data(data);
                expect(stubAlert.calledOnce).equal(true);
                expect(stubAlert.args[0][0].includes(includeWord)).to.equal(true);
                stubAlert.resetHistory();
            }

            function THNeverCalled(volume, speed) {
                let data = generateData(false, 999, 9, volume, speed);
                alertController._handle_data(data);
                expect(stubAlert.notCalled).equal(true);
            }

            it('loud', function() {
                THIncludeWord(1,0,'loud');
                THNeverCalled(-1,0);
            });

            it('quiet', function() {
                THIncludeWord(-1,0,'quiet');
                THNeverCalled(-1,0);
            });

            it('fast', function() {
                THIncludeWord(0,1,'fast');
                THNeverCalled(0,-1);
            });

            it('slow', function() {
                THIncludeWord(0,-1,'slow');
                THNeverCalled(0,1);
            });

            it('combined', function() {
                THIncludeWord(1,0,'loud');
                THIncludeWord(0,1,'fast');
                THNeverCalled(1,0);
                THNeverCalled(0,0);
            })
        });
    });
});