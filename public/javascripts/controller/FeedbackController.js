var controller = {
    __name: 'hipa.controller.FeedbackController',

    __templates: ['/public/views/feedbackForm.ejs','/public/views/feedbackShow.ejs'],

    socket: null,
    _data: {fast: 0, slow: 0, loud: 0, small: 0},
    _selectedFeedback: {speed: 0, volume: 0},
    __init: function(context) {
      if (config.isPresenter) {
        this.view.update('{rootElement}','feedbackShow');
      } else {
        this.view.update('{rootElement}','feedbackForm', this._selectedFeedback);
      }
      this._setSocket();
    },

    _setSocket: function() {
      if (config.isPresenter) {
        this.socket = io('/socket/feedback/presenter');
        this.socket.on('SpeedFeedback', (data) => {
          this._receivedSpeedFeedback(data);
        });
        this.socket.on('VolumeFeedback', (data) => {
          this._receivedVolumeFeedback(data);
        });
      } else {
        this.socket = io('/socket/feedback/audience');
      }
    },

    _receivedVolumeFeedback(data) {
      if (this._data.loud !== data.loud) {
        this._refreshShow('#feedback-loud-num', data.loud);
      }
      if (this._data.small !== data.small) {
        this._refreshShow('#feedback-small-num', data.small);
      }
      this._data.loud = data.loud;
      this._data.small = data.small;
    },

    _receivedSpeedFeedback(data) {
      if (this._data.fast !== data.fast) {
        this._refreshShow('#feedback-fast-num', data.fast);
      }
      if (this._data.slow !== data.slow) {
        this._refreshShow('#feedback-slow-num', data.slow);
      }
      this._data.fast = data.fast;
      this._data.slow = data.slow;
    },

    _refreshShow(id, text) {
      let $e = $(id);
      $e.addClass('is-focus');
      setTimeout(function() {
        $e.removeClass('is-focus');
      }, 100);
      $e.find('span').text(text);
    },

    _speedFeedback(sign) {
      this.socket.emit('SpeedFeedback', {sign: sign});
      this._selectedFeedback.speed = sign;
      this.view.update('{rootElement}', 'feedbackForm', this._selectedFeedback);
    },

    _volumeFeedback(sign) {
      this.socket.emit('VolumeFeedback', {sign: sign});
      this._selectedFeedback.volume = sign;
      this.view.update('{rootElement}', 'feedbackForm', this._selectedFeedback);
    },

    '.feedback-volume click': function(context, $el) {
      let sign = Number.parseInt($el.attr('sign'));
      this._volumeFeedback(sign);
    },

    '.feedback-speed click': function(context, $el) {
      let sign = Number.parseInt($el.attr('sign'));
      this._speedFeedback(sign);
    }
  };
  h5.core.expose(controller);

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = controller;
