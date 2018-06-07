var header = require('./testHeader');
var expect = header.expect;
var Question = require('../model/Question');
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
        it('should be empty', (done) => {
            Question.find({}, (err, result) => {
                expect(result.length).to.equal(0);
                done();
            });
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
});
