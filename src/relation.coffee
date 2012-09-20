Spine   = @Spine or require('spine')
isArray = Spine.isArray
require = @require or ((value) -> eval(value))

class RelationBase extends Spine.Module

  constructor: (options = {}) ->
    for key, value of options
      @[key] = value

class Collection extends RelationBase
  
  all: ->
    @model.findAllByAttribute(@fkey, @record.id)

  first: ->
    @model.findByAttribute(@fkey, @record.id)

  last: ->
    values = @all()
    values[values.length - 1]

  find: (id) ->
    return record if (record = @model.find(id)) and record[@fkey] is @record.id
    throw('Unknown record')

  select: (callback) ->
    fkey = @fkey
    rec_id = @record.id
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
    value[@fkey] = @record.id
    @model.create(value)

  # Private

  associated: (record) ->
    record[@fkey] is @record.id

class Instance extends RelationBase

  exists: ->
    @record[@fkey] and @model.exists(@record[@fkey])

  update: (value) ->
    if value?
      unless value instanceof @model
        value = @model.new(value)
      value.save() if value.isNew()
      @record[@fkey] = value and value.id
    @

class Singleton extends RelationBase

  find: ->
    @record.id and @model.findByAttribute(@fkey, @record.id)

  update: (value) ->
    if value?
      unless value instanceof @model
        value = @model.new(value)

      value[@fkey] = @record.id
      value.save()
    @

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
  hasMany: (name, model, fkey) ->
    fkey ?= "#{underscore(@className)}_id"
    @::[name] = (value) ->
      assoc(name, model, @, fkey, Collection).refresh(value)

  belongsTo: (name, model, fkey) ->
    fkey ?= "#{singularize(name)}_id"
    @::[name] = (value) ->
      assoc(name, model, @, fkey, Instance).update(value).exists()

    @attributes.push(fkey)

  hasOne: (name, model, fkey) ->
    fkey ?= "#{underscore(@className)}_id"
    @::[name] = (value) ->
      assoc(name, value, @, fkey, Singleton).update(value).find()
  #
#