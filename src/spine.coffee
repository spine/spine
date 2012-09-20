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
    return unless list

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
    if @logPrefix then args.unshift(@logPrefix)
    console?.log?(args...)
    @

moduleKeywords = ['included', 'extended']

class Module
  @include: (obj) ->
    throw new Error('include(obj) requires obj') unless obj
    for key, value of obj when key not in moduleKeywords
      @::[key] = value
    obj.included?.apply(@)
    @

  @extend: (obj) ->
    throw new Error('extend(obj) requires obj') unless obj
    for key, value of obj when key not in moduleKeywords
      @[key] = value
    obj.extended?.apply(@)
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
  @crecords: {}
  @uncreated_crecords: {}
  @attributes: []

  @configure: (name, attributes...) ->
    @className          = name
    @records            = {}
    @crecords           = {}
    @uncreated_crecords = {}
    @attributes       or= []
    @unbind()
    @

  @toString: -> "#{@className}(#{@attributes.join(", ")})"

  @new: (atts) ->
    return record if (id = atts.id) and (record = @exists(id))
    record = new @(atts)
    @uncreated_crecords[record.cid] = record
    record.clone()

  @find: (id) ->
    record = @records[id]
    if !record and ("#{id}").match(/c-\d+/)
      return @findCID(id)
    throw new Error('Unknown record') unless record
    record.clone()

  @findCID: (cid) ->
    record = @crecords[cid]
    throw new Error('Unknown record') unless record
    record.clone()

  @exists: (id) ->
    try
      @find(id)
    catch e
      false

  @refresh: (values, options = {}) ->
    if options.clear
      @records  = {}
      @crecords = {}
    return unless values
    
    values = JSON.parse(values) if typeof objects is 'string'
    values = if isArray(values) then values else [values]
    clonedArray = []
    clonedArray.push(@new(value).refresh(value)) for value in values
    #
    @trigger('refresh', clonedArray)
    @

  @select: (callback) ->
    value.clone()           for key, value of @records when callback(value)

  @findByAttribute: (name, attr) ->
    return value.clone()    for key, value of @records when value[name] is attr
    undefined

  @findAllByAttribute: (name, attr) -> @select (value) -> value[name] is attr

  @each: (callback) ->
    callback(value.clone()) for key, value of @records

  @all: ->
    value.clone()           for key, value of @records

  @first: ->
    return value.clone()    for key, value of @records
    undefined

  @last: ->
    null                    for key, value of @records
    value?.clone() # value exist for last object

  @count: ->
    count = 0
    ++count                 for key of @records
    count

  @deleteAll: ->
    delete @records[key]    for key, value of @records

  @destroyAll: ->
    value.destroy()         for key, value of @records

  @toJSON: ->
    value.toJSON()          for key, value of @records

  @fromForm: ->
    @new().fromForm(arguments...)

  @create: (atts, options) ->
    @new(atts).save(options)

  @update: (id, atts, options) ->
    @find(id).updateAttributes(atts, options)

  @destroy: (id, options) ->
    @find(id).destroy(options)

  @change: (callbackOrParams) ->
    bindOrTrigger(@, 'change', callbackOrParams)

  @fetch: (callbackOrParams) ->
    bindOrTrigger(@, 'fetch', callbackOrParams)

  bindOrTrigger= (self, type, callbackOrParams) ->
    self[typeof callbackOrParams is 'function' ? 'bind' : 'change'](type, callbackOrParams)

  # Private

  @idCounter: 0

  @uid: (prefix = '') ->
    uid = prefix + @idCounter++
    uid = @uid(prefix) if @exists(uid)
    uid

  # Instance

  constructor: (atts) ->
    super
    @load atts if atts
    @cid = @constructor.uid('c-')

  eql: (rec) ->
    !!(rec and rec.constructor is @constructor and
        (rec.cid is @cid) or (rec.id and rec.id is @id))

  isNew: ->
    not @exists()

  isValid: ->
    not @validate()

  isCloned: ->
    if (protoRecord = @__proto__).__proto__ is @constructor.prototype
      protoRecord
    else
      false
  exists: ->
    @id && @id of @constructor.records

  validate: ->

  load: (atts) ->
    for key, value of atts
      if typeof @[key] is 'function'
        @[key](value)
      else
        @[key] = value
    @

  clone: ->
    clone = if protoRecord = @isCloned()
      createObject(protoRecord)
    else
      createObject(@)
    clone.load @attributes()
    clone
  
  # refresh is called whether the record should save to memory(ie, @constructor.records)
  # both internally (create, update) and externally (such as Spine.Ajax callback)
  # user should not call this method in general use.
  refresh: (value, options) ->
    constructor = @constructor
    if (protoRecord = @__proto__).__proto__ is constructor.prototype
      protoRecord.refresh(value, options)
    else
      value.id or= value.cid
      if @id not in constructor.records
        delete constructor.uncreated_crecords[@cid]
        constructor.records[@id]   = @
        constructor.crecords[@cid] = @
        # okay, save to memory
      if value.id and @id isnt value.id
        # ID change, need to do some shifting
        records = constructor.records
        records[value.id] = @
        delete records[@id]
      # update values(id also)
      @load(value)
    @

  changeID: (id) ->
    @refresh(id: id)
    @save()

  attributes: ->
    result = {}
    for key in @constructor.attributes when key of @
      if typeof @[key] is 'function'
        result[key] = @[key]()
      else
        result[key] = @[key]
    result.id = @id if @id
    result

  save: (options = {}) ->
    if options.validate is not false && (error = @validate())
      @trigger('error', error)
      return false

    @trigger('beforeSave', options)
    cloned = if @isNew() then @create(options) else @update(options)
    @trigger('save', options)
    cloned

  updateAttribute: (name, value, options) ->
    @[name] = value
    @save(options)

  updateAttributes: (atts, options) ->
    @load(atts)
    @save(options)

  destroy: (options = {}) ->
    @trigger('beforeDestroy', options)
    delete @constructor.records[@id]
    delete @constructor.crecords[@cid]
    @destroyed = true
    @trigger('destroy', options)
    @trigger('change', 'destroy', options)
    @unbind()
    @

  reload: ->
    return @ if @isNew()
    original = @constructor.find(@id)
    @load(original.attributes())
    original

  toJSON: @::attributes

  toString: ->
    "<#{@constructor.className} (#{JSON.stringify(@)})>"

  fromForm: (form) ->
    result = {}
    for key in $(form).serializeArray()
      result[key.name] = key.value
    @load(result)

  bind: (events, callback) ->
    if protoRecord = @isCloned()
      protoRecord.bind(events, callback)
      @constructor.bind(events, callback)
    else
      Events.bind.call(@, events, callback)
    @

  one: (events, callback) ->
    if protoRecord = @isCloned()
      protoRecord.one(events, callback)
      @constructor.one(events, callback)
    else
      Events.one.call(@, events, callback)
    @

  trigger: (args...) ->
    args.splice(1, 0, @)
    if protoRecord = @isCloned()
      protoRecord.trigger(args...)
      @constructor.trigger(args...)
    else
      Events.trigger.call(@, args...)
    @

  unbind: (args...) ->
    if protoRecord = @isCloned()
      protoRecord.unbind(args)
      @constructor.unbind(args)
    else
      Events.unbind.call(@, args)
    @

  # Private

  create: (options) ->
    @trigger('beforeCreate', options)
    @refresh(@attributes())
    @clone()
      .trigger('create', options)
      .trigger('change', 'create', options)

  update: (options) ->
    @trigger('beforeUpdate', options)
    @refresh(@attributes())
    @clone()
      .trigger('update', options)
      .trigger('change', 'update', options)

