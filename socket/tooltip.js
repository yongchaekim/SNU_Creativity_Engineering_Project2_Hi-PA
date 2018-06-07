var io = require('./io').io();
var tooltip = {term:{}};

tooltip.audience = io.of('/socket/tooltip/audience');
tooltip.audience.on('connect', function (socket) {
    socket.on('Searched', function (data) {
        if (typeof tooltip.term[data.term] === 'undefined') {
            tooltip.term[data.term] = 0;
        }
        tooltip.term[data.term]++;
    });
});
module.exports = tooltip;
