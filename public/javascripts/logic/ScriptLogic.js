var speechRecognition = {
    __name: 'SpeechRecognition',
    __recognizing: false,
    __ignore_onend: false,
    __recognition: null,
    __mouth_open: false,
    __restartTimer: null,
    // initializer
    initialize: function(){
      this.__recognition = new webkitSpeechRecognition();
      this.__recognition.continuous = true;
      this.__recognition.interimResults = true;
      this.__recognition.lang = 'en-US';
    },
    // init setting when restart recognizing
    start: function(){
      this.__ignore_onend = false;
      this.__recognition.start();
      this.setRestartTimer();
    },
    stop: function(){
      this.__recognition.stop();
      this.removeRestartTimer();
    },

    restart: function() {
      this.__recognition.stop();
      this.setRestartTimer();
    },

    setRestartTimer: function() {
      this.removeRestartTimer();
      this.__restartTimer = setTimeout(()=>{
        this.__restartTimer = null;
        this.restart();
      }, 2000);
    },
    removeRestartTimer: function() {
      if (this.__restartTimer !== null) {
        clearTimeout(this.__restartTimer);
        this.__restartTimer = null;
      }
    },

    setEventHandlers: function(error_function, result_function){
      this.__recognition.onstart = () => {
        // console.log('start');
      };
      this.__recognition.onerror = (e) => {error_function(e)};
      this.__recognition.onend = () => {
        if (this.__recognizing) this.start();
        // console.log('end')
      };
      this.__recognition.onresult = (e) => {
        this.setRestartTimer();
        result_function(e);
      };
      /*
      this.__recognition.onaudiostart = () => {console.log('onaudiostart');};
      this.__recognition.onaudioend = () => {console.log('onaudioend');};
      this.__recognition.onsoundstart = () => {console.log('onsoundstart');};
      this.__recognition.onsoundend = () => {console.log('onsoundend');};
      this.__recognition.onnomatch = () => {console.log('onnomatch');};
      this.__recognition.onspeechstart = () => {console.log('onspeechstart');};
      this.__recognition.onspeechend = () => {console.log('onspeechend');};
      */
    },
    // set&get methods
    setRecognizing: function(recognizing){
      this.__recognizing = recognizing;
    },
    getRecognizing: function(){
      return this.__recognizing;
    },
    setIgnoreOnend: function(ignore_onend){
      this.__ignore_onend = ignore_onend
    },
    getIgnoreOnend: function(){
      return this.__ignore_onend;
    },
    setMouthOpen: function(mouth_open){
      this.__mouth_open = mouth_open;
    },
    // get transcript from event
    getResult: function(event){
      var final_transcript = '';
      var interim_transcript = '';
      var add_final = false;
      if (typeof(event.results) == 'undefined') {
        final_transcript += one_line;
      }
      else if (this.__mouth_open) {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          var result = event.results[i];
          if (result.isFinal) {
            if (add_final){
              final_transcript += result[0].transcript;
            }else{
              add_final = true;
              final_transcript += this._capitalize(result[0].transcript);
            }
          } else {
            interim_transcript += result[0].transcript;
          }
        }
        if (add_final)
          final_transcript = this._capitalize(final_transcript) + '.';

        final_transcript = this._linebreak(final_transcript);
        interim_transcript = this._linebreak(interim_transcript);

      }
      return {
        'final_span': final_transcript,
        'interim_span': interim_transcript
      };
    },

    // helper functions
    _linebreak: function(s){
      var two_line = /\n\n/g;
      var one_line = /\n/g;
      return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
    },
    _capitalize: function(s){
      var first_char = /\S/;
      return s.replace(first_char, function(m) { return m.toUpperCase(); });
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = speechRecognition;
