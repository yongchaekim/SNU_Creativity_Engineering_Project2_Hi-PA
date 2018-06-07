var header = require('./testHeader');
var expect = header.expect;
var chai = header.chai;
var sinon = header.sinon;
var jquery = header.jquery;

require('./testForh5');

var timeLogic = require('../public/javascripts/logic/TimeLogic');

describe('TimeLogic', function() {
    beforeEach(function() {
        timeLogic._duration1 = [0,0,0];
        timeLogic._passedTime = [0,0,0];
    });

    function timeToSec(hour, min, sec) {
        return hour * 3600 + min * 60 + sec;
    }

    function setTime(hour, min, sec, hour2, min2, sec2) {
        timeLogic.set(timeToSec(hour,min,sec), timeToSec(hour2,min2,sec2));
    }

    it('set', function() {
        timeLogic.set(timeToSec(4,5,6), timeToSec(1,2,3));
        expect(timeLogic._duration1).to.deep.equal([4,5,6]);
        expect(timeLogic._passedTime).to.deep.equal([1,2,3]);
    });

    describe('update', function() {
        it('test1', function() {
            timeLogic.set(timeToSec(4,5,6), timeToSec(1,2,3));
            let ret = timeLogic.update();
            expect(timeLogic._passedTime).to.deep.equal([1,2,4]);
            expect(ret.includes('04:05:06')).equal(true);
        });

        it('test2', function() {
            timeLogic.set(timeToSec(4,5,6), timeToSec(1,2,59));
            let ret = timeLogic.update();
            expect(timeLogic._passedTime).to.deep.equal([1,3,0]);
        });

        it('test3', function() {
            timeLogic.set(timeToSec(4,5,6), timeToSec(1,59,59));
            let ret = timeLogic.update();
            expect(timeLogic._passedTime).to.deep.equal([2,0,0]);
        });
    });

    it('_format', function() {
        let ret = timeLogic._format([1,2,3], [4,5,6]);
        expect(ret).equal('01:02:03 / 04:05:06');
    });

    it('_format_string', function() {
        expect(timeLogic._format_string(0)).equal('00');
        expect(timeLogic._format_string(6)).equal('06');
        expect(timeLogic._format_string(9)).equal('09');
        expect(timeLogic._format_string(11)).equal('11');
        expect(timeLogic._format_string(25)).equal('25');
        expect(timeLogic._format_string(59)).equal('59');
    });

    it('_sec2time', function() {
        function checkHelper(hour, min, sec) {
            expect(timeLogic._sec2time(timeToSec(hour,min,sec))).deep.equals([hour,min,sec]);
        }
        checkHelper(0,0,0);
        checkHelper(0,0,59);
        checkHelper(0,59,0);
        checkHelper(0,59,59);
        checkHelper(1,0,0);
        checkHelper(0,25,3);
        checkHelper(5,2,6);
    });
});