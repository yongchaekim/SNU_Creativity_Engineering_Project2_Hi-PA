var timeController = {
  __name: 'hipa.controller.TimeController',
  socket: null,
  time: hipa.logic.Time,
  _count_time: null,
  _status: null,
  __construct: function(){
    this._status = 'END';
    this.time = hipa.logic.Time;
    this.socket = io('/socket/time/presenter');
  },
  __ready: function(context){
    this._status = 'END';
    return h5.ajax({
      type: 'GET',
      dataType: 'JSON',
      url: config.url + '/time/state'
    }).then((data) => {
      this.time.set(data['duration'], data['passedTime']);
    }).fail((error) => {
      console.log(error);
    });
  },
  __init: function(){
    this._status = 'END';
  },
  '#start_button click': function() {
    this._emit_state('STARTED');
    this._count_time = setInterval(()=>{
      var time_info = this.time.update();
      this.socket.emit('tick',{time:this.time._passedTime});
      $('#time_info').html(time_info);
    }, 1000);
  },
  '#pause_button click': function() {
    this._emit_state('PAUSED');
    clearInterval(this._count_time);
  },
  '#stop_button click': function() {
    this._emit_state('END');
    clearInterval(this._count_time);
    this.time.init();
  },
  _emit_state: function(state) {
    this._status = state;
    console.log(this._status);
    this.socket.emit('SetTimeState', {'state': state});
  },
  get_status: function(){
    return this._status;
  }
  // get api/time/state??
};

h5.core.expose(timeController);
