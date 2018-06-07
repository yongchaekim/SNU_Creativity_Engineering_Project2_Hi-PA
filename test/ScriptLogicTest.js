var header = require('./testHeader');
var expect = header.expect;
var chai = header.chai;
var sinon = header.sinon;
var jquery = header.jquery;

require('./testForh5');

var scriptLogic = require('../public/javascripts/logic/ScriptLogic');

describe('ScriptLogic', function() {

    describe('getResult', function() {
        var event = {results: [], resultIndex: 0}

        function checkResult(result, final, interim) {
            expect(result.final_span).equal(final);
            expect(result.interim_span).equal(interim);
        }

        function createData(isFinal, transcript) {
            let ret = [{transcript}];
            ret.isFinal = isFinal;
            return ret;
        }

        function appendData(isFinal, transcript) {
            event.results.push(createData(isFinal, transcript));
        }

        beforeEach(function() {
            event.results = [];
            event.resultIndex = 0;
            scriptLogic.__mouth_open = true;
        });

        it('test1', function() {
            appendData(false, 'TESTTEST1');
            let result = scriptLogic.getResult(event);
            checkResult(result, '', 'TESTTEST1');
        });

        it('test2', function() {
            appendData(false, 'TESTTEST1');
            appendData(false, 'TESTTEST2');
            let result = scriptLogic.getResult(event);
            checkResult(result, '', 'TESTTEST1TESTTEST2');
        });

        it('test3', function() {
            appendData(true, 'TESTTEST1');
            appendData(false, 'TESTTEST2');
            let result = scriptLogic.getResult(event);
            checkResult(result, 'TESTTEST1.', 'TESTTEST2');
        });

        it('test4', function() {
            appendData(true, 'testtest1');
            appendData(true, 'testtest2');
            let result = scriptLogic.getResult(event);
            checkResult(result, 'Testtest1testtest2.', '');
        });

        it('test5', function() {
            appendData(true, 'test1 \n test2 \n\n test3');
            let result = scriptLogic.getResult(event);
            checkResult(result, 'Test1 <br> test2 <p></p> test3.', '');
        });
    });
});
