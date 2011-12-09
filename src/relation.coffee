Spine   ?= require('spine')
require ?= ((value) -> eval(value))

class Relation extends Spine.Module
  constructor: (options = {}) ->
    # add all optional properties to model
    for key, value of options
      # make sure if it's the "model" property that it's converted from string to class
      @[key] = if key is 'model' and typeof value is 'string' then @stringToClass(value) else value
      @polymorphic = true if key is 'as' or key is 'polymorphic'
    
    #set the model class in case polymorphic
    @updateModel()
  
  # Private
  
  associated: (record) ->
    (!@polymorphic or record[@ftype] is @modelName(@record)) and record[@fkey] is @record.id
    
  associate: (record, foreign) ->
    record[@fkey] = foreign and foreign.id
    record[@ftype] = @polymorphic and foreign and @modelName(foreign)
    record
  
  #updates @model if there's a polymorphic association
  updateModel: ->
    @model = if @record[@fkey] and @polymorphic then @stringToClass(@record[@ftype]) else @model
  
  stringToClass: (modelName) ->
    # namespace is optional for developers not using CommonJS
    modelName = @modelName(modelName) if typeof modelName isnt 'string'
    modelName = "#{@namespace}.#{modelName}" if @namespace
    require modelName

  modelName: (record) ->
    record.constructor.className
  
class Collection extends Relation
  constructor: (options = {}) ->
    super options
    
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
      rec[name] is value
    
  findByAttribute: (name, value) ->
    @findAllByAttribute(name, value)[0]
      
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
      @associate value, @record
      @model.records[value.id] = value
      
    @model.trigger('refresh')
    
  create: (record = {}) ->
    @associate record, @record
    @model.create(record)
  
  #bind only to events on associated records
  bind: (ev, callback) ->
    callback.proxy = (record) => 
      callback.apply(@, arguments) if @associated record
    
    @model.bind ev, callback.proxy
    @
    
  unbind: (ev, callback) ->
    @model.unbind ev, callback.proxy
    @

class Instance extends Relation
  constructor: (options = {}) ->
    super options
    
  exists: ->
    @model and @record[@fkey] and @model.exists(@record[@fkey])
  
  update: (value) ->
    @associate @record, value
    @updateModel()
    @record
  
class Singleton extends Relation
  constructor: (options = {}) ->
    super options

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

optionize = (name, model, fkey) ->
  # backwards compatibility:
  # first see if fkey is an options hash, then check model 
  # (polymorphic relationships won't have a model, so that's when the model would be an options hash)
  if (options = if typeof fkey is 'string' then { fkey: fkey } else fkey)
    options['model'] = model
  else
    options = if typeof model is 'string' then { model: model } else model or {}
  # polymorphic association
  if options['as']
    options['fkey'] or= "#{options['as']}_id" 
    options['ftype'] or= "#{options['as']}_type"
  
  options

Spine.Model.extend 
  # options = { model, fkey, as, ftype, namespace }
  hasMany: (name, options = {}) -> 
    #optionize converts args for backwards-compatibility
    options = optionize arguments...
    options['fkey'] or= "#{underscore(@className)}_id"
    
    association = (record) -> 
      options['record'] = record
      new Collection(options)
    
    @::[name] = (values) ->
      association(@).refresh(values) if values?
      association(@)
    
    #make association information available on model
    @associations or= {}
    @associations[name] = options
  
  # options = { model, fkey, polymorphic, ftype, namespace }
  belongsTo: (name, options = {}) -> 
    #optionize converts args for backwards-compatibility
    options = optionize arguments...
    options['fkey'] or= "#{singularize(name)}_id"
    options['ftype'] or= "#{singularize(name)}_type" if options['polymorphic']
    
    association = (record) -> 
      options['record'] = record
      new Instance(options)
      
    @::[name] = (value) ->
      association(@).update(value) if value?
      association(@).exists()

    @attributes.push(options['fkey'])
    @attributes.push(options['ftype']) if options['polymorphic']
    
    #make association information available on model
    @associations or= {}
    @associations[name] = options
  
  # options = { model, fkey } for consistency (until polymorph is implemented)
  hasOne: (name, options = {}) -> 
    #optionize converts args for backwards-compatibility
    options = optionize arguments...
    options['fkey'] or= "#{underscore(@className)}_id"
    
    association = (record) -> 
      options['record'] = record
      new Singleton(options)
      
    @::[name] = (value) ->
      association(@).update(value) if value?
      association(@).find()
    
    #make association information available on model
    @associations or= {}
    @associations[name] = options
    
