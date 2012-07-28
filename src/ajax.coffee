Spine  = @Spine or require('spine')
$      = Spine.$
Model  = Spine.Model

Ajax =
  getURL: (object) ->
    object and object.url?() or object.url

  enabled:  true
  pending:  false
  requests: []

  disable: (callback) ->
    if @enabled
      @enabled = false
      try
        do callback
      catch e
        throw e
      finally
        @enabled = true
    else
      do callback

  requestNext: ->
    nextRequest = @requests.shift()
    if nextRequest
      @request(nextRequest)
    else
      @pending = false

  request: (request) ->
    $.ajax(
      request.params
    ).success(request.success)
     .error(request.error)
     .complete( => do @requestNext )

  queue: (request) ->
    return unless @enabled
    if @pending
      @requests.push(request)
    else
      @pending = true unless request.params.type == 'GET' and request.params.parallel
      @request(request)
    request

class Base
  defaults:
    contentType: 'application/json'
    dataType: 'json'
    processData: false
    headers: {'X-Requested-With': 'XMLHttpRequest'}

  queue: (params, defaults, success = [], error = []) ->
    request = 
      params: $.extend {}, @defaults, defaults, params
      success: if typeof success is 'function' then [success] else success
      error: if typeof error is 'function' then [error] else error
    Ajax.queue(request)

class Collection extends Base
  constructor: (@model) ->

  find: (id, params, success = ->) ->
    record = new @model(id: id)
    @queue params, {
        type: 'GET',
        url:  Ajax.getURL(record),
        parallel: true
      }, [@recordsResponse, success], [@errorResponse]

  all: (params, success = ->) ->
    @queue params, {
        type: 'GET',
        url:  Ajax.getURL(@model),
        parallel: true
      }, [@recordsResponse, success], [@errorResponse]

  fetch: (params = {}, options = {}) ->
    if id = params.id
      delete params.id
      @find(id, params, (record) =>
        @model.refresh(record, options)
      )
    else
      @all(params, (records) =>
        @model.refresh(records, options)
      )

  # Private

  recordsResponse: (data, status, xhr) =>
    @model.trigger('ajaxSuccess', null, status, xhr)

  errorResponse: (xhr, statusText, error) =>
    @model.trigger('ajaxError', null, xhr, statusText, error)

class Singleton extends Base
  constructor: (@record) ->
    @model = @record.constructor

  reload: (params, options) ->
    @queue params, {
        type: 'GET'
        url:  Ajax.getURL(@record)
      }, @recordResponse(options), @errorResponse(options)

  create: (params, options) ->
    @queue params, {
        type: 'POST'
        data: JSON.stringify(@record)
        url:  Ajax.getURL(@model)
      }, @recordResponse(options), @errorResponse(options)

  update: (params, options) ->
    @queue params, {
        type: 'PUT'
        data: JSON.stringify(@record)
        url:  Ajax.getURL(@record)
      }, @recordResponse(options), @errorResponse(options)

  destroy: (params, options) ->
    @queue params, {
        type: 'DELETE'
        url:  Ajax.getURL(@record)
      }, @recordResponse(options), @errorResponse(options)

  # Private

  recordResponse: (options = {}) =>
    (data, status, xhr) =>
      if Spine.isBlank(data)
        data = false
      else
        data = @model.fromJSON(data)

      Ajax.disable =>
        if data
          # ID change, need to do some shifting
          if data.id and @record.id isnt data.id
            @record.changeID(data.id)

          # Update with latest data
          @record.updateAttributes(data.attributes())

      @record.trigger('ajaxSuccess', data, status, xhr)
      options.success?.apply(@record)

  errorResponse: (options = {}) =>
    (xhr, statusText, error) =>
      @record.trigger('ajaxError', xhr, statusText, error)
      options.error?.apply(@record)

# Ajax endpoint
Model.host = ''

Include =
  ajax: -> new Singleton(this)

  url: (args...) ->
    url = Ajax.getURL(@constructor)
    url += '/' unless url.charAt(url.length - 1) is '/'
    url += encodeURIComponent(@id)
    args.unshift(url)
    args.join('/')

Extend =
  ajax: -> new Collection(this)

  url: (args...) ->
    args.unshift(@className.toLowerCase() + 's')
    args.unshift(Model.host)
    args.join('/')

Model.Ajax =
  extended: ->
    @fetch @ajaxFetch
    @change @ajaxChange

    @extend Extend
    @include Include

  # Private

  ajaxFetch: ->
    @ajax().fetch(arguments...)

  ajaxChange: (record, type, options = {}) ->
    return if options.ajax is false
    record.ajax()[type](options.ajax, options)

Model.Ajax.Methods =
  extended: ->
    @extend Extend
    @include Include

# Globals
Ajax.defaults   = Base::defaults
Spine.Ajax      = Ajax
module?.exports = Ajax