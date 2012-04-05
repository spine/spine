Spine   = @Spine or require('spine')
isArray = Spine.isArray
require = @require or ((value) -> eval(value))

class Collection extends Spine.Module
  constructor: (options = {}) ->
    for key, value of options
      @[key] = value

  add: (item) ->
    if isArray(item)
      @add i for i in item
    else
      item = @model.find item unless item instanceof @model
      item.__proto__[@fkey] = @record.id

  remove: (item) ->
    delete item.__proto__[@fkey]
        
  all: ->
    @model.select (rec) => @associated(rec)

  first: ->
    @all()[0]

  last: ->
    values = @all()
    values[values.length - 1]

  find: (id) ->
    records = @select (rec) =>
      rec.id + '' is id + ''
    throw('Unknown record') unless records[0]
    records[0]

  findAllByAttribute: (name, value) ->
    @model.select (rec) =>
      @associated(rec) and rec[name] is value

  findByAttribute: (name, value) ->
    @findAllByAttribute(name, value)[0]

  select: (cb) ->
    @model.select (rec) =>
      @associated(rec) and cb(rec)

  refresh: (values) ->
    delete @model.records[record.id] for record in @all()
    records = @model.fromJSON(values)

    records = [records] unless isArray(records)

    for record in records
      record.newRecord = false
      record[@fkey] = @record.id
      @model.records[record.id] = record

    @model.trigger('refresh', @model.cloneArray(records))

  create: (record) ->
    record[@fkey] = @record.id
    @model.create(record)

  # Private

  associated: (record) ->
    record[@fkey] is @record.id

class M2MCollection extends Spine.Module
  constructor: (options={}) ->
    for key, value of options
      @[key] = value

  add: (item) ->
    if isArray(item)
      @add i for i in item

    else
      item = @model.find item unless item instanceof @model
      tmp = new @hub()
      if @left_to_right
        tmp["#{@rev_name}_id"] = @record.id
        tmp["#{@name}_id"] = item.id

      else
        tmp["#{@rev_name}_id"] = item.id
        tmp["#{@name}_id"] = @record.id
      tmp.save()

  remove: (item) ->
    i.destroy() for i in @hub.select (item) =>
      @associated(item)

  _link: (items) ->
    items.map (item) =>
      if @left_to_right then return @model.find item["#{@name}_id"]
      else return @model.find item["#{@rev_name}_id"]

  all: ->
    @_link @hub.select (item) =>
      @associated(item)

  first: ->
    @all()[0]

  last: ->
    values = @all()
    values[values.length -1]
  
  find: (id) ->
    records = @hub.select (rec) =>
      @associated(rec, id)

    throw 'Unknown record' unless records[0]
    @_link(records)[0]

  create: (record) ->
    @add @model.create(record)

  associated: (record, id) ->
    if @left_to_right
      return false unless record["#{@rev_name}_id"] is @record.id
      return record["#{@rev_name}_id"] is id if id
      
    else
      return false unless record["#{@name}_id"] is @record.id
      return record["#{@name}_id"] is id if id

    true
    
class Instance extends Spine.Module
  constructor: (options = {}) ->
    for key, value of options
      @[key] = value

  exists: ->
    @record[@fkey] and @model.exists(@record[@fkey])

  update: (value) ->
    unless value instanceof @model
      value = new @model(value)
    value.save() if value.isNew()
    @record.__proto__[@fkey] = value and value.id

class Singleton extends Spine.Module
  constructor: (options = {}) ->
    for key, value of options
      @[key] = value

  find: ->
    @record.id and @model.findByAttribute(@fkey, @record.id)

  update: (value) ->
    unless value instanceof @model
      value = @model.fromJSON(value)

    value[@fkey] = @record.id
    value.save()

singularize = (str) ->
  str.replace(/s$/, '')

underscore = (str) ->
  str.replace(/::/g, '/')
     .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
     .replace(/([a-z\d])([A-Z])/g, '$1_$2')
     .replace(/-/g, '_')
     .toLowerCase()

Spine.Model.extend
  hasMany: (name, model, fkey) ->
    fkey ?= "#{underscore(this.className)}_id"

    association = (record) ->
      model = require(model) if typeof model is 'string'

      new Collection(
        name: name, model: model,
        record: record, fkey: fkey
      )

    @::[name] = (value) ->
      association(@).refresh(value) if value?
      association(@)

  belongsTo: (name, model, fkey) ->
    fkey ?= "#{singularize(name)}_id"

    association = (record) ->
      model = require(model) if typeof model is 'string'

      new Instance(
        name: name, model: model,
        record: record, fkey: fkey
      )

    @::[name] = (value) ->
      association(@).update(value) if value?
      association(@).exists()

    @attributes.push(fkey)

  hasOne: (name, model, fkey) ->
    fkey ?= "#{underscore(@className)}_id"

    association = (record) ->
      model = require(model) if typeof model is 'string'

      new Singleton(
        name: name, model: model,
        record: record, fkey: fkey
      )

    @::[name] = (value) ->
      association(@).update(value) if value?
      association(@).find()




  foreignKey: (model, name, rev_name) ->
    rev_name ?= @className.toLowerCase()
    rev_name = singularize underscore rev_name

    model = require(model) if typeof model is 'string'
    name ?= model.className.toLowerCase()
    name = singularize underscore name

    @belongsTo name, model
    model.hasMany "#{rev_name}s", @


  manyToMany: (model, name, rev_name) ->
    rev_name ?= @className.toLowerCase()
    rev_name = singularize underscore rev_name
    rev_model = @

    model = require(model) if typeof model is 'string'
    name ?= model.className.toLowerCase()
    name = singularize underscore name

    local = typeof model.loadLocal is 'function' and typeof rev_model.loadLocal is 'function'

    class tmpModel extends Spine.Model
      @configure "_#{rev_name}s_to_#{name}s", "#{@rev_name}_id", "#{@name}_id"
      @extend Spine.Model.Local if local

    tmpModel.fetch() if local

    tmpModel.foreignKey rev_model, "#{rev_name}"
    tmpModel.foreignKey model, "#{name}"


    association = (record, model, left_to_right) ->
      new M2MCollection {name, rev_name, record, model, hub: tmpModel, left_to_right}


    rev_model::["#{name}s"] = (value) ->
      association(@, model, true)

    model::["#{rev_name}s"] = (value) ->
      association(@, rev_model, false)
