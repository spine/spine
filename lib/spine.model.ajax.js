(function($){

var getUrl = function(object){
  if (!(object && object.url)) return null;
  return $.isFunction(object.url) ? object.url() : object.url;
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

var ajaxSync = function(method, record){  
  
  var params = {
    type:          methodMap[method],
    contentType:  "application/json",
    dataType:     "json",
    processData:  false
  };
        
  if (Spine.Model._noSync) return;
    
  params.url = getUrl(record);
  if (!params.url) throw("Invalid URL");
  
  if (method == "create" || method == "update")
    params.data = JSON.stringify(record);
    
  if (method == "read")
    params.success = function(data){
      (record.refresh || record.load).call(record, data);
    };

  params.error = function(e){
    record.trigger("error", e);
  };
  
  $.ajax(params);
};

Spine.Model.Ajax = {
  extended: function(){    
    this.sync(ajaxSync);
    this.fetch(this.proxy(function(){
      ajaxSync("read", this);
    }));
  }
};

Spine.Model.extend({
  url: function() {
    return "/" + this.name.toLowerCase() + "s"
  },
  
  noSync: function(callback){
    Spine.Model._noSync = true;
    callback.apply(callback, arguments);
    Spine.Model._noSync = false;
  }
});

Spine.Model.include({
  url: function(){
    var base = getUrl(this.parent);
    base += (base.charAt(base.length - 1) == "/" ? "" : "/");
    base += encodeURIComponent(this.id);
    return base;        
  }  
});

})(jQuery);