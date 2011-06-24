Spine or= require("spine")
$     = Spine.$
Model = Spine.Model

Ajax = Spine.Ajax =
  getUrl: (object) ->
    return null unless object and object.url
    object.url?() or object.url

  methodMap: 
    "create":  "POST"
    "update":  "PUT"
    "destroy": "DELETE"
    "read":    "GET"

  send: (record, method, params) ->
    defaults =
      type:          @methodMap[method]
      contentType:  "application/json"
      dataType:     "json"
      data:         {}
    
    params = $.extend({}, defaults, params)
    
    if method is "create" and record.model
      params.url = @getUrl(record.constructor)
    else
      params.url = @getUrl(record)

    throw("Invalid URL") unless params.url
    
    if method is "create" or method is "update"
      params.data = JSON.stringify(record)
      params.processData = false
      params.success = (data, status, xhr) ->
        return unless data

        # Simple deep object comparison
        return if JSON.stringify(record) is JSON.stringify(data)

        # ID change, need to do some shifting
        if data.id and record.id != data.id
          records = record.constructor.records
          records[data.id] = records[record.id]
          delete records[record.id]
          record.id = data.id

        # Update with latest data
        Ajax.disable ->
          record.updateAttributes(data); 

        record.trigger("ajaxSuccess", record, status, xhr)
  
    if method is "read" and not params.success
      params.success = ->
       (record.refresh or record.load).call(record, data)
  
    success = params.success
    params.success = ->
      success.apply(Ajax, arguments) if success
      Ajax.sendNext()
  
    params.error = (xhr, s, e) ->
      if record.trigger("ajaxError", record, xhr, s, e)
        Ajax.sendNext()
  
    $.ajax(params)
  
  enabled:  true
  pending:  false
  requests: []
  
  disable: (callback) ->
    @enabled = false
    callback()
    @enabled = true

  sendNext: ->
    next = @requests.shift()
    if next
      @send.apply(@, next)
    else
      @pending = false

  request: ->
    return unless @enabled
    if @pending
      @requests.push(arguments)
    else
      @pending = true;
      @send.apply(this, arguments)

Include =
  url: ->
    base = Ajax.getUrl(@constructor)
    base += "/" unless base.charAt(base.length - 1) is "/"
    base += encodeURIComponent(@id)
    return base;

Model.Ajax =
  extended: ->
    @change ->
      Ajax.request.apply(Ajax, arguments)
    @fetch (params) =>
      Ajax.request(@, "read", params)
    @include Include

  ajaxPrefix: false

  url: ->
    "/#{@className.toLowerCase()}s"
    
module?.exports = Model.Ajax