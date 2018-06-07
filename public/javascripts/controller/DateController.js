
var dateController = {
  __name: 'DateController',
  date: date,
  __ready: function(context){
    this._update();
  },
  '#date_button click': function(context, $button){
    this._update();
  },
  _update: function(){
    var current = this.date.getCurrent(new Date());
    this.$find('#current_date').html(current);
  }
}


