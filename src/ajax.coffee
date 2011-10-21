Spine ?= require('spine')
$      = Spine.$
Model  = Spine.Model

Ajax =
  getURL: (object) ->
    object and object.url?() or object.url

  enabled:  true
  pending:  false
  requests: []

  disable: (callback) ->
    @enabled = false
    do callback
    @enabled = true

  requestNext: ->
    next = @requests.shift()
    if next
      @request(next)
    else
      @pending = false

  request: (callback) ->
    (do callback).complete(=> do @requestNext)
      
  queue: (callback) ->
    return unless @enabled
    if @pending
      @requests.push(callback)
    else
      @pending = true
      @request(callback)    
    callback
    
class Base
  defaults:
    contentType: 'application/json'
    dataType: 'json'
    processData: false
    headers: {'X-Requested-With': 'XMLHttpRequest'}
  
  ajax: (params, defaults) ->
    $.ajax($.extend({}, @defaults, defaults, params))
    
  queue: (callback) ->
    Ajax.queue(callback)

class Collection extends Base
  constructor: (@model) -> 
    
  find: (id, params) ->
    record = new @model(id: id)
    @ajax(
      params,
      type: 'GET',
      url:  Ajax.getURL(record)
    ).success(@recordsResponse)
     .error(@errorResponse)
    
  all: (params) ->
    @ajax(
      params,
      type: 'GET',
      url:  Ajax.getURL(@model)
    ).success(@recordsResponse)
     .error(@errorResponse)
    
  fetch: (params = {}) ->
    if id = params.id
      delete params.id
      @find(id, params).success (record) =>
        @model.refresh(record)
    else
      @all(params).success (records) =>
        @model.refresh(records)
    
  recordsResponse: (data, status, xhr) =>
    @model.trigger('ajaxSuccess', null, status, xhr)

  errorResponse: (xhr, statusText, error) =>
    @model.trigger('ajaxError', null, xhr, statusText, error)

class Singleton extends Base
  constructor: (@record) ->
    @model = @record.constructor
  
  reload: (params) ->
    @queue =>
      @ajax(
        params,
        type: 'GET'
        url:  Ajax.getURL(@record)
      ).success(@recordResponse)
       .error(@errorResponse)
  
  create: (params) ->
    @queue =>
      @ajax(
        params,
        type: 'POST'
        data: JSON.stringify(@record)
        url:  Ajax.getURL(@model)
      ).success(@recordResponse)
       .error(@errorResponse)

  update: (params) ->
    @queue =>
      @ajax(
        params,
        type: 'PUT'
        data: JSON.stringify(@record)
        url:  Ajax.getURL(@record)
      ).success(@recordResponse)
       .error(@errorResponse)
  
  destroy: (params) ->
    @queue =>
      @ajax(
        params,
        type: 'DELETE'
        url:  Ajax.getURL(@record)
      ).success(@recordResponse)
       .error(@errorResponse)  

  # Private

  recordResponse: (data, status, xhr) =>
    @record.trigger('ajaxSuccess', status, xhr)
    
    return if Spine.isBlank(data)
    data = @model.fromJSON(data)
    
    Ajax.disable =>        
      # ID change, need to do some shifting
      if data.id and @record.id isnt data.id
        @record.changeID(data.id)

      # Update with latest data
      @record.updateAttributes(data.attributes())      
      
  blankResponse: (data, status, xhr) =>
    @record.trigger('ajaxSuccess', status, xhr)

  errorResponse: (xhr, statusText, error) =>
    @record.trigger('ajaxError', xhr, statusText, error)

# Ajax endpoint
Model.host = ''

Include =
  ajax: -> new Singleton(this)

  url: ->
    base = Ajax.getURL(@constructor)
    base += '/' unless base.charAt(base.length - 1) is '/'
    base += encodeURIComponent(@id)
    base
    
Extend = 
  ajax: -> new Collection(this)

  url: ->
    "#{Model.host}/#{@className.toLowerCase()}s"
      
Model.Ajax =
  extended: ->
    @fetch @ajaxFetch
    @change @ajaxChange
    
    @extend Extend
    @include Include
    
  ajaxFetch: ->
    @ajax().fetch(arguments...)
    
  ajaxChange: (record, type) ->
    record.ajax()[type]()
    
Model.Ajax.Methods = 
  extended: ->
    @extend Extend
    @include Include
    
# Globals
Spine.Ajax      = Ajax
module?.exports = Ajax
