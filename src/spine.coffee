Events = 
  bind: (ev, callback) ->
    evs   = ev.split(' ')
    calls = @hasOwnProperty('_callbacks') and @_callbacks or= {}
  
    for name in evs
      calls[name] or= []
      calls[name].push(callback)
    @
    
  one: (ev, callback) ->
    @bind ev, ->
      @unbind(ev, arguments.callee)
      callback.apply(@, arguments)

  trigger: (args...) ->
    ev = args.shift()
      
    list = @hasOwnProperty('_callbacks') and @_callbacks?[ev]
    return false unless list
  
    for callback in list
      if callback.apply(@, args) is false
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

    for cb, i in list when cb is callback
      list = list.slice()
      list.splice(i, 1)
      @_callbacks[ev] = list
      break
    @

Log =
  trace: true

  logPrefix: '(App)'

  log: (args...) ->
    return unless @trace
    return if typeof console is 'undefined'
    if @logPrefix then args.unshift(@logPrefix)
    console.log(args...)
    @

moduleKeywords = ['included', 'extended']

class Module
  @include: (obj) ->
    throw('include(obj) requires obj') unless obj
    for key, value of obj when key not in moduleKeywords
      @::[key] = value

    included = obj.included
    included.apply(this) if included
    @

  @extend: (obj) ->
    throw('extend(obj) requires obj') unless obj
    for key, value of obj when key not in moduleKeywords
      @[key] = value
    
    extended = obj.extended
    extended.apply(this) if extended
    @
    
  @proxy: (func) ->
    => func.apply(@, arguments)

  proxy: (func) ->
    => func.apply(@, arguments)

  constructor: ->
    @init?(arguments...)

class Model extends Module
  @extend Events
  
  @records: {}
  @attributes: []
  
  @configure: (name, attributes...) ->
    @className  = name
    @records    = {}
    @attributes = attributes if attributes.length
    @attributes and= makeArray(@attributes)
    @attributes or=  []
    @unbind()
    @
    
  @toString: -> "#{@className}(#{@attributes.join(", ")})"

  @find: (id) ->
    record = @records[id]
    throw('Unknown record') unless record
    record.clone()

  @exists: (id) ->
    try
      return @find(id)
    catch e
      return false

  @refresh: (values, options = {}) ->
    @records = {} if options.clear
    records = @fromJSON(values)
    
    records = [records] unless isArray(records)
    
    for record in records
      record.newRecord    = false
      record.id           or= guid()
      @records[record.id] = record

    @trigger('refresh', not options.clear and records)
    @

  @select: (callback) ->
    result = (record for id, record of @records when callback(record))
    @cloneArray(result)

  @findByAttribute: (name, value) ->
    for id, record of @records
      if record[name] is value
        return record.clone()
    null

  @findAllByAttribute: (name, value) ->
    @select (item) ->
      item[name] is value

  @each: (callback) ->
    for key, value of @records
      callback(value.clone())

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
    if typeof callbackOrParams is 'function'
      @bind('change', callbackOrParams)
    else
      @trigger('change', callbackOrParams)

  @fetch: (callbackOrParams) ->
    if typeof callbackOrParams is 'function'
      @bind('fetch', callbackOrParams)
    else
      @trigger('fetch', callbackOrParams)

  @toJSON: ->
    @recordsValues()
  
  @fromJSON: (objects) ->
    return unless objects
    if typeof objects is 'string'
      objects = JSON.parse(objects)
    if isArray(objects)
      (new @(value) for value in objects)
    else
      new @(objects)
      
  @fromForm: ->
    (new this).fromForm(arguments...)

  # Private

  @recordsValues: ->
    result = []
    for key, value of @records
      result.push(value)
    result

  @cloneArray: (array) ->
    (value.clone() for value in array)

  # Instance
 
  newRecord: true

  constructor: (atts) ->
    super
    @ids = []
    @load atts if atts

  isNew: () ->
    @newRecord
  
  isValid: () ->
    not @validate()

  validate: ->

  load: (atts) ->
    for key, value of atts
      if typeof @[key] is 'function'
        @[key](value)
      else
        @[key] = value
    @

  attributes: ->
    result = {}
    for key in @constructor.attributes when key of @
      if typeof @[key] is 'function'
        result[key] = @[key]()
      else
        result[key] = @[key]
    result.id = @id if @id
    result

  eql: (rec) ->
    rec and rec.constructor is @constructor and 
      (rec.id is @id or @id in rec.ids or rec.id in @ids)

  save: ->
    error = @validate()
    if error
      @trigger('error', error)
      return false
    
    @trigger('beforeSave')
    record = if @newRecord then @create() else @update()
    @trigger('save')
    record

  updateAttribute: (name, value) ->
    @[name] = value
    @save()

  updateAttributes: (atts) ->
    @load(atts)
    @save()
    
  changeID: (id) ->
    @ids.push(@id)
    records = @constructor.records
    records[id] = records[@id]
    delete records[@id]
    @id = id
    @save()
  
  destroy: ->
    @trigger('beforeDestroy')
    delete @constructor.records[@id]
    @destroyed = true
    @trigger('destroy')
    @trigger('change', 'destroy')
    @unbind()
    @

  dup: (newRecord) ->
    result = new @constructor(@attributes())
    if newRecord is false
      result.newRecord = @newRecord
    else
      delete result.id
    result
  
  clone: ->
    Object.create(@)

  reload: ->
    return @ if @newRecord
    original = @constructor.find(@id)
    @load(original.attributes())
    original

  toJSON: ->
    @attributes()
    
  toString: ->
    "<#{@constructor.className} (#{JSON.stringify(@)})>"
      
  fromForm: (form) ->
    result = {}
    for key in $(form).serializeArray()
      result[key.name] = key.value
    @load(result)
  
  exists: ->
    @id && @id of @constructor.records

  # Private

  update: ->
    @trigger('beforeUpdate')
    records = @constructor.records
    records[@id].load @attributes()
    clone = records[@id].clone()
    clone.trigger('update')
    clone.trigger('change', 'update')
    clone

  create: ->
    @trigger('beforeCreate')
    @id          = guid() unless @id
    @newRecord   = false    
    records      = @constructor.records
    records[@id] = @dup(false)
    clone        = records[@id].clone()
    clone.trigger('create')
    clone.trigger('change', 'create')
    clone
  
  bind: (events, callback) ->
    @constructor.bind events, binder = (record) =>
      if record && @eql(record)
        callback.apply(@, arguments)
    @constructor.bind 'unbind', unbinder = (record) =>
      if record && @eql(record)
        @constructor.unbind(events, binder)
        @constructor.unbind('unbind', unbinder)
    binder
  
  trigger: (args...) ->
    args.splice(1, 0, @)
    @constructor.trigger(args...)
    
  unbind: ->
    @trigger('unbind')

