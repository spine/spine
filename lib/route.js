(function() {
  var $, escapeRegExp, hashStrip, namedParam, splatParam;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  if (typeof Spine === "undefined" || Spine === null) {
    Spine = require('spine');
  }
  $ = Spine.$;
  hashStrip = /^#*/;
  namedParam = /:([\w\d]+)/g;
  splatParam = /\*([\w\d]+)/g;
  escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
  Spine.Route = (function() {
    __extends(Route, Spine.Module);
    Route.extend(Spine.Events);
    Route.historySupport = "history" in window;
    Route.routes = [];
    Route.options = {
      trigger: true,
      history: false,
      shim: false
    };
    Route.add = function(path, callback) {
      var key, value, _results;
      if (typeof path === "object" && !(path instanceof RegExp)) {
        _results = [];
        for (key in path) {
          value = path[key];
          _results.push(this.add(key, value));
        }
        return _results;
      } else {
        return this.routes.push(new this(path, callback));
      }
    };
    Route.setup = function(options) {
      if (options == null) {
        options = {};
      }
      this.options = $.extend({}, this.options, options);
      if (this.options.history) {
        this.history = this.historySupport && this.options.history;
      }
      if (this.options.shim) {
        return;
      }
      if (this.history) {
        $(window).bind("popstate", this.change);
      } else {
        $(window).bind("hashchange", this.change);
      }
      return this.change();
    };
    Route.unbind = function() {
      if (this.history) {
        return $(window).unbind("popstate", this.change);
      } else {
        return $(window).unbind("hashchange", this.change);
      }
    };
    Route.navigate = function() {
      var args, lastArg, options, path;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      options = {};
      lastArg = args[args.length - 1];
      if (typeof lastArg === "object") {
        options = args.pop();
      } else if (typeof lastArg === "boolean") {
        options.trigger = args.pop();
      }
      options = $.extend({}, this.options, options);
      path = args.join("/");
      if (this.path === path) {
        return;
      }
      this.path = path;
      if (options.trigger) {
        this.matchRoute(this.path, options);
      }
      if (options.shim) {
        return;
      }
      if (this.history) {
        return history.pushState({}, document.title, this.getHost() + this.path);
      } else {
        return window.location.hash = this.path;
      }
    };
    Route.getPath = function() {
      return window.location.pathname;
    };
    Route.getHash = function() {
      return window.location.hash;
    };
    Route.getFragment = function() {
      return this.getHash().replace(hashStrip, "");
    };
    Route.getHost = function() {
      return (document.location + "").replace(this.getPath() + this.getHash(), "");
    };
    Route.change = function() {
      var path;
      path = this.history ? this.getPath() : this.getFragment();
      if (path === this.path) {
        return;
      }
      this.path = path;
      return this.matchRoute(this.path);
    };
    Route.matchRoute = function(path, options) {
      var route, _i, _len, _ref;
      _ref = this.routes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        route = _ref[_i];
        if (route.match(path, options)) {
          this.trigger("change", route, path);
          return route;
        }
      }
    };
    function Route(path, callback) {
      var match;
      this.path = path;
      this.callback = callback;
      this.names = [];
      if (typeof path === "string") {
        while ((match = namedParam.exec(path)) !== null) {
          this.names.push(match[1]);
        }
        path = path.replace(escapeRegExp, "\\$&").replace(namedParam, "([^\/]*)").replace(splatParam, "(.*?)");
        this.route = new RegExp('^' + path + '$');
      } else {
        this.route = path;
      }
    }
    Route.prototype.match = function(path, options) {
      var i, match, param, params, _len;
      if (options == null) {
        options = {};
      }
      match = this.route.exec(path);
      if (!match) {
        return false;
      }
      options.match = match;
      params = match.slice(1);
      if (this.names.length) {
        for (i = 0, _len = params.length; i < _len; i++) {
          param = params[i];
          options[this.names[i]] = param;
        }
      }
      return this.callback.call(null, options) !== false;
    };
    return Route;
  })();
  Spine.Route.change = Spine.Route.proxy(Spine.Route.change);
  Spine.Controller.include({
    route: function(path, callback) {
      return Spine.Route.add(path, this.proxy(callback));
    },
    routes: function(routes) {
      var key, value, _results;
      _results = [];
      for (key in routes) {
        value = routes[key];
        _results.push(this.route(key, value));
      }
      return _results;
    },
    navigate: function() {
      return Spine.Route.navigate.apply(Spine.Route, arguments);
    }
  });
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Route;
  }
}).call(this);
