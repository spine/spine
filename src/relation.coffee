Spine   = @Spine or require('spine')
isArray = Spine.isArray
require = @require or ((value) -> eval(value))

class RelationBase extends Spine.Module

  constructor: (options = {}) ->
    for key, value of options
      @[key] = value

class Collection extends RelationBase
  
  all: ->
    @model.findAllByAttribute(@fkey, @parent.id)

  first: ->
    @model.findByAttribute(@fkey, @parent.id)

  last: ->
    values = @all()
    values[values.length - 1]

  find: (id) ->
    return record if (record = @model.find(id)) and record[@fkey] is @parent.id
    throw('Unknown record')

  select: (callback) ->
    fkey = @fkey
    rec_id = @parent.id
    @model.select (record) -> record[fkey] is rec_id and callback(record)

  findAllByAttribute: (name, value) ->
    @select (record) -> record[name] is value

  findByAttribute: (name, value) ->
    @findAllByAttribute(name, value)[0]
  
  refresh: (values) ->
    if values?
      values = JSON.parse(values) if typeof values is 'string'
      values = if isArray(values) then values else [values]
      ids = {}
      ids[value.id] = value for value in values
      #
      # unassociated @model.records
      records = @model.records
      delete record[record.id] for record in @all() when ids[record.id] is undefined
      # TODO: maybe we can create a method named delete in Model.prototype?
      # do refresh now
      @model.refresh(values)
    @

  create: (value) ->
    value[@fkey] = @parent.id
    @model.create(value)

  # Private

  associated: (record) ->
    record[@fkey] is @parent.id

class Instance extends RelationBase

  refresh: (value) ->
    if value?
      record = @model.new(value).refresh(value)
      @parent[@fkey] = record and record.id
      record
    else
      @parent[@fkey] and @model.exists(@parent[@fkey])

class Singleton extends RelationBase

  refresh: (value) ->
    if value?
      record = @model.new(value).refresh(value)
      record[@fkey] = @parent.id
      record
    else
      @parent.id and @model.findByAttribute(@fkey, @parent.id)

singularize = (str) ->
  str.replace(/s$/, '')

underscore = (str) ->
  str.replace(/::/g, '/')
     .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
     .replace(/([a-z\d])([A-Z])/g, '$1_$2')
     .replace(/-/g, '_')
     .toLowerCase()

assoc = (name, model, record, fkey, Ctor) ->
  model = require(model) if typeof model is 'string'
  new Ctor(name: name, model: model, record: record, fkey: fkey)

Spine.Model.extend
  # this is parent...
  hasMany: (name, model, fkey) ->
    fkey ?= "#{underscore(@className)}_id"
    @::[name] = (value) ->
      assoc(name, model, @, fkey, Collection).refresh(value)

  belongsTo: (name, model, fkey) ->
    fkey ?= "#{singularize(name)}_id"
    @::[name] = (value) ->
      assoc(name, model, @, fkey, Instance).refresh(value)

    @attributes.push(fkey)

  hasOne: (name, model, fkey) ->
    fkey ?= "#{underscore(@className)}_id"
    @::[name] = (value) ->
      assoc(name, value, @, fkey, Singleton).refresh(value)
  #
#