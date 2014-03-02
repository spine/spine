(function(){
  function load(script) {
    document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
  }

  var tokens, re = /[?&]?([^=]+)=([^&]*)/g;
  function getQueryParams(qs) {
    var params = {}
    qs = qs.split("+").join(" ");
    while (tokens = re.exec(qs)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
  }

  var query = getQueryParams(document.location.search);
  // defaut jquery version (2.0.3) is local
  window.dependencySrc = "lib/jquery.js";
  // dynamicly chosen jquery version is fetched
  if(query.jq != null && query.jq != undefined) {
    if(query.jq == 'zepto'){
      window.dependencySrc = "lib/zepto.js";
    } else {
      window.dependencySrc = "http://code.jquery.com/jquery-"+query.jq+".js";
    }
  }
  load(window.dependencySrc);
})();
