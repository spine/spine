Spine   ?= require('spine')
require ?= ((value) -> eval(value))

class Collection extends Spine.Module
  constructor: (options = {}) ->
    for key, value of options
      @[key] = value
        
  all: ->
    @model.select (rec) => @associated(rec)
    
  first: ->
    @all()[0]
    
  last: ->
    values = @all()
    values[values.length - 1]
    
  find: (id) ->
    records = @model.select (rec) =>
      @associated(rec) and rec.id is id
    throw('Unknown record') unless records[0]
    records[0]
    
  select: (cb) ->
    @model.select (rec) =>
      @associated(rec) and cb(rec)
    
  refresh: (values) ->
    records = @all()
    for record in records
      delete @model.records[record.id]
    
    values = @model.fromJSON(values)
    for value in values
      value.newRecord = false
      value[@fkey] = @record.id
      @model.records[value.id] = value
      
    @model.trigger('refresh')
    
  create: (record) ->
    record[@fkey] = @record.id
    @model.create(record)
    
  # Private
  
  associated: (record) ->
    record[@fkey] is @record.id
    
class Instance extends Spine.Module
  constructor: (options = {}) ->
    for key, value of options
      @[key] = value
    
  exists: ->
    @record[@fkey] and @model.exists(@record[@fkey])
    
  update: (value) ->
    @record[@fkey] = value and value.id

class Singleton extends Spine.Module
  constructor: (options = {}) ->
    for key, value of options
      @[key] = value

  find: ->
    @record.id and @model.findByAttribute(@fkey, @record.id)

  update: (value) ->
    value?[@fkey] = @id
    value

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