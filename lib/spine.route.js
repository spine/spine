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
    
    historySupport: ("history" in window),
    history: false,
        
    add: function(path, callback){
      if (typeof path == "object")
        for(var p in path) this.add(p, path[p]);
      else
        this.routes.push(this.init(path, callback));
    },
    
    getPath: function(){
      return window.location.pathname;
    },
    
    getHash: function(){
      return window.location.hash;
    },
    
    getHost: function(){
      return((document.location + "").replace(
        this.getPath() + this.getHash(), ""
      ));
    },
    
    getFragment: function(){
      return this.getHash().replace(hashStrip, "");
    },
    
    navigate: function(){
      var path = Spine.makeArray(arguments).join("/");
      if (this.path == path) return;
      this.path = path;
      
      if (this.history)
        history.pushState({}, 
          document.title, 
          this.getHost() + this.path
        );
      else
        window.location.hash = this.path;
    },
    
    change: function(e){
      var path = (this.history ? this.getPath() : this.getFragment());
      if (path == this.path) return;
      this.path = path;
      for (var i=0; i < this.routes.length; i++)
        if (this.routes[i].match(path)) return;
    }
  });
  
  Route.setup = function(useHistory){
    if (typeof useHistory != "undefined")
      this.history = this.historySupport && useHistory;
    
    if ( this.history )
      $(window).bind("popstate", this.proxy(this.change));
    else
      $(window).bind("hashchange", this.proxy(this.change));
    this.change();
  };
  
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
    
    match: function(path){
      var match = this.route.exec(path)
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
  
  Spine.Controller.fn.navigate = function(){
    Spine.Route.navigate.apply(Spine.Route, arguments);
  };
})(Spine, Spine.$);