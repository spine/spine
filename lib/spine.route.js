(function() {
  var $, escapeRegExp, hashStrip, namedParam, splatParam;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  Spine || (Spine = require("spine"));
  $ = Spine.$;
  hashStrip = /^#*/;
  namedParam = /:([\w\d]+)/g;
  splatParam = /\*([\w\d]+)/g;
  escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
  Spine.Route = (function() {
    Route.historySupport = "history" in window;
    Route.routes = [];
    Route.options = {
      trigger: true,
      history: false,
      shim: false
    };
    Route.add = function(path, callback) {
      var key, value, _results;
      if (typeof path === "object") {
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
      this.options = $.extend({}, this.options, options);
      if (this.options.history) {
        this.history = this.historySupport && this.options.history;
      }
      if (this.history && !this.options.shim) {
        $(window).bind("popstate", this.change);
      } else if (!options.shim) {
        $(window).bind("hashchange", this.change);
      }
      return this.change();
    };
    Route.unbind = Route.history ? $(window).unbind("popstate", Route.change) : $(window).unbind("hashchange", Route.change);
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
    Route.getHost = function() {
      return (document.location + "").replace(this.getPath() + this.getHash(), "");
    };
    Route.getFragment = function() {
      return this.getHash().replace(hashStrip, "");
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
          return;
        }
      }
    };
    function Route(path, callback) {
      this.Route = __bind(this.Route, this);      var match;
      this.names = [];
      this.callback = callback;
      if (typeof path === "string") {
        while (match = namedParam.exec(path) !== null) {
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
      match = this.route.exec(path);
      if (!match) {
        return false;
      }
      params = match.slice(1);
      options.match = params;
      if (this.names.length) {
        for (i = 0, _len = params.length; i < _len; i++) {
          param = params[i];
          options[this.names[i]] = param;
        }
      }
      this.callback.apply(this.callback, options);
      return true;
    };
    return Route;
  })();
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
