Spine or= require("spine")
$     = Spine.$
Model = Spine.Model

Ajax =
  enabled:  true
  pending:  false
  requests: []
  getURL: (object) ->
    object and object.url?() or object.url

  disable: (callback) ->
    @enabled = false
    callback()
    @enabled = true

  requestNext: ->
    next = @requests.shift()
    if next
      @request.apply(@, next)
    else
      @pending = false

  request: (params) ->
    $.ajax(params)

  send: ->
    return unless @enabled
    if @pending
      @requests.push(arguments)
    else
      @pending = true
      @request(arguments...)
    
class Base
  defaults:
    contentType: "application/json"
    processData: false
  
  send: (params, defaults) ->
    Ajax.send($.extend({}, @defaults, defaults, params))

class Collection extends Base
  constructor: (@model) -> 
    super
    @url = Ajax.getURL(@model)
    
  findAll: (params) ->
    @send params,
          type: "GET",
          url: @url,
          success: @recordsResponse(params)
    
  fetch: ->
    @findAll success: (records) =>
      @model.refresh(records)
    
  recordsResponse: (params) =>
    success = params.success
    
    (data, status, xhr) =>
      model.trigger("ajaxSuccess", null, status, xhr)
      success?(@model.fromJSON(data))
    
class Singleton extends Base
  constructor: (@record) ->
    super
    @model = @record.constructor
    @url   = Ajax.getURL(@record)
  
  find: (params) ->
    @send params
          type: "GET"
          url:  @url
  
  create: (params) ->
    @send params
          type:    "POST"
          data:    JSON.stringify(@record)
          url:     @base.url
          success: @recordResponse(params)

  update: (params) ->
    @send params
          type:    "PUT"
          data:    JSON.stringify(@record)
          url:     @url
          success: @recordResponse(params)
  
  destroy: (params) ->
    @send params
          type:    "DELETE"
          url:     @url
          success: @blankResponse(params)
  
  # Private
  
  recordResponse: (params) =>
    success = params.success
  
    (data, status, xhr) =>
      @record.trigger("ajaxSuccess", @record, status, xhr)

      return if not data or params.data is data
      data = @model.fromJSON(data)

      # ID change, need to do some shifting
      if data.id and @record.id isnt data.id
        @record.updateID(data.id)

      # Update with latest data
      Ajax.disable ->
        @record.updateAttributes(data.attributes())
      
      success?(@record)
      
  blankResponse: (params) =>
    success = params.success
  
    (data, status, xhr) =>
      @record.trigger("ajaxSuccess", @record, status, xhr)

      success?(@record)

# Ajax endpoint
Model.host = ""

Include =
  ajax: -> new Singleton(this)

  url: ->
    base = Ajax.getURL(@constructor)
    base += "/" unless base.charAt(base.length - 1) is "/"
    base += encodeURIComponent(@id)
    base

Model.Ajax =
  ajax: -> new Collection(this)

  extended: ->
    @change (record, type) ->
      record.ajax[type]()
      
    @fetch ->
      @ajax.fetch(arguments...)
      
    @include Include

  url: ->
    "#{Model.host}/#{@className.toLowerCase()}s"
    
# Globals
Spine.Ajax      = Ajax
module?.exports = Ajax