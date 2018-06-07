var header = require('./testHeader');
var expect = header.expect;
var chai = header.chai;
var sinon = header.sinon;
var jquery = header.jquery;

require('./testForh5');

var tooltipController = require('../public/javascripts/controller/TooltipController');

describe('TooltipController', function() {
    describe('_parseWiki', function() {
        function testHelper(element) {
            let result = tooltipController._parseWiki(element);
            expect(result.text.includes('<')).equal(false);
            expect(result.text.includes('>')).equal(false);
        }
        function testHelper2(element, text) {
            let result = tooltipController._parseWiki(element);
            expect(result.text.includes(text)).equal(true);
        }
        it('hello.json', function() {
            let helloJson = require('./wiki/hello.json');
            let list = helloJson.query.search;
            list.forEach(function(element) {
                testHelper(element);
            });
        });
        it('socket.json', function() {
            let helloJson = require('./wiki/socket.json');
            let list = helloJson.query.search;
            list.forEach(function(element) {
                testHelper(element);
            });
        });
        it('test.json', function() {
            let helloJson = require('./wiki/test.json');
            let list = helloJson.query.search;
            list.forEach(function(element) {
                testHelper(element);
            });
        });
        it('hello.json specific test', function() {
            let helloJson = require('./wiki/hello.json');
            let list = helloJson.query.search;
            testHelper2(list[0], 'Hello is a salutation or greeting in the English language.');
            testHelper2(list[1], 'Hello Kitty (Japanese: ハロー・キティ?, Hepburn: Harō Kiti)');
            testHelper2(list[2], 'Hello! Project (ハロー!プロジェクト?, Harō! Purojekuto) is a Japanese idol');
        });
        it('custom string', function() {
            function createData(title, snippet) {
                return {title, snippet};
            }
            function customTest(title, snippet, expected) {
                let result = tooltipController._parseWiki(createData(title, snippet));
                expect(result.title).equal(title);
                expect(result.text).equal(expected);
            }

            customTest('ant',
                '<h4>ant</h4> is just another way of <strong>dealing</strong>',
                'ant is just another way of dealing');
            customTest('test',
                '<h1>Unit test</h1> : is different from integration <div> test <ul><li>in</li></ul></div>',
                'Unit test : is different from integration  test in');
        });
    });
});
