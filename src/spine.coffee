$ = @jQuery or Zepto or -> arguments[0]

Events = 
  bind: (ev, callback) ->
    evs   = ev.split(" ")
    calls = @_callbacks || @_callbacks = {}
  
    for name in evs
      @_callbacks[name] or= []
      @_callbacks[name].push(callback)
    @

  trigger: (args...) ->
    ev = args.shift()
  
    list = @_callbacks?[ev]
    return false unless list
  
    for callback in list
      if callback.apply(this, args) is false
        break      
    true

  unbind: (ev, callback) ->
    unless ev
      @_callbacks = {}
      return @
  
    list = @_callbacks?[ev]
    return @ unless list
  
    unless callback
      delete @_callbacks[ev]
      return @

    for cb, i in list when c is callback
      list.splice(i, 1)
      break
    @

Log =
  trace: true

  logPrefix: "(App)"

  log: (args...) ->
    return unless @trace
    return if typeof console is "undefined"
    if @logPrefix then args.unshift(@logPrefix)
    console.log.apply(console, args)
    @

moduleKeywords = ["included", "extended"]

class Module
  include: (obj) ->
    for key, value of obj when key not in moduleKeywords
      @::[key] = value

    included = obj.included
    included.apply(this) if included
    @

  extend: (obj) ->
    for key, value of obj when key not in moduleKeywords
      @[key] = value
    
    extended = obj.extended
    extended.apply(this) if extended
    @
    
  proxy: (func) ->
    => func.apply(arguments)

class Model extends Module
  # created: (sub) ->
  #   @records = {}
  #   if @attributes
  #     makeArray(@attributes)
  #   else 
  #     @attributes = []

  @find: (id) ->
    record = @records[id]
    throw("Unknown record") unless record
    record.clone()

  @exists: (id) ->
    try
      return @find(id)
    catch e
      return false

  @refresh: (values, options = {}) ->
    @records = {} if options.clear

    for record in @fromJSON(values) 
      record.newRecord    = false
      @records[record.id] = record

    @trigger("refresh")
    @

  @select: (callback) ->
    result = (record for id, record of @records when callback(record))
    @cloneArray(result)

  @findByAttribute: (name, value) ->
    for id, record of @records
      if record[name] == value
        return record.clone()
    null

  @findAllByAttribute: (name, value) ->
    @select (item) ->
      item[name] is value

  @each: (callback) ->
    for key, value of @records
      callback(value)

  @all: ->
    @cloneArray(@recordsValues())

  @first: ->
    record = @recordsValues()[0]
    record?.clone()

  @last: ->
    values = @recordsValues()
    record = values[values.length - 1]
    record?.clone()

  @count: ->
    @recordsValues().length

  @deleteAll: ->
    for key, value of @records
      delete @records[key]

  @destroyAll: ->
    for key, value of @records
      @records[key].destroy()

  @update: (id, atts) ->
    @find(id).updateAttributes(atts)

  @create: (atts) ->
    record = new @(atts)
    record.save()

  @destroy: (id) ->
    @find(id).destroy()

  @change: (callbackOrParams) ->
    if typeof callbackOrParams is "function"
      @bind("change", callbackOrParams)
    else
      @trigger("change", callbackOrParams)

  @fetch: (callbackOrParams) ->
    if typeof callbackOrParams is "function"
      @bind("fetch", callbackOrParams)
    else
      @trigger("fetch", callbackOrParams)

  @toJSON: ->
    @recordsValues()
  
  @fromJSON: (objects) ->
    return unless objects
    if typeof objects is "string"
      objects = JSON.parse(objects)
    if isArray(objects)
      return (new @(value) for value in objects)
    else
      new @(objects)

  # Private

  @recordsValues: ->
    result = []
    for key, value of @records
      result.push(value)
    result

  @cloneArray: (array) ->
    result = []
    result.push value.clone() for value in array
    result

  # Instance
 
  model: true
  newRecord: true

  constructor: (atts) ->
    super
    @load atts if atts

  isNew: () ->
    @newRecord
  
  isValid: () ->
    not @validate()

  validate: ->

  load: (atts) ->
    for key, value of atts
      @[key] = value

  attributes: ->
    result = {}
    result[key] = @[key] for key in @contructor.attributes
    result.id   = @id
    result

  eql: (rec) ->
    rec and rec.id is @id and rec.parent is @contructor

  save: ->
    error = @validate()
    if error
      @trigger("error", @, error)
      return false
    
    @trigger("beforeSave", @)
    if @newRecord then @create() else @update()
    @trigger("save", @)
    return @

  updateAttribute: (name, value) ->
    @[name] = value
    @save()

  updateAttributes: (atts) ->
    @load(atts)
    @save()
  
  destroy: ->
    @trigger("beforeDestroy", @)
    delete @contructor.records[@id]
    @destroyed = true
    @trigger("destroy", @)
    @trigger("change", @, "destroy")

  dup: ->
    result = new @contructor(@attributes())
    result.newRecord = @newRecord
    result
  
  clone: ->
    Object.create(@)

  reload: ->
    return @ if @newRecord
    original = @contructor.find(@id)
    @load(original.attributes())
    return original

  toJSON: ->
    @attributes()
  
  exists: ->
    @id && @id of @constructor.records

  # Private

  update: ->
    @trigger("beforeUpdate", @)
    records = @contructor.records
    records[@id].load @attributes()
    clone = records[@id].clone()
    @trigger("update", clone)
    @trigger("change", clone, "update")

  create: ->
    @trigger("beforeCreate", @)
    @id          = guid() unless @id
    @newRecord   = false
    records      = @contructor.records
    records[@id] = @dup()
    clone        = records[@id].clone()
    @trigger("create", clone)
    @trigger("change", clone, "create")
  
  bind: (events, callback) ->
    @contructor.bind events, (record) =>
      if record && @eql(record)
        callback.apply(@, arguments)
  
  trigger: ->
    @contructor.trigger.apply(@contructor, arguments)

