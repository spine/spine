// Spine routing, based on Backbone's implementation.
//  Backbone.js 0.3.3
//  (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
//  Backbone may be freely distributed under the MIT license.
//  For all details and documentation:
//  http://documentcloud.github.com/backbone
//
// For usage, see examples/route.html

(function(Spine, $){  
  var History = Spine.History = Spine.Class.create();
    
  History.extend({
    routes: [],
        
    add: function(path, callback){
      if (typeof path == "object")
        for(var p in path) this.add(p, path[p]);
      else
        this.routes.push(this.init(path, callback));
    },
    
    getPath: function(){
      return window.location.pathname;
    },
    
    getHost: function(){
      return((document.location + "").replace(this.getPath(), ""));
    },
    
    navigate: function(){
      var path = Spine.makeArray(arguments).join("/");
      if (this.path == path) return;
      this.path = path;
      history.pushState({}, document.title, this.getHost() + path);      
    },
    
    change: function(e){
      // pushState was called
      if ( e && !e.originalEvent.state ) return;
      
      var path = this.getPath();
      if (path == this.path) return;
      this.path = path;
      
      for (var i=0; i < this.routes.length; i++)
        if (this.routes[i].match(path)) return;
    },
    
    // Add callback
    extended: function(){
      $(window).bind("popstate", this.proxy(this.change));
    }
  });
  
  var namedParam   = /:([\w\d]+)/g;
  var splatParam   = /\*([\w\d]+)/g;
  var escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

  History.include({    
    init: function(path, callback){
      this.callback = callback;
      if (typeof path == "string") {      
        path = path.replace(escapeRegExp, "\\$&")
                   .replace(namedParam, "([^\/]*)")
                   .replace(splatParam, "(.*?)");
                       
        this.route = new RegExp('^' + path + '$');
      } else {
        this.route = path;
      }
    },
    
    match: function(path){
      var match = this.route.exec(path)
      if ( !match ) return false;
      var params = match.slice(1);
      this.callback.apply(this.callback, params);
      return true;
    }
  });
  
  Spine.Controller.fn.route = function(path, callback){
    Spine.History.add(path, this.proxy(callback));
  };
  
  Spine.Controller.fn.routes = function(routes){
    for(var path in routes)
      this.route(path, routes[path]);
  };
  
  Spine.Controller.fn.navigate = function(){
    Spine.History.navigate.apply(Spine.History, arguments);
  };
})(Spine, Spine.$);