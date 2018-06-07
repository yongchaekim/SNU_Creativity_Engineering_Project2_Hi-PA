var mongoose = require('mongoose');

// Schema
var Schema = mongoose.Schema;
var scriptSchema = new Schema({
    startSlide : { type : Number, required : true },
    endSlide : { type : Number, required : true },
    text :{ type : String, required : true },
    time : { type : Date, default : Date.now }
});

function _transformer (doc, ret, options) {
    ret.id = ret._id;
    ret.time = ret.time.getTime();
    delete ret._id;
    delete ret.__v;
}
scriptSchema.set('toJSON', { virtuals : true, transform : _transformer});
var Script = mongoose.model('Script', scriptSchema);
Script.reset = () => {
    Script.remove({}).exec();
}
module.exports = Script;
