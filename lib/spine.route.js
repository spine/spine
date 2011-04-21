// Spine routing, based on Backbone's implementation.
//  Backbone.js 0.3.3
//  (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
//  Backbone may be freely distributed under the MIT license.
//  For all details and documentation:
//  http://documentcloud.github.com/backbone
//
// For usage, see examples/route.html

(function(Spine, $){  
  var Route = Spine.Route = Spine.Class.create();
  
  var hashStrip = /^#*/;
  
  Route.extend({
    routes: [],
        
    add: function(path, callback){
      if (typeof path == "object")
        for(var p in path) this.add(p, path[p]);
      else
        this.routes.push(this.inst(path, callback));
    },
    
    getFragment: function(){
      var hash = window.location.hash;
      return hash.replace(hashStrip, "");
    },
    
    navigate: function(){
      var fragment = Spine.makeArray(arguments).join("/");
      if (this.fragment == fragment) return;
      window.location.hash = this.fragment = fragment;
    },
    
    change: function(){
      var fragment = this.getFragment();
      if (fragment == this.fragment) return;
      this.fragment = fragment;
      for (var i=0; i < this.routes.length; i++)
        if (this.routes[i].match(fragment)) return;
    },
    
    // Add callback
    extended: function(){
      $(window).bind("hashchange", this.proxy(this.change));
    }
  });
  
  var namedParam   = /:([\w\d]+)/g;
  var splatParam   = /\*([\w\d]+)/g;
  var escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

  Route.include({    
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
    
    match: function(fragment){
      var match = this.route.exec(fragment)
      if ( !match ) return false;
      var params = match.slice(1);
      this.callback.apply(this.callback, params);
      return true;
    }
  });
  
  Spine.Controller.fn.route = function(path, callback){
    Spine.Route.add(path, this.proxy(callback));
  };
  
  Spine.Controller.fn.routes = function(routes){
    for(var path in routes)
      this.route(path, routes[path]);
  };
  
  Spine.Controller.fn.navigate = function(path){
    Spine.Route.navigate(path);
  };
})(Spine, Spine.$);