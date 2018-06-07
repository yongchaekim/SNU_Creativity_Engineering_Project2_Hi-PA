var header = require('./testHeader');
var expect = header.expect;
var chai = header.chai;
var express = require('express');
var router = require('../api/question');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use('/', router);
var db = require('../db');
var mongoose = db.mongoose;
var Question = require('../model/Question');

describe('middleware function test', () => {
    before((done) => {
        db.conn();
        Question.remove({}, (err) => {
            var q3 = new Question({question : 'Am I in?', password : '11'});
            q3.save(done);
        });
    });

    after((done) => {
        Question.remove({});
        db.disconnect(done);
    });

    describe('#Question', () => {
        describe('#get', () => {
            it('should return json with right fields', (done) => {
                chai.request(app)
                    .get('/')
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body).to.be.a('array');
                        expect(res.body.length).to.equal(1);
                        expect(typeof res.body[0].id).to.not.equal('undefined');
                        expect(typeof res.body[0]._id).to.equal('undefined');
                        expect(typeof res.body[0].nickname).to.equal('undefined');
                        expect(typeof res.body[0].time).to.equal('number');
                        expect(typeof res.body[0].__v).to.equal('undefined');
                        done();
                    });
            });
        });
        describe('#post', () => {
            it('should add obj if no error', (done) => {
                chai.request(app)
                    .post('/')
                    .send({question : 'Am I posted?', nickname : 'qq', password : '12'})
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        Question.find({}, (error, results) => {
                            expect(results.length).to.equal(2);
                            done();
                        });
                        expect(res.body.nickname).to.equal('qq');
                    });
            });
            it('should fail if obj has no required paths', (done) => {
                chai.request(app)
                    .post('/')
                    .send({question : 'Can I Go In?'})
                    .end((err, res) => {
                        expect(res.status).to.equal(400);
                        Question.find({}, (error, results) => {
                            expect(results.length).to.equal(2);
                            done();
                        });
                    });
            });
            it('should add like if no error', (done) => {
                done();
            });
        });
        describe('#delete', () => {
            it('should delete obj if password matches', (done) => {
                var deleteQ = new Question({question : 'Am I Deleted?', password : 'password'});
                deleteQ.save((err, result) => {
                    expect(typeof result.id).to.not.equal('undefined');
                    chai.request(app)
                        .delete('/'+result.id)
                        .send({password : 'password'})
                        .end((err, response) => {
                            expect(response.status).to.equal(200);
                            Question.find({}, (error, questions) => {
                                expect(questions.length).to.equal(2);
                                done();
                            });
                        });
                });
            });
        });
    });
});
