var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

// Schema
var Schema = mongoose.Schema;
var questionSchema = new Schema({
    slideNumber : Number,
    question : { type : String, required : true },
    nickname : String,
    password : { type : String, required : true },
    timeline_flags : String,
    like : { type : Number, default : 0 },
    time : { type : Date, default : Date.now }
});

// hash password when save
questionSchema.pre('save', function (next) {
    var question = this;
    // generate hash
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err)
            return next(err);
        bcrypt.hash(question.password, salt, function (err, hash) {
            if (err)
                return next(err);
            question.password = hash;
            next();
        });
    });
});

// comaprison with salt
questionSchema.methods.comparePassword = function (inputPassword, callback) {
    bcrypt.compare(inputPassword, this.password, (err, match) => {
        if (err)
            return callback(err);
        callback(null, match);
    });
}


// change _id to id
function _transformer (doc, ret, options) {
    ret.id = ret._id;
    ret.time = ret.time.getTime();
    delete ret._id;
    delete ret.password;
    delete ret.__v;
}
questionSchema.set('toJSON', {virtuals : true, transform : _transformer});
var Question = mongoose.model('Question', questionSchema);
Question.reset = function () {
    Question.remove({}).exec();
}

module.exports = Question;
