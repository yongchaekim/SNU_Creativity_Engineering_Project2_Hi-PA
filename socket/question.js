var express = require('express');
var Question = require('../model/Question');
var router = express.Router();
var io = require('./io').io();
var questionIO = io.of('/socket/question');

function _broadcastAdd(req, res, next) {
    let q = res.locals.q;
    questionIO.emit('ADD_QUESTION', q);
    console.log('added');
    next();
}

function _broadcastDelete(req, res, next) {
    let id = res.locals.id;
    questionIO.emit('DELETE_QUESTION', {id:id});
    next();
}

function _broadcastUpdate(req, res, next) {
    let q = res.locals.q;
    questionIO.emit('UPDATE_QUESTION', {id:q.id, like_cnt:q.like});
    next();
}

router.post('/', _broadcastAdd);
router.delete('/:id', _broadcastDelete);
router.put('/like/:id', _broadcastUpdate);
router.put('/dislike/:id', _broadcastUpdate);
router.io = questionIO;

module.exports = router;
