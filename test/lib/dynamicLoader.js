(function(){
  function load(script) {
    document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
  }

  var tokens, re = /[?&]?([^=]+)=([^&]*)/g;
  function getQueryParams(qs) {
    var params = {}
    qs = qs.split("+").join(" ");
    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }
    return params;
  }

  var query = getQueryParams(document.location.search);
  console.log(query);
  // defaut jquery version (1.8.3) is local
  window.jquerySrc = "lib/jquery.js";
  // dynamicly chosen jquery version is fetched
  if(query.jq != null && query.jq != undefined) {
    window.jquerySrc = "http://code.jquery.com/jquery-"+query.jq+".js";
  }
  load(window.jquerySrc);
})();
