var mongoose = require('mongoose');
let test = 'mongodb://localhost/test';
let prod = 'mongodb://localhost/Hi-PA';
mongoose.conn = function () {
    if (process.env.TEST == 'true') {
        mongoose.connect(test);
    } else {
        mongoose.connect(test);
    }
}
module.exports = mongoose;
