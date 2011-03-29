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

var ajaxSync = function(e, method, record){  
  
  var params = {
    type:          methodMap[method],
    contentType:  "application/json",
    dataType:     "json",
    processData:  false
  };
    
  params.url = getUrl(record);
  if (!params.url) throw("Invalid URL");
  
  if (method == "create" || method == "update")
    params.data = JSON.stringify(record);
    
  if (method == "read")
    params.success = function(data){
      (record.populate || record.load)(data);
    };

  params.error = function(e){
    record.trigger("error", e);
  };
  
  $.ajax(params);
};


Spine.Model.Ajax = {
  extended: function(){    
    this.sync(ajaxSync);
    this.fetch(this.proxy(function(e){
      ajaxSync(e, "read", this);
    }));
  }
};

Spine.Model.extend({
  url: function() {
    return "/" + this.name.toLowerCase() + "s"
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