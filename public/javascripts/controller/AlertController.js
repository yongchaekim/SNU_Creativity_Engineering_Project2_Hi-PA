var alertController = {
  __name: 'hipa.controller.AlertController',
  questionDataModel: 'hipa.data.questionDataModel',
  socket: null,
  alarm_queue: [],
  alerttime: {
    'question': -1,
    'time': -1,
    'volume': -1,
    'speed': -1
  },
  __construct: function(){
    socket = io('/socket/alert/presenter');
    socket.on('Alert', (data) => {this._handle_data(data);});
    socket.on('UrgentAlert', (data) => {this._handle_question_data(data);});
  },

  _check_time: function(k) {
    var t = this.alerttime[k];
    return (t == -1 || Date.now() - t >= config.alertTimeLimit);
  },

  // this function handles question and tooltip
  _handle_question_data: function(data) {
    var content; 
    var timeout = () => {
      if (data['leftTime'] < config.questionTimeLimit) {
        if (this._check_time('time')) {
          content = "Since we are out of time, let's go to the next slide";
          this._alert(content);
          this.alerttime['time'] = Date.now();
        }
        return true;
      }
      return false;
    }
    if (data['questionID'] !== null) {
      if(timeout()) return;
      var qid = data['questionID'];
      content = "There is a question! ";
      content += data.question.question;
    } else if (data['tooltip'] !== null) {
      if(timeout()) return;
      content = "Many audiences are curious about the meaning of "+data['tooltip'];
    } else if (data['noQuestion'] === true && this._check_time('question')) {
      content = "There is no question. Everyone, you can ask more and more.";
      this.alerttime['question'] = Date.now();
    } else {
      return;
    }
    this._alert(content);
  },


  // this function handles realtimefeedback and time
  _handle_data: function(data) {
    if (data['timeAlert']) {
      this._alert(this._get_alert_content('time', data['duration']-data['passedTime']));
    }
    var rf = data['realtimefeedback'];
    for (key in rf) {
      if (rf[key]!==0 && this._check_time(key)) {
        this._alert(this._get_alert_content(key, rf[key]));
        this.alerttime[key] = Date.now();
      }
    }
  },

  _queue: [],
  _isAlerting: false,
  _alertMsg : null,

  _alert: function(content) {
    this._queue.push(content);
    if (!this._isAlerting) {
      this._alertQueuePop();
    }
  },

  _alertQueuePop: function() {
    this._isAlerting = true;
    let content = this._queue.shift();
    if (content === null) {
      return;
    }
    this._append_html(content);
    var msg = new SpeechSynthesisUtterance(content);
    // This is for browser GC bug.
    // link : https://stackoverflow.com/a/35935851
    this._alertMsg = msg;
    msg.lang = 'en-US';
    msg.rate = 1.3;
    window.speechSynthesis.speak(msg);
    msg.onend = (event) => {
      if (this._queue.length !== 0) {
        this._alertQueuePop();
      } else {
        this._isAlerting = false;
      }
    }
  },

  _append_html: function(content) {
    let talkingBalloonDiv = '<div class="talk-bubble" style="display:none;"><div class="talktext"><p>' + content + '</p></div></div>'
    let $tmp = $(talkingBalloonDiv).appendTo('#talkingballoon-container');
    $tmp.show(1000);
    setTimeout(function() {
      $tmp.hide(1000);
    }, 5000);

  },

  _get_alert_content: function(type, value){
    if (type === 'time') {
      var content = "Lack of time!";
      if (value >= 0) content += " You have " + Math.floor(value) + " seconds remaining.";
      else content += " You have " + Math.floor(-value) + " seconds overtime.";
      return content;
    }
    var state;
    if (type === 'volume') {
      if(value === 1) state = 'loud';
      else state = 'quiet';
    } else {
      if (value === 1) state = 'fast';
      else state = 'slow';
    }
    return "Presentation is too " + state + ".";
  }
};

h5.core.expose(alertController);

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = alertController;
