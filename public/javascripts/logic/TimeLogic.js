var time = {
  __name: 'hipa.logic.Time',
  _duration1: [0,0,0],
  _passedTime: [0,0,0],
  init: function() {
    this._passedTime = [0,0,0];
  },
  set: function(duration, passedTime) {
    this._duration1 = this._sec2time(duration);
    this._passedTime = this._sec2time(passedTime);
  },
  update: function() {
    this._passedTime[2] = this._passedTime[2] + 1;
    if (this._passedTime[2] === 60) {
      this._passedTime[2] = 0;
      this._passedTime[1] = this._passedTime[1] + 1;
      if (this._passedTime[1] === 60) {
        this._passedTime[1] = 0;
        this._passedTime[0] = this._passedTime[0] + 1;
      }
    }
    return this._format(this._duration1, this._passedTime);
  },
  _format: function(t1, t2){
    let s1 = t1.map((s) => (this._format_string(s)));
    let s2 = t2.map((s) => (this._format_string(s)));
    return `${s1[0]}:${s1[1]}:${s1[2]} / ${s2[0]}:${s2[1]}:${s2[2]}`;
  },
  _format_string: function (s) {
    var str = s.toString();
    return (str.length==1)? '0' + str: str;
  },
  _sec2time: function(tot) {
    var hr = Math.floor(tot/3600);
    var min = Math.floor((tot - 3600*hr)/60);
    var sec = tot - 60*min - 3600*hr;
    return [hr, min, sec];
  }

};

h5.core.expose(time);

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = time;