class Controller extends Module
  @include Events
  @include Log
  
  eventSplitter: /^(\S+)\s*(.*)$/
  tag: 'div'
  
  constructor: (options) ->
    @options = options

    for key, value of @options
      @[key] = value

    @el = document.createElement(@tag) unless @el
    @el = $(@el)

    @el.addClass(@className) if @className
      
    @release -> @el.remove()

    @events = @constructor.events unless @events
    @elements = @constructor.elements unless @elements
    
    @delegateEvents() if @events
    @refreshElements() if @elements

    super
     
  release: (callback) =>
    if typeof callback is 'function'
      @bind 'release', callback
    else
      @trigger 'release'
      
  $: (selector) -> $(selector, @el)
      
  delegateEvents: ->
    for key, method of @events
      unless typeof(method) is 'function'
        method = @proxy(@[method])

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
    setTimeout(@proxy(func), timeout || 0)
    
  html: (element) -> 
    @el.html(element.el or element)
    @refreshElements()
    @el

  append: (elements...) -> 
    elements = (e.el or e for e in elements)
    @el.append(elements...)
    @refreshElements()
    @el
    
  appendTo: (element) -> 
    @el.appendTo(element.el or element)
    @refreshElements()
    @el

  prepend: (elements...) -> 
    elements = (e.el or e for e in elements)
    @el.prepend(elements...)
    @refreshElements()
    @el
    
  replace: (element) ->
    [previous, @el] = [@el, element.el or element]
    previous.replaceWith(@el)
    @delegateEvents()
    @refreshElements()
    @el

# Utilities & Shims

$ = @jQuery or @Zepto or (element) -> element

unless typeof Object.create is 'function'
  Object.create = (o) ->
    Func = ->
    Func.prototype = o
    new Func()

isArray = (value) ->
  Object::toString.call(value) is '[object Array]'

isBlank = (value) ->
  return true unless value 
  return false for key of value
  true
  
makeArray = (args) ->
  Array.prototype.slice.call(args, 0)
  
guid = ->
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c) ->
    r = Math.random() * 16 | 0
    v = if c is 'x' then r else r & 3 | 8
    v.toString 16
  .toUpperCase()

# Globals

Spine = @Spine   = {}
module?.exports  = Spine

Spine.version    = '1.0.5'
Spine.isArray    = isArray
Spine.isBlank    = isBlank
Spine.$          = $
Spine.Events     = Events
Spine.Log        = Log
Spine.Module     = Module
Spine.Controller = Controller
Spine.Model      = Model

# Global events

Module.extend.call(Spine, Events)
  
# JavaScript compatability

Module.create = Module.sub =
Controller.create = Controller.sub =
Model.sub = (instances, statics) ->
  class result extends this
  result.include(instances) if instances
  result.extend(statics) if statics
  result.unbind?()
  result
  
Model.setup = (name, attributes = []) ->
  class Instance extends this
  Instance.configure(name, attributes...)
  Instance

Module.init = Controller.init = Model.init = (a1, a2, a3, a4, a5) ->
  new this(a1, a2, a3, a4, a5)
  
Spine.Class = Module