(function() {
  var Collection, Instance, singularize, underscore;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Collection = (function() {
    function Collection(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }
    Collection.prototype.all = function() {
      return this.model.select(__bind(function(rec) {
        return this.associated(rec);
      }, this));
    };
    Collection.prototype.first = function() {
      return this.all()[0];
    };
    Collection.prototype.last = function() {
      var values;
      values = this.all();
      return values[values.length - 1];
    };
    Collection.prototype.find = function(id) {
      var records;
      records = this.model.select(__bind(function(rec) {
        return this.associated(rec) && rec.id === id;
      }, this));
      if (!records[0]) {
        throw "Unknown record";
      }
      return records[0];
    };
    Collection.prototype.select = function(cb) {
      return this.model.select(__bind(function(rec) {
        return this.associated(rec) && cb(rec);
      }, this));
    };
    Collection.prototype.refresh = function(values) {
      var record, records, value, _i, _j, _len, _len2;
      records = this.all();
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        delete this.model.records[record.id];
      }
      values = this.model.fromJSON(values);
      for (_j = 0, _len2 = values.length; _j < _len2; _j++) {
        value = values[_j];
        value.newRecord = false;
        value[this.fkey] = this.record.id;
        this.model.records[value.id] = value;
      }
      return this.model.trigger("refresh");
    };
    Collection.prototype.create = function(record) {
      record[this.fkey] = this.record.id;
      return this.model.create(record);
    };
    Collection.prototype.associated = function(record) {
      return record[this.fkey] === this.record.id;
    };
    return Collection;
  })();
  Instance = (function() {
    function Instance(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }
    Instance.prototype.find = function() {
      return this.record[this.fkey] && this.model.find(this.record[this.fkey]);
    };
    Instance.prototype.update = function(value) {
      return this.record[this.fkey] = value && value.id;
    };
    return Instance;
  })();
  singularize = function(str) {
    return str.replace(/s$/, '');
  };
  underscore = function(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
  };
  Spine.Model.extend({
    many: function(name, model, fkey) {
      var association;
            if (fkey != null) {
        fkey;
      } else {
        fkey = "" + (underscore(this.className)) + "_id";
      };
      association = function(record) {
        if (typeof model === "string") {
          model = require(model);
        }
        return new Collection({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      this.prototype.__defineGetter__(name, function() {
        return association(this);
      });
      return this.prototype.__defineSetter__(name, function(value) {
        return association(this).refresh(value);
      });
    },
    belongs: function(name, model, fkey) {
      var association;
            if (fkey != null) {
        fkey;
      } else {
        fkey = "" + (singularize(name)) + "_id";
      };
      association = function(record) {
        if (typeof model === "string") {
          model = require(model);
        }
        return new Instance({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      this.prototype.__defineGetter__(name, function() {
        return association(this).find();
      });
      this.prototype.__defineSetter__(name, function(value) {
        return association(this).update(value);
      });
      return this.attributes.push(fkey);
    }
  });
}).call(this);
