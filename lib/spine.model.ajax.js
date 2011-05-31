(function($){
  
  var pending = {};
  
  var send = function(request){
    var oldSuccess = request.success;
    request.success = function(){ 
      sendNext(request.serial);
      return oldSuccess.apply(request, arguments);
    };
    request.serial = false;
    
    $.ajax(request);
  };
  
  var sendNext = function(ns){
    var requests = pending[ns];
    if ( !requests ) return;
    var next = requests.shift();
    if (next) send(next);
  };
  
  $.ajaxTransport("+*", function(_, request){    
    if (request.serial)
      return {
        send: function(headers, complete){
          var requests = (pending[request.serial] || (pending[request.serial] = []));
          
          if (requests.length)
            requests.push(request);
          else {
            send(request);
          }                    
        },
        abort: $.noop
      };
  });
  
})(jQuery);

(function(Spine, $){
  
var Model = Spine.Model;

var getUrl = function(object){
  if (!(object && object.url)) return null;
  return((typeof object.url == "function") ? object.url() : object.url);
};

var methodMap = {
  "create":  "POST",
  "update":  "PUT",
  "destroy": "DELETE",
  "read":    "GET"
};

var urlError = function() {
  throw new Error("A 'url' property or function must be specified");
};

var ajaxSync = function(record, method, params){
  if (Model._noSync) return;
  
  params = $.extend(params, {
    type:          methodMap[method],
    contentType:  "application/json",
    dataType:     "json",
    data:         {},
    serial:       "spine"
  });
    
  if (method == "create" && record.model)
    params.url = getUrl(record.parent);
  else
    params.url = getUrl(record);

  if (!params.url) throw("Invalid URL");
    
  if (method == "create" || method == "update") {
    var data = {};
    
    if (Model.ajaxPrefix) {
      data = {};
      data[Model.ajaxPrefix] = record;
    } else {
      data = record;
    }
    data = $.extend(data, params.data);
    params.data = JSON.stringify(data);
    params.processData = false;
    
    params.success = function(data, status, xhr){
      if ( !data ) return;
      
      // Simple deep object comparison
      if (JSON.stringify(record) == JSON.stringify(data)) return;
      
      // ID change, need to do some shifting
      if (data.id && record.id != data.id) {
        var records      = record.parent.records;
        records[data.id] = records[record.id];
        delete records[record.id];
        record.id        = data.id;
      }
      
      // Update with latest data
      record.parent.noSync(function(){ 
        record.updateAttributes(data); 
      });
      
      record.trigger("ajaxSuccess", record, status, xhr);
    }
  }
  
  if (method == "read" && !params.success)
    params.success = function(data){
     (record.refresh || record.load).call(record, data);
    };
  
  params.error = function(xhr, s, e){
    record.trigger("ajaxError", record, xhr, s, e);
  };
  
  $.ajax(params);
};

Model.Ajax = {
  extended: function(){    
    this.sync(ajaxSync);
    this.fetch(this.proxy(function(params){
      ajaxSync(this, "read", params);
    }));
  }
};

Model.extend({
  ajaxPrefix: false,
  
  url: function() {
    return "/" + this.name.toLowerCase() + "s"
  },
  
  noSync: function(callback){
    Model._noSync = true;
    callback.apply(callback);
    Model._noSync = false;
  }
});

Model.include({
  url: function(){
    var base = getUrl(this.parent);
    base += (base.charAt(base.length - 1) == "/" ? "" : "/");
    base += encodeURIComponent(this.id);
    return base;        
  }  
});

})(Spine, Spine.$);