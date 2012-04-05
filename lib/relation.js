(function() {
  var Collection, Instance, M2MCollection, Singleton, isArray, singularize, underscore;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Spine = this.Spine || require('spine');

  isArray = Spine.isArray;

  require = this.require || (function(value) {
    return eval(value);
  });

  Collection = (function() {

    __extends(Collection, Spine.Module);

    function Collection(options) {
      var key, value;
      if (options == null) options = {};
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Collection.prototype.add = function(item) {
      var i, _i, _len, _results;
      if (isArray(item)) {
        _results = [];
        for (_i = 0, _len = item.length; _i < _len; _i++) {
          i = item[_i];
          _results.push(this.add(i));
        }
        return _results;
      } else {
        if (!(item instanceof this.model)) item = this.model.find(item);
        return item.__proto__[this.fkey] = this.record.id;
      }
    };

    Collection.prototype.remove = function(item) {
      return delete item.__proto__[this.fkey];
    };

    Collection.prototype.all = function() {
      var _this = this;
      return this.model.select(function(rec) {
        return _this.associated(rec);
      });
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
      var _this = this;
      records = this.select(function(rec) {
        return rec.id + '' === id + '';
      });
      if (!records[0]) throw 'Unknown record';
      return records[0];
    };

    Collection.prototype.findAllByAttribute = function(name, value) {
      var _this = this;
      return this.model.select(function(rec) {
        return _this.associated(rec) && rec[name] === value;
      });
    };

    Collection.prototype.findByAttribute = function(name, value) {
      return this.findAllByAttribute(name, value)[0];
    };

    Collection.prototype.select = function(cb) {
      var _this = this;
      return this.model.select(function(rec) {
        return _this.associated(rec) && cb(rec);
      });
    };

    Collection.prototype.refresh = function(values) {
      var record, records, _i, _j, _len, _len2, _ref;
      _ref = this.all();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        record = _ref[_i];
        delete this.model.records[record.id];
      }
      records = this.model.fromJSON(values);
      if (!isArray(records)) records = [records];
      for (_j = 0, _len2 = records.length; _j < _len2; _j++) {
        record = records[_j];
        record.newRecord = false;
        record[this.fkey] = this.record.id;
        this.model.records[record.id] = record;
      }
      return this.model.trigger('refresh', this.model.cloneArray(records));
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

  M2MCollection = (function() {

    __extends(M2MCollection, Spine.Module);

    function M2MCollection(options) {
      var key, value;
      if (options == null) options = {};
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    M2MCollection.prototype.add = function(item) {
      var i, tmp, _i, _len, _results;
      if (isArray(item)) {
        _results = [];
        for (_i = 0, _len = item.length; _i < _len; _i++) {
          i = item[_i];
          _results.push(this.add(i));
        }
        return _results;
      } else {
        if (!(item instanceof this.model)) item = this.model.find(item);
        tmp = new this.hub();
        if (this.left_to_right) {
          tmp["" + this.rev_name + "_id"] = this.record.id;
          tmp["" + this.name + "_id"] = item.id;
        } else {
          tmp["" + this.rev_name + "_id"] = item.id;
          tmp["" + this.name + "_id"] = this.record.id;
        }
        return tmp.save();
      }
    };

    M2MCollection.prototype.remove = function(item) {
      var i, _i, _len, _ref, _results;
      var _this = this;
      _ref = this.hub.select(function(item) {
        return _this.associated(item);
      });
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(i.destroy());
      }
      return _results;
    };

    M2MCollection.prototype._link = function(items) {
      var _this = this;
      return items.map(function(item) {
        if (_this.left_to_right) {
          return _this.model.find(item["" + _this.name + "_id"]);
        } else {
          return _this.model.find(item["" + _this.rev_name + "_id"]);
        }
      });
    };

    M2MCollection.prototype.all = function() {
      var _this = this;
      return this._link(this.hub.select(function(item) {
        return _this.associated(item);
      }));
    };

    M2MCollection.prototype.first = function() {
      return this.all()[0];
    };

    M2MCollection.prototype.last = function() {
      var values;
      values = this.all();
      return values[values.length(-1)];
    };

    M2MCollection.prototype.find = function(id) {
      var records;
      var _this = this;
      records = this.hub.select(function(rec) {
        return _this.associated(rec, id);
      });
      if (!records[0]) throw 'Unknown record';
      return this._link(records)[0];
    };

    M2MCollection.prototype.create = function(record) {
      return this.add(this.model.create(record));
    };

    M2MCollection.prototype.associated = function(record, id) {
      if (this.left_to_right) {
        if (record["" + this.rev_name + "_id"] !== this.record.id) return false;
        if (id) return record["" + this.rev_name + "_id"] === id;
      } else {
        if (record["" + this.name + "_id"] !== this.record.id) return false;
        if (id) return record["" + this.name + "_id"] === id;
      }
      return true;
    };

    return M2MCollection;

  })();

  Instance = (function() {

    __extends(Instance, Spine.Module);

    function Instance(options) {
      var key, value;
      if (options == null) options = {};
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Instance.prototype.exists = function() {
      return this.record[this.fkey] && this.model.exists(this.record[this.fkey]);
    };

    Instance.prototype.update = function(value) {
      if (!(value instanceof this.model)) value = new this.model(value);
      if (value.isNew()) value.save();
      return this.record.__proto__[this.fkey] = value && value.id;
    };

    return Instance;

  })();

  Singleton = (function() {

    __extends(Singleton, Spine.Module);

    function Singleton(options) {
      var key, value;
      if (options == null) options = {};
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Singleton.prototype.find = function() {
      return this.record.id && this.model.findByAttribute(this.fkey, this.record.id);
    };

    Singleton.prototype.update = function(value) {
      if (!(value instanceof this.model)) value = this.model.fromJSON(value);
      value[this.fkey] = this.record.id;
      return value.save();
    };

    return Singleton;

  })();

  singularize = function(str) {
    return str.replace(/s$/, '');
  };

  underscore = function(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
  };

  Spine.Model.extend({
    hasMany: function(name, model, fkey) {
      var association;
      if (fkey == null) fkey = "" + (underscore(this.className)) + "_id";
      association = function(record) {
        if (typeof model === 'string') model = require(model);
        return new Collection({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      return this.prototype[name] = function(value) {
        if (value != null) association(this).refresh(value);
        return association(this);
      };
    },
    belongsTo: function(name, model, fkey) {
      var association;
      if (fkey == null) fkey = "" + (singularize(name)) + "_id";
      association = function(record) {
        if (typeof model === 'string') model = require(model);
        return new Instance({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      this.prototype[name] = function(value) {
        if (value != null) association(this).update(value);
        return association(this).exists();
      };
      return this.attributes.push(fkey);
    },
    hasOne: function(name, model, fkey) {
      var association;
      if (fkey == null) fkey = "" + (underscore(this.className)) + "_id";
      association = function(record) {
        if (typeof model === 'string') model = require(model);
        return new Singleton({
          name: name,
          model: model,
          record: record,
          fkey: fkey
        });
      };
      return this.prototype[name] = function(value) {
        if (value != null) association(this).update(value);
        return association(this).find();
      };
    },
    foreignKey: function(model, name, rev_name) {
      if (rev_name == null) rev_name = this.className.toLowerCase();
      rev_name = singularize(underscore(rev_name));
      if (typeof model === 'string') model = require(model);
      if (name == null) name = model.className.toLowerCase();
      name = singularize(underscore(name));
      this.belongsTo(name, model);
      return model.hasMany("" + rev_name + "s", this);
    },
    manyToMany: function(model, name, rev_name) {
      var association, local, rev_model, tmpModel;
      if (rev_name == null) rev_name = this.className.toLowerCase();
      rev_name = singularize(underscore(rev_name));
      rev_model = this;
      if (typeof model === 'string') model = require(model);
      if (name == null) name = model.className.toLowerCase();
      name = singularize(underscore(name));
      local = typeof model.loadLocal === 'function' && typeof rev_model.loadLocal === 'function';
      tmpModel = (function() {

        __extends(tmpModel, Spine.Model);

        function tmpModel() {
          tmpModel.__super__.constructor.apply(this, arguments);
        }

        tmpModel.configure("_" + rev_name + "s_to_" + name + "s", "" + tmpModel.rev_name + "_id", "" + tmpModel.name + "_id");

        if (local) tmpModel.extend(Spine.Model.Local);

        return tmpModel;

      })();
      if (local) tmpModel.fetch();
      tmpModel.foreignKey(rev_model, "" + rev_name);
      tmpModel.foreignKey(model, "" + name);
      association = function(record, model, left_to_right) {
        return new M2MCollection({
          name: name,
          rev_name: rev_name,
          record: record,
          model: model,
          hub: tmpModel,
          left_to_right: left_to_right
        });
      };
      rev_model.prototype["" + name + "s"] = function(value) {
        return association(this, model, true);
      };
      return model.prototype["" + rev_name + "s"] = function(value) {
        return association(this, rev_model, false);
      };
    }
  });

}).call(this);
