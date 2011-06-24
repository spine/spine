class Collection
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
    throw("Unknown record") unless records[0]
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
      
    @model.trigger("refresh")
    
  create: (record) ->
    record[@fkey] = @record.id
    @model.create(record)
    
  # Private
  
  associated: (record) ->
    record[@fkey] is @record.id
    
class Instance
  constructor: (options = {}) ->
    for key, value of options
      @[key] = value
    
  find: ->
    @record[@fkey] && @model.find(@record[@fkey])
    
  update: (value) ->
    @record[@fkey] = value && value.id 

singularize = (str) ->
  str.replace(/s$/, '')
  
underscore = (str) ->
  str.replace(/::/g, '/')
     .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
     .replace(/([a-z\d])([A-Z])/g, '$1_$2')
     .replace(/-/g, '_')
     .toLowerCase()

Spine.Model.extend 
  many: (name, model, fkey) -> 
    fkey ?= "#{underscore(@className)}_id"
    
    association = (record) -> 
      model = require(model) if typeof model is "string"
      
      new Collection(
        name: name, model: model, 
        record: record, fkey: fkey
      )
    
    @::__defineGetter__ name, ->
      return association(@)
      
    @::__defineSetter__ name, (value) ->
      return association(@).refresh(value)
  
  belongs: (name, model, fkey) ->
    fkey ?= "#{singularize(name)}_id"
    
    association = (record) ->
      model = require(model) if typeof model is "string"
      
      new Instance(
        name: name, model: model, 
        record: record, fkey: fkey
      )
      
    @::__defineGetter__ name, ->
      return association(@).find()
    
    @::__defineSetter__ name, (value) ->
      return association(@).update(value)
      
    @attributes.push(fkey)