var Script = require('../model/Script');
var io = require('./io').io();
var time = require('../model/time');

var script = {};
script.audience = io.of('/socket/script/audience');
script.presenter = io.of('/socket/script/presenter');
script.presenter.on('connection', (socket) => {
    console.log('connected');

    socket.on('ADD_SCRIPT', function f(data) {
        if (time.state === 'STARTED') {
            console.log(data);
            var s = new Script(data);
            s.save((err, res) => {
                if(err)
                    return;
                else
                    script.audience.emit('ADD_SCRIPT', data);
            });
        }
    });
});
module.exports = script;
