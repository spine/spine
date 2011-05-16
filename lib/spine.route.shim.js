var Spine = require("spine");

var Route = Spine.Route = Spine.Class.create();
Route.extend(Spine.Events);

Route.extend({
  routes: [],

  add: function(path, callback){
    if (typeof path == "object")
      for(var p in path) this.add(p, path[p]);
    else
      this.routes.push(this.init(path, callback));
  },
  
  setup: function(options){
    this.bind("change", this.change);
  },
  
  unbind: function(){},
  
  navigate: function(){
    var args = Spine.makeArray(arguments);
    var triggerRoutes = true;
    
    if (typeof args[args.length - 1] == "boolean") {
      triggerRoutes = args.pop();
    }
    
    var path = args.join("/");      
    if (this.path == path) return;
    
    if ( !triggerRoutes )
      this.path = path;
    
    this.trigger("change", path);
  },
  
  // Private
  
  change: function(path){
    if (path == this.path) return;
    this.path = path;
    for (var i=0; i < this.routes.length; i++)
      if (this.routes[i].match(path)) return;
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