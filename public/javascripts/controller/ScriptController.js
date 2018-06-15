var pipe=["","","","",""];
var state="";

var scriptController = {
  __name: 'hipa.controller.ScriptController',
  __templates: ['/public/views/script-control.ejs', '/public/views/script-result.ejs', '/public/views/script-face.ejs'],

  recognition: speechRecognition,
  socket: null,
    
  // for mouth recognition
  __mouth_threshold: 0,
  __vid: null,
  __overlay: null,
  __overlayCC: null,
  __ctrack: null,
  __stats: null,
  __pause: true,
  __is_presenter: config.isPresenter,
  __pre_start_slide_num: -1,
  __pre_end_slide_num: -1,
  __start_slide_num: -1,
  __end_slide_num: -1,
  __stopwords: null,

  //initializer
  __construct: function() {


    if(this.__is_presenter) {
      this.socket = io('/socket/script/presenter');
    } else {
      this.socket = io('/socket/script/audience');
      this.socket.on('ADD_SCRIPT', (data) => {
        this._handle_script(data);
      });
      this.socket.on('DELETE_ALL', (data) => {
        $('#final_span').empty();
        $('#interim_span').empty();
      });
    }
  },
  __init: function(context){
    this.view.update('#script-result', 'script-result', null);

    if (this.__is_presenter) {
      this.view.update('#script-control', 'script-control', null);
      this.view.update('#script-face', 'script-face', null);
      this.__ready_presenter();
    } else {
      document.getElementById('script-result').style.width = '97%'
    }

    var txtFile = "/public/javascripts/stopWords.json";
    jQuery.get(txtFile, undefined, (data)=>{
      var stopwords = JSON.parse(data);
      this.__stopwords = stopwords;
      this._get_past_script();
    }, "html").done(function() {
    }).fail(function(jqXHR, textStatus) {
    }).always(function() {
    });

  },

  __ready_presenter: function(){
    // speech recognition api
    this.recognition.initialize();
    this.recognition.setEventHandlers(
        (event)=>{this._recognition_error(event);},
        (event)=>{this._recognition_result(event);}
        );

    // face recognition api
    this.__vid = document.getElementById('videoel');
    this.__overlay = document.getElementById('overlay');
    this.__overlayCC = this.__overlay.getContext('2d');

    this.__ctrack = new clm.tracker({useWebGL : true});
    this.__ctrack.init(pModel);

    this.__stats = new Stats();
    this.__stats.domElement.style.position = 'absolute';
    this.__stats.domElement.style.top = '0px';
    this.__stats.domElement.style.visible = 'none';
    document.getElementById('content').appendChild( this.__stats.domElement );

    this.__vid.addEventListener('canplay', this._enablestart, false);
    this._enablestart(false);
    var insertAltVideo = function(video) {
      path_to_media = "public/lib/clmtrackr/media/";
      if (supports_video()) {
        if (supports_ogg_theora_video()) {
          video.src = path_to_media + "cap12_edit.ogv";
        } else if (supports_h264_baseline_video()) {
          video.src = path_to_media + "cap12_edit.mp4";
        } else {
          return false;
        }
        return true;
      } else {
        return false;
      }
    }

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
    var vid = this.__vid;

    // check for camerasupport
    if (navigator.getUserMedia) {
      // set up stream

      var videoSelector = {video : true};
      if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
        var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
        if (chromeVersion < 20) {
          videoSelector = "video";
        }
      };

      navigator.getUserMedia(videoSelector, function( stream ) {
        if (vid.mozCaptureStream) {
          vid.mozSrcObject = stream;
        } else {
          vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }
        vid.play();
      }, function() {
        insertAltVideo(vid);
        //document.getElementById('gum').className = "hide";
        //document.getElementById('nogum').className = "nohide";
        alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
      });

    } else {
      insertAltVideo(vid);
      document.getElementById('gum').className = "hide";
      document.getElementById('nogum').className = "nohide";
      alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
    }
    document.addEventListener('clmtrackrIteration', this.__stats.update, false);
  },

  //_recognition event handlers
  _recognition_error: function(event) {
    if(event.error == 'no-speech'){
      this.showInfo('info_no_speech');
      this.recognition.setIgnoreOnend(true);
    }else if(event.error == 'audio-capture'){
      this.showInfo('info_no_microphone');
      this.recognition.setIgnoreOnend(true);
    }else if(event.error == 'not-allowed'){
      this.showInfo('info_denied');
      this.recognition.setIgnoreOnend(true);
    }
  },
  _recognition_result: function(event){
    var script = this.recognition.getResult(event);
    if (script.final_span === "" && script.interim_span !== "") {
      this.__start_slide_num = this._get_current_slide_num();
    } else if (script.final_span !== "") {
      this.__end_slide_num = this._get_current_slide_num();
    }
    script = $.extend(script, {'start_slide':this.__start_slide_num, 'end_slide':this.__end_slide_num});
    this._display_script(script);
    if (script.final_span !== "")
      this._broadcast_script(script);;
  },

  _get_past_script: function(){
    return h5.ajax({
      type: 'GET',
      dataType: 'JSON',
      url: config.url + '/script'
    }).then((data) => {
      for (var i=0; i<data.length; i++)
        this._handle_script(data[i]);
    });
  },

  _broadcast_script: function(script){
    var data = {
      'startSlide': script.start_slide,
      'endSlide': script.end_slide,
      'text': script.final_span
    };
    this.socket.emit('ADD_SCRIPT', data);
  },

  _handle_script: function(script){
    this._display_script({
        'start_slide': script.startSlide,
        'end_slide': script.endSlide,
        'final_span': script.text,
        'interim_span': ''
    });
    this.__start_slide_num = script.startSlide;
    this.__end_slide_num = script.endSlide;
  },
    
    _make_action: function(el, etype){
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
},
    
  _process_word: function(item,index) {
    if(item==""){
        return;
    }
    
    pipe.push(item);
    pipe.shift();
      
      if(state=="answer"){
          
          document.getElementById("txt").value += " "+item;
      }
      
      if (pipe[3]=="assistant" & pipe[4]=="next"){
        
        var e = new Event("keydown");
        e.keyCode=39;
        e.which=e.keyCode;
        e.metaKey=false;
        e.bubbles=true;
        document.dispatchEvent(e);
      }
      
      if (pipe[3]=="assistant" & pipe[4]=="previous"){
        
        var e = new Event("keydown");
        e.keyCode=37;
        e.which=e.keyCode;
        e.metaKey=false;
        e.bubbles=true;
        document.dispatchEvent(e);
      }
      
      if(pipe[1]=="assistant" & pipe[2]=="open" & pipe[3]=="question"){
          var n = parseInt(pipe[4])-1;
          var el=document.getElementsByClassName('chat_button')[n];
          var etype='click';
          if (el.fireEvent) {
            el.fireEvent('on' + etype);
          } else {
              var evObj = document.createEvent('Events');
              evObj.initEvent(etype, true, false);
              el.dispatchEvent(evObj);
            }
         }
      
      if (pipe[2]=="assistant" &pipe[3]=="go" & pipe[4]=="back"){
          gotoTimeline();
      }
      
      if(pipe[3]=="assistant" & pipe[4]=="answer"){
          state = "answer";
      }
      
      if(pipe[3]=="assistant" & pipe[4]=="finish"){
          state = "";
      }
      
      if(pipe[2]=="assistant" & pipe[3]=="link"){
          var value = document.getElementById("txt").value;
          
          var words = value.split(" ");
          var n = words.length;
          value="";
          
          for (var i = 0; i<n-2;i++){
              value+=words[i]+" ";
          }
          
    
          document.getElementById("txt").value = value;
          
          document.getElementById("txt").value += " <a href=\""+pipe[4]+"\">" +pipe[4]+"</a> ";
      }
      
      if(pipe[2]=="assistant" & pipe[3]=="delete"){
          var delete_n = parseInt(pipe[4])+3;
          var value = document.getElementById("txt").value;
          
          var words = value.split(" ");
          var n = words.length;
          value="";
          
          for (var i = 0; i<n-delete_n;i++){
              value+=words[i]+" ";
          }
          
    
          document.getElementById("txt").value = value;
      }
      
      if(pipe[3]=="assistant" & pipe[4]=="send"){
          var value = document.getElementById("txt").value;
          
          var words = value.split(" ");
          var n = words.length;
          value="";
          
          for (var i = 0; i<n-2;i++){
              value+=words[i]+" ";
          }
          
    
          document.getElementById("txt").value = value;
          
          var el=document.getElementById('btn');
          var etype='click';
          if (el.fireEvent) {
            el.fireEvent('on' + etype);
          } else {
              var evObj = document.createEvent('Events');
              evObj.initEvent(etype, true, false);
              el.dispatchEvent(evObj);
            }
          state = "";
      }
      
  },    
    
  _process_order: function(order_text){
      
      
//alert(order_text);
      var order = order_text.split(" "); 
       
      order.forEach(this._process_word);
      
          
          
         
          
      
      
       
  },    
    
  _display_script: function(script){
    var final_span = script.final_span;
    var slide = script.start_slide;
    if (script.start_slide !== script.end_slide) {
      slide += "~" + script.end_slide;
    }
      
      
    if (final_span !== '') {
        var order_text = final_span;
        if (order_text[order_text.length-1]=="."){
            order_text = order_text.substr(0,order_text.length-1);
        }
        this._process_order(order_text.toLowerCase());
      var spans = final_span.split(" ");
      final_span = "";
        
        
      for (var i=0; i<spans.length; i++) {
        var span = spans[i];
        word = span.replace(/\b[-.,()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, "").toLowerCase();
        if (this.__stopwords.indexOf(word)>-1 || !(/^[a-zA-Z()]+$/.test(word))) {
          final_span += span + " ";
        } else {
          final_span += "<span>" + word + "</span>" + span.substr(word.length, span.length) + " ";
        }
      }
      if (this.__pre_start_slide_num===script.start_slide && this.__pre_end_slide_num===script.end_slide) {
        document.getElementById('final_span').innerHTML += final_span;
      } else {
        final_span = "slide " + slide + ": " + final_span;
        if (this.__pre_start_slide_num !== -1) {
          final_span = "<br />" + final_span;
        }
        document.getElementById('final_span').innerHTML += final_span;
        this.__pre_start_slide_num = script.start_slide;
        this.__pre_end_slide_num = script.end_slide;
      }
    }
    document.getElementById('interim_span').innerHTML = "<em>" + script.interim_span + "</em>";
  },

  // button click handler
  '#start_button click': function(){
    if (this.recognition.getRecognizing()) {
      console.log('You are recording. Somethin is wrong!');
      return;
    }
    this.__start_slide_num = this._get_current_slide_num();
    this.__end_slide_num = this._get_current_slide_num();
    this.recognition.setRecognizing(true);
    this._startVideo();
    this.recognition.start();
    $('#interim_span').html('');
    this.showInfo('info_speak_now');
  },
  '#pause_button click': function(){
    this._stop();
  },
  '#stop_button click': function() {
    this._stop();
    $('#final_span').empty();
    $('#interim_span').empty();
  },
  _stop: function(){
    if (!this.recognition.getRecognizing()){
      console.log("You are not recording. Something is wrong!");
      return;
    }
    this.__pre_start_slide_num = -1;
    this.__pre_end_slide_num = -1;
    this.recognition.setRecognizing(false);
    this._stopVideo();
    this.recognition.stop();
    this.showInfo('info_start');
  },

  // helper
  showInfo: function(s) {
    if (s) {
      for (var child = info.firstChild; child; child = child.nextSibling) {
        if (child.style) {
          child.style.display = child.id == s ? 'inline' : 'none';
        }
      }
      info.style.visibility = 'visible';
    } else {
      info.style.visibility = 'hidden';
    }
  },

  _enablestart: function(s) {
    var startbutton = document.getElementById('start_button');
    startbutton.innerHTML = "START";
    startbutton.onclick = this._startVideo;

    var pausebutton = document.getElementById('pause_button');
    pausebutton.innerHTML = "PAUSE";
    pausebutton.onclick = this._stopVideo;

    var stopbutton = document.getElementById('stop_button');
    stopbutton.innerHTML = "STOP";
    stopbutton.onclick = this._stopVideo;
  },

  _startVideo: function(s) {
    $('#start_button').prop('disabled', true);
    $('#pause_button').prop('disabled', false);
    $('#stop_button').prop('disabled', false);
    // start video
    this.__vid.play();
    // start tracking
    this.__ctrack.start(this.__vid);
    this.__pause = false;
    // start loop to write positions
    this._positionLoop();
    // start loop to draw face
    this._drawLoop();
  },

  _stopVideo: function(){
    $('#start_button').prop('disabled', false);
    $('#pause_button').prop('disabled', true);
    $('#stop_button').prop('disabled', true);
    this.__vid.pause();
    this.__ctrack.stop();
    this.__pause = true;
  },

  _positionLoop: function() {
    if (this.__pause)
      return;
    requestAnimationFrame(this._positionLoop.bind(this));
    var positions = this.__ctrack.getCurrentPosition();
    var positionString;
    if (positions) {
      for (var p = 44; p < 62; p++) {
        positionString += "featurepoint "+ p + " :";
        positionString += "[" + positions[p][0].toFixed(1) + "," + positions[p][1].toFixed(1) + "] ";
      }
      var gap = positions[57][1]-positions[60][1];
      var speakInfoString = (gap>this.__mouth_threshold)? "Mouth Open" : "Mouth Close";
      this.recognition.setMouthOpen(gap>this.__mouth_threshold);
      document.getElementById("mouth-info").innerHTML = "Gap " + gap.toFixed(2) + ": " + speakInfoString;
    }
  },

  _drawLoop: function() {
    if (this.__pause)
      return;
    requestAnimationFrame(this._drawLoop.bind(this));
    this.__overlayCC.clearRect(0, 0, 400, 300);
    //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
    if (this.__ctrack.getCurrentPosition()) {
      this.__ctrack.draw(this.__overlay);
    }
  },

  _get_current_slide_num: function() {
    return Reveal.getState().indexh;
  }

};
h5.core.expose(scriptController);