Model.extend(Events)

class Controller extends Module
  eventSplitter: /^(\w+)\s*(.*)$/
  tag: "div"
  
  constructor: (options) ->
    @options = options

    for key, value of @options
      @[key] = value

    @el = document.createElement(@tag) unless @el
    @el = $(@el)

    @events = @contructor.events unless @events
    @elements = @contructor.elements unless @elements

    @delegateEvents() if @events
    @refreshElements() if @elements
      
  $: (selector) ->
    $(selector, @el)
      
  delegateEvents: ->
    for key of @events
      methodName = @events[key]
      method     = @[methodName].bind(@)
      
      match      = key.match(@eventSplitter)
      eventName  = match[1]
      selector   = match[2]

      if selector is ''
        @el.bind(eventName, method)
      else
        @el.delegate(selector, eventName, method)
  
  refreshElements: ->
    for key, value of @elements
      @[value] = @$(key)
  
  delay: (func, timeout) ->
    setTimeout(func.bind(@), timeout || 0)
    
  html: -> @el.html.apply(@el, arguments)
  append: -> @el.append.apply(@el, arguments)
  appendTo: -> @el.appendTo.apply(@el, arguments)

Controller.include(Events)
Controller.include(Log)

# Utilities & Shims

unless typeof Object.create is "function"
  Object.create = (o) ->
    F = ->
    F.prototype = o
    new F()

isArray = (value) ->
  Object::toString.call(value) is "[object Array]"
  
guid = ->
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c) ->
    r = Math.random() * 16 | 0
    v = if c is 'x' then r else r & 3 | 8
    v.toString 16
  .toUpperCase()

# Globals

if typeof exports is not "undefined"
  Spine = exports
else
  Spine = @Spine = {}
  
Spine.version = "2.0.0"
Spine.isArray = isArray
Spine.Events  = Events
Spine.Log     = Log
Spine.Module  = Module
Spine.Model   = Model
Spine.Controller = Controller