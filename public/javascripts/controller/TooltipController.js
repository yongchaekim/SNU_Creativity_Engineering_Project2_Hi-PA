
var tooltipController = {
  __name: 'hipa.controller.TooltipController',
  __vocabs: {},
  __search_num_th: 3,
  socket: null,

  __construct: function() {
    this.socket = io('/socket/tooltip/audience');
  },

  '#results span click': function(context, $button){
    var resultbox = document.getElementById('tooltip-results');
    resultbox.style.display = 'block';
    resultbox.style.left = context.event.clientX;
    resultbox.style.top = context.event.clientY - 80;
    resultbox.innerHTML = $button.html();
    this._search($button.html(), (result) => {
        this._displaySearch(result.query.search);
        var close = document.createElement('button');
        close.appendChild(document.createTextNode('close'));
        close.onclick = function(){
            resultbox.style.display = 'none';
        }
        resultbox.appendChild(close);
    });
  },

  _search: function(keyword, handle){
    $('#tooltip-results').html('');
    this.socket.emit('Searched', {'term': keyword});
    var handleSearch = this._handleSearch;
    $.ajax({
      url: 'https://en.wikipedia.org/w/api.php',
      data: {
          action: 'query',
          list: 'search',
          srsearch: keyword,
          format: 'json'
      },
      dataType: 'jsonp',
      success: handle
    });
  },

  _displaySearch: function(result){
    for (var i = 0; i < 3; i++) {
      var wikiResult = this._parseWiki(result[i]);
      var title = wikiResult.title, text = wikiResult.text;
      var url = "https://en.wikipedia.org/wiki/" + title.replace(" ", "_");
      var $url = $('<a>')
        .attr("href", url)
        .attr("target", "_blank")
        .text(title);

      $('#tooltip-results').append($url);
      document.getElementById('tooltip-results').innerHTML += " " + text + "...<br />";
    }
  },

  _parseWiki: function(result) {
    var title = result.title;
    var text = result.snippet
    while (true) {
        var index = text.indexOf("<");
        if (index == -1) break
        text = text.substring(0, index) + text.substring(text.indexOf(">")+1, 100);
    }
    var texts = text.split(" ");
    text = "";
    for (var j=0; j<10; j++) {
        if (j==texts.length) break;
        if (texts[j].startsWith("<")) continue;
        text += texts[j] + " ";
    }
    text = text.trim();
    return {
      title,
      text
    }
  }
};

h5.core.expose(tooltipController);
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = tooltipController;