(function() {
  var $, Controller, Events, Log, Model, Module, Spine, guid, isArray, makeArray, moduleKeywords;
  var __slice = Array.prototype.slice, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  $ = this.jQuery || Zepto || function() {
    return arguments[0];
  };
  Events = {
    bind: function(ev, callback) {
      var calls, evs, name, _base, _i, _len;
      evs = ev.split(" ");
      calls = this._callbacks || (this._callbacks = {});
      for (_i = 0, _len = evs.length; _i < _len; _i++) {
        name = evs[_i];
        (_base = this._callbacks)[name] || (_base[name] = []);
        this._callbacks[name].push(callback);
      }
      return this;
    },
    trigger: function() {
      var args, callback, ev, list, _i, _len, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ev = args.shift();
      list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
      if (!list) {
        return false;
      }
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        callback = list[_i];
        if (callback.apply(this, args) === false) {
          break;
        }
      }
      return true;
    },
    unbind: function(ev, callback) {
      var cb, i, list, _len, _ref;
      if (!ev) {
        this._callbacks = {};
        return this;
      }
      list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
      if (!list) {
        return this;
      }
      if (!callback) {
        delete this._callbacks[ev];
        return this;
      }
      for (i = 0, _len = list.length; i < _len; i++) {
        cb = list[i];
        if (c === callback) {
          list = list.slice();
          list.splice(i, 1);
          calls[ev] = list;
          break;
        }
      }
      return this;
    }
  };
  Log = {
    trace: true,
    logPrefix: "(App)",
    log: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.trace) {
        return;
      }
      if (typeof console === "undefined") {
        return;
      }
      if (this.logPrefix) {
        args.unshift(this.logPrefix);
      }
      console.log.apply(console, args);
      return this;
    }
  };
  moduleKeywords = ["included", "extended"];
  Module = (function() {
    function Module() {}
    Module.include = function(obj) {
      var included, key, value;
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      included = obj.included;
      if (included) {
        included.apply(this);
      }
      return this;
    };
    Module.extend = function(obj) {
      var extended, key, value;
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      extended = obj.extended;
      if (extended) {
        extended.apply(this);
      }
      return this;
    };
    Module.proxy = function(func) {
      return __bind(function() {
        return func.apply(this, arguments);
      }, this);
    };
    Module.prototype.proxy = function(func) {
      return __bind(function() {
        return func.apply(this, arguments);
      }, this);
    };
    return Module;
  })();
  Model = (function() {
    __extends(Model, Module);
    Model.records = {};
    Model.attributes = [];
    Model.setup = function() {
      var attributes, name;
      name = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.name = name;
      this.records = {};
      if (attributes) {
        this.attributes = attributes;
      }
      this.attributes && (this.attributes = makeArray(this.attributes));
      this.attributes || (this.attributes = []);
      return this;
    };
    Model.find = function(id) {
      var record;
      record = this.records[id];
      if (!record) {
        throw "Unknown record";
      }
      return record.clone();
    };
    Model.exists = function(id) {
      try {
        return this.find(id);
      } catch (e) {
        return false;
      }
    };
    Model.refresh = function(values, options) {
      var record, _i, _len, _ref;
      if (options == null) {
        options = {};
      }
      if (options.clear) {
        this.records = {};
      }
      _ref = this.fromJSON(values);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        record = _ref[_i];
        record.newRecord = false;
        this.records[record.id] = record;
      }
      this.trigger("refresh");
      return this;
    };
    Model.select = function(callback) {
      var id, record, result;
      result = (function() {
        var _ref, _results;
        _ref = this.records;
        _results = [];
        for (id in _ref) {
          record = _ref[id];
          if (callback(record)) {
            _results.push(record);
          }
        }
        return _results;
      }).call(this);
      return this.cloneArray(result);
    };
    Model.findByAttribute = function(name, value) {
      var id, record, _ref;
      _ref = this.records;
      for (id in _ref) {
        record = _ref[id];
        if (record[name] === value) {
          return record.clone();
        }
      }
      return null;
    };
    Model.findAllByAttribute = function(name, value) {
      return this.select(function(item) {
        return item[name] === value;
      });
    };
    Model.each = function(callback) {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(callback(value));
      }
      return _results;
    };
    Model.all = function() {
      return this.cloneArray(this.recordsValues());
    };
    Model.first = function() {
      var record;
      record = this.recordsValues()[0];
      return record != null ? record.clone() : void 0;
    };
    Model.last = function() {
      var record, values;
      values = this.recordsValues();
      record = values[values.length - 1];
      return record != null ? record.clone() : void 0;
    };
    Model.count = function() {
      return this.recordsValues().length;
    };
    Model.deleteAll = function() {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(delete this.records[key]);
      }
      return _results;
    };
    Model.destroyAll = function() {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this.records[key].destroy());
      }
      return _results;
    };
    Model.update = function(id, atts) {
      return this.find(id).updateAttributes(atts);
    };
    Model.create = function(atts) {
      var record;
      record = new this(atts);
      return record.save();
    };
    Model.destroy = function(id) {
      return this.find(id).destroy();
    };
    Model.change = function(callbackOrParams) {
      if (typeof callbackOrParams === "function") {
        return this.bind("change", callbackOrParams);
      } else {
        return this.trigger("change", callbackOrParams);
      }
    };
    Model.fetch = function(callbackOrParams) {
      if (typeof callbackOrParams === "function") {
        return this.bind("fetch", callbackOrParams);
      } else {
        return this.trigger("fetch", callbackOrParams);
      }
    };
    Model.toJSON = function() {
      return this.recordsValues();
    };
    Model.fromJSON = function(objects) {
      var value, _i, _len, _results;
      if (!objects) {
        return;
      }
      if (typeof objects === "string") {
        objects = JSON.parse(objects);
      }
      if (isArray(objects)) {
        _results = [];
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          value = objects[_i];
          _results.push(new this(value));
        }
        return _results;
      } else {
        return new this(objects);
      }
    };
    Model.recordsValues = function() {
      var key, result, value, _ref;
      result = [];
      _ref = this.records;
      for (key in _ref) {
        value = _ref[key];
        result.push(value);
      }
      return result;
    };
    Model.cloneArray = function(array) {
      var result, value, _i, _len;
      result = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        value = array[_i];
        result.push(value.clone());
      }
      return result;
    };
    Model.prototype.model = true;
    Model.prototype.newRecord = true;
    function Model(atts) {
      Model.__super__.constructor.apply(this, arguments);
      if (atts) {
        this.load(atts);
      }
    }
    Model.prototype.isNew = function() {
      return this.newRecord;
    };
    Model.prototype.isValid = function() {
      return !this.validate();
    };
    Model.prototype.validate = function() {};
    Model.prototype.load = function(atts) {
      var key, value, _results;
      _results = [];
      for (key in atts) {
        value = atts[key];
        _results.push(this[key] = value);
      }
      return _results;
    };
    Model.prototype.attributes = function() {
      var key, result, _i, _len, _ref;
      result = {};
      _ref = this.constructor.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        result[key] = this[key];
      }
      result.id = this.id;
      return result;
    };
    Model.prototype.eql = function(rec) {
      return rec && rec.id === this.id && rec.parent === this.constructor;
    };
    Model.prototype.save = function() {
      var error;
      error = this.validate();
      if (error) {
        this.trigger("error", this, error);
        return false;
      }
      this.trigger("beforeSave", this);
      if (this.newRecord) {
        this.create();
      } else {
        this.update();
      }
      this.trigger("save", this);
      return this;
    };
    Model.prototype.updateAttribute = function(name, value) {
      this[name] = value;
      return this.save();
    };
    Model.prototype.updateAttributes = function(atts) {
      this.load(atts);
      return this.save();
    };
    Model.prototype.destroy = function() {
      this.trigger("beforeDestroy", this);
      delete this.constructor.records[this.id];
      this.destroyed = true;
      this.trigger("destroy", this);
      return this.trigger("change", this, "destroy");
    };
    Model.prototype.dup = function() {
      var result;
      result = new this.constructor(this.attributes());
      result.newRecord = this.newRecord;
      return result;
    };
    Model.prototype.clone = function() {
      return Object.create(this);
    };
    Model.prototype.reload = function() {
      var original;
      if (this.newRecord) {
        return this;
      }
      original = this.constructor.find(this.id);
      this.load(original.attributes());
      return original;
    };
    Model.prototype.toJSON = function() {
      return this.attributes();
    };
    Model.prototype.exists = function() {
      return this.id && this.id in this.constructor.records;
    };
    Model.prototype.update = function() {
      var clone, records;
      this.trigger("beforeUpdate", this);
      records = this.constructor.records;
      records[this.id].load(this.attributes());
      clone = records[this.id].clone();
      this.trigger("update", clone);
      return this.trigger("change", clone, "update");
    };
    Model.prototype.create = function() {
      var clone, records;
      this.trigger("beforeCreate", this);
      if (!this.id) {
        this.id = guid();
      }
      this.newRecord = false;
      records = this.constructor.records;
      records[this.id] = this.dup();
      clone = records[this.id].clone();
      this.trigger("create", clone);
      return this.trigger("change", clone, "create");
    };
    Model.prototype.bind = function(events, callback) {
      return this.constructor.bind(events, __bind(function(record) {
        if (record && this.eql(record)) {
          return callback.apply(this, arguments);
        }
      }, this));
    };
    Model.prototype.trigger = function() {
      return this.constructor.trigger.apply(this.constructor, arguments);
    };
    return Model;
  })();
  Model.extend(Events);
  Controller = (function() {
    __extends(Controller, Module);
    Controller.prototype.eventSplitter = /^(\w+)\s*(.*)$/;
    Controller.prototype.tag = "div";
    function Controller(options) {
      var key, value, _ref;
      this.options = options;
      _ref = this.options;
      for (key in _ref) {
        value = _ref[key];
        this[key] = value;
      }
      if (!this.el) {
        this.el = document.createElement(this.tag);
      }
      this.el = $(this.el);
      if (!this.events) {
        this.events = this.constructor.events;
      }
      if (!this.elements) {
        this.elements = this.constructor.elements;
      }
      if (this.events) {
        this.delegateEvents();
      }
      if (this.elements) {
        this.refreshElements();
      }
    }
    Controller.prototype.$ = function(selector) {
      return $(selector, this.el);
    };
    Controller.prototype.delegateEvents = function() {
      var eventName, key, match, method, methodName, selector, _results;
      _results = [];
      for (key in this.events) {
        methodName = this.events[key];
        method = this.proxy(this[methodName]);
        match = key.match(this.eventSplitter);
        eventName = match[1];
        selector = match[2];
        _results.push(selector === '' ? this.el.bind(eventName, method) : this.el.delegate(selector, eventName, method));
      }
      return _results;
    };
    Controller.prototype.refreshElements = function() {
      var key, value, _ref, _results;
      _ref = this.elements;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this[value] = this.$(key));
      }
      return _results;
    };
    Controller.prototype.delay = function(func, timeout) {
      return setTimeout(this.proxy(func), timeout || 0);
    };
    Controller.prototype.html = function() {
      return this.el.html.apply(this.el, arguments);
    };
    Controller.prototype.append = function() {
      var e, elements;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      elements = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          e = elements[_i];
          _results.push(e.el || e);
        }
        return _results;
      })();
      return this.el.append.apply(this.el, elements);
    };
    Controller.prototype.appendTo = function(element) {
      return this.el.appendTo(element.el || element);
    };
    return Controller;
  })();
  Controller.include(Events);
  Controller.include(Log);
  if (typeof Object.create !== "function") {
    Object.create = function(o) {
      var F;
      F = function() {};
      F.prototype = o;
      return new F();
    };
  }
  isArray = function(value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  };
  makeArray = function(args) {
    return Array.prototype.slice.call(args, 0);
  };
  guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : r & 3 | 8;
      return v.toString(16);
    }).toUpperCase();
  };
  if (typeof exports === !"undefined") {
    Spine = exports;
  } else {
    Spine = this.Spine = {};
  }
  Spine.version = "2.0.0";
  Spine.isArray = isArray;
  Spine.$ = $;
  Spine.Events = Events;
  Spine.Log = Log;
  Spine.Module = Module;
  Spine.Controller = Controller;
  Spine.Model = function() {
    var model;
    model = (function() {
      __extends(model, Model);
      function model() {
        model.__super__.constructor.apply(this, arguments);
      }
      return model;
    })();
    return model.setup.apply(model, arguments);
  };
  Module.create = Module.sub = function(instance, static) {
    var result;
    result = (function() {
      __extends(result, this);
      function result() {
        result.__super__.constructor.apply(this, arguments);
      }
      return result;
    }).call(this);
    result.include(instance);
    result.extend(static);
    return result;
  };
  Module.init = function(a1, a2, a3, a4, a5) {
    return new this(a1, a2, a3, a4, a5);
  };
  Spine.Class = Module;
}).call(this);
