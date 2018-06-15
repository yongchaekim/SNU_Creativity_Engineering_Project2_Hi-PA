var express = require('express');
var Question = require('../model/Question');
var router = express.Router();
var User = require('../model/user');

function _getQuestion(req, res) {
    Question.find({}, function (err, results) {
        res.json(results);
    });
}

function _postQuestion(req, res, next) {

    var q = new Question(req.body);
    q.save((err, book) => {
        if (err) {
            switch (err.name) {
                case 'ValidationError':
                    res.sendStatus(400);
                    break;
                default:
                    res.sendStatus(500);
                    break;
            }
        } else {
            res.status(200).json(q);
            res.locals.q = q;
            next();
        }
    });
}

function _deleteQuestion(req, res, next) {
    Question.findById(req.params.id, (err, result) => {
        if (err) {
            switch(err.name) {
            }
            res.sendStatus(500);
        } else {
            if (result === null) {
                res.sendStatus(404);
            } else {
                result.comparePassword(req.body.password, (err, isRight) => {
                    if (err) {
                    } else if (isRight) {
                        Question.remove(result, (err, r) => {
                            res.sendStatus(200);
                            res.locals.id = req.params.id;
                            next();
                        });
                    } else {
                        res.sendStatus(401);
                    }
                });
            }
        }
    });
}

function _likeQuestion(req, res, next) {
    Question.findById(req.params.id, (err, result) => {
        if (err) {
            res.sendStatus(500);
        } else {
            if (result === null) {
                res.sendStatus(404);
            } else {
                result.like += 1;
                result.save((err, result)=>{
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(200);
                        res.locals.q = result;
                        next();
                    }
                });
            }
        }
    });
}

function _dislikeQuestion(req, res, next) {
    Question.findById(req.params.id, (err, result) => {
        if (err) {
            res.sendStatus(500);
        } else {
            if (result === null) {
                res.sendStatus(404);
            } else {
                result.like -= 1;
                result.save((err, result) => {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(200);
                        res.locals.q = result;
                        next()
                    }
                });
            }
        }
    });
}

router.get('/', _getQuestion);
router.post('/', _postQuestion);
router.delete('/:id', _deleteQuestion);
router.put('/like/:id', _likeQuestion);
router.put('/dislike/:id', _dislikeQuestion);

module.exports = router;
