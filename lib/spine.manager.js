(function() {
  var $;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Spine || (Spine = require("spine"));
  $ = Spine.$;
  Spine.Manager = (function() {
    __extends(Manager, Spine.Module);
    function Manager() {
      this.add.apply(this, arguments);
    }
    Manager.prototype.add = function() {
      var cont, controllers, _i, _len, _results;
      controllers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = controllers.length; _i < _len; _i++) {
        cont = controllers[_i];
        _results.push(this.addOne(cont));
      }
      return _results;
    };
    Manager.prototype.addOne = function(controller) {
      this.bind("change", function(current, args) {
        if (controller === current) {
          return controller.activate.apply(controller, args);
        } else {
          return controller.deactivate.apply(controller, args);
        }
      });
      return controller.active(__bind(function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.trigger("change", controller, args);
      }, this));
    };
    return Manager;
  })();
  Spine.Manager.include(Spine.Events);
  Spine.Controller.include({
    active: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof args[0] === "function") {
        this.bind("active", args[0]);
      } else {
        args.unshift("active");
        this.trigger.apply(this, args);
      }
      return this;
    },
    isActive: function() {
      return this.el.hasClass("active");
    },
    activate: function() {
      this.el.addClass("active");
      return this;
    },
    deactivate: function() {
      this.el.removeClass("active");
      return this;
    }
  });
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Manager;
  }
}).call(this);
