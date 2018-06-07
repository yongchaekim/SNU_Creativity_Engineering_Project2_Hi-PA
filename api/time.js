var express = require('express');
var router = express.Router();
var time = require('../model/time');

function _getTimeState(req, res, next) {
    res.json(time.getTimeState());
    next();
}
router.get('/state', _getTimeState);
module.exports = router;
