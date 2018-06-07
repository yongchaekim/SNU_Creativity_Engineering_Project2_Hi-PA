var express = require('express');
var router = express.Router();
var Script = require('../model/Script');

function _getScript(req, res) {
    Script.find({}, function (err, results) {
        res.status(200).json(results);
    });
}
router.get('/', _getScript);

module.exports = router;
