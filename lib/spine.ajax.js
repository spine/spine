(function() {
  var $, Ajax, Include, Model;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Spine || (Spine = require("spine"));
  $ = Spine.$;
  Model = Spine.Model;
  Ajax = Spine.Ajax = {
    getUrl: function(object) {
      if (!(object && object.url)) {
        return null;
      }
      return (typeof object.url === "function" ? object.url() : void 0) || object.url;
    },
    methodMap: {
      "create": "POST",
      "update": "PUT",
      "destroy": "DELETE",
      "read": "GET"
    },
    send: function(record, method, params) {
      var defaults, success;
      defaults = {
        type: this.methodMap[method],
        contentType: "application/json",
        dataType: "json",
        data: {}
      };
      params = $.extend({}, defaults, params);
      if (method === "create" && record.model) {
        params.url = this.getUrl(record.constructor);
      } else {
        params.url = this.getUrl(record);
      }
      if (!params.url) {
        throw "Invalid URL";
      }
      if (method === "create" || method === "update") {
        params.data = JSON.stringify(record);
        params.processData = false;
        params.success = function(data, status, xhr) {
          var records;
          if (!data) {
            return;
          }
          if (JSON.stringify(record) === JSON.stringify(data)) {
            return;
          }
          if (data.id && record.id !== data.id) {
            records = record.constructor.records;
            records[data.id] = records[record.id];
            delete records[record.id];
            record.id = data.id;
          }
          Ajax.disable(function() {
            return record.updateAttributes(data);
          });
          return record.trigger("ajaxSuccess", record, status, xhr);
        };
      }
      if (method === "read" && !params.success) {
        params.success = function() {
          return (record.refresh || record.load).call(record, data);
        };
      }
      success = params.success;
      params.success = function() {
        if (success) {
          success.apply(Ajax, arguments);
        }
        return Ajax.sendNext();
      };
      params.error = function(xhr, s, e) {
        if (record.trigger("ajaxError", record, xhr, s, e)) {
          return Ajax.sendNext();
        }
      };
      return $.ajax(params);
    },
    enabled: true,
    pending: false,
    requests: [],
    disable: function(callback) {
      this.enabled = false;
      callback();
      return this.enabled = true;
    },
    sendNext: function() {
      var next;
      next = this.requests.shift();
      if (next) {
        return this.send.apply(this, next);
      } else {
        return this.pending = false;
      }
    },
    request: function() {
      if (!this.enabled) {
        return;
      }
      if (this.pending) {
        return this.requests.push(arguments);
      } else {
        this.pending = true;
        return this.send.apply(this, arguments);
      }
    }
  };
  Include = {
    url: function() {
      var base;
      base = Ajax.getUrl(this.constructor);
      if (base.charAt(base.length - 1) !== "/") {
        base += "/";
      }
      base += encodeURIComponent(this.id);
      return base;
    }
  };
  Model.Ajax = {
    extended: function() {
      this.change(function() {
        return Ajax.request.apply(Ajax, arguments);
      });
      this.fetch(__bind(function(params) {
        return Ajax.request(this, "read", params);
      }, this));
      return this.include(Include);
    },
    ajaxPrefix: false,
    url: function() {
      return "/" + (this.className.toLowerCase()) + "s";
    }
  };
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Model.Ajax;
  }
}).call(this);