class Controller extends Module
  @include Events
  @include Log

  eventSplitter: /^(\S+)\s*(.*)$/
  tag: 'div'

  constructor: (options) ->
    @options = options

    for key, value of @options
      @[key] = value

    @el  = document.createElement(@tag) unless @el
    @el  = $(@el)
    @$el = @el

    @el.addClass(@className) if @className
    @el.attr(@attributes) if @attributes

    @events = @constructor.events unless @events
    @elements = @constructor.elements unless @elements

    @delegateEvents(@events) if @events
    @refreshElements() if @elements

    super

  release: =>
    @trigger 'release'
    @el.remove()
    @unbind()

  $: (selector) -> $(selector, @el)

  delegateEvents: (events) ->
    for key, method of events

      if typeof(method) is 'function'
        # Always return true from event handlers
        method = do (method) => =>
          method.apply(@, arguments)
          true
      else
        unless @[method]
          throw new Error("#{method} doesn't exist")

        method = do (method) => =>
          @[method].apply(@, arguments)
          true

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
    [previous, @el] = [@el, $(element.el or element)]
    previous.replaceWith(@el)
    @delegateEvents(@events)
    @refreshElements()
    @el

# Utilities & Shims

$ = window?.jQuery or window?.Zepto or (element) -> element

createObject = Object.create or (o) ->
  Func = ->
  Func.prototype = o
  new Func()

isArray = (value) ->
  Object::toString.call(value) is '[object Array]'

isBlank = (value) ->
  return true unless value
  return false for key of value
  true

# Globals

Spine = @Spine   = {}
module?.exports  = Spine

Spine.version    = '1.0.8'
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

Spine.Class = Module