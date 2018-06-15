var manager = h5.core.data.createManager ( 'DataManager' , 'hipa.data' );
var questionDataModel = manager.createModel({
  name: 'QuestionDataModel',
  schema: {
    id : {
      id : true
    },
    question : { type: 'string' },
    slideNumber: { type: 'number' },
    slideNumberText: {
      depend: {
        on: 'slideNumber',
        calc: function() {
          const slideNumber = this.get('slideNumber');
          if (slideNumber === null) return '';
          return '(Slide ' + slideNumber + ')';
        }
      }
    },
    nickname: { type: 'string' },
    nicknameValue: {
      depend: {
        on: 'nickname',
        calc: function() {
          const nickname = this.get('nickname');
          if (nickname === null || nickname === '')
            return 'Anonymous';
          return nickname;
        }
      }
    },
    like: { type: 'integer', defaultValue: 0},
    time: { type: 'integer' },
    timeString : {
      depend: {
        on: 'time',
        calc: function() {
          const date = new Date(this.get('time'));
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const year = date.getYear() - 100;
          const hour = date.getHours();
          const ampm = hour > 13 ? 'PM' : 'AM';
          const hourIn12 = (hour - 1) % 12 + 1;
          const min = date.getMinutes();
          return day +'/'+ month+ '/' + year + '\n' + hourIn12 + ':'+ ('0' + min).slice(-2) + ' ' + ampm;
        }
      }
    },
    timeline_flags : { type: 'string' },
    //timeline_flags_value : {
     // depend: {
       // on : 'timeline_flags',
       // calc: function() {
         // const timeline_flags = this.get('timeline_flags');
         // return timeline_flags;
        //}
      //}
    //},
    isLiked: { type: 'boolean', defaultValue: false },
    likeBtnClass: {
      depend: {
        on: 'isLiked',
        calc: function() {
          return (this.get('isLiked') ? 'fa fa-heart' : 'fa fa-heart-o');
        }
      }
    },
  },
});

h5.u.obj.expose('hipa.data', {
  QuestionDataModel: questionDataModel
});
