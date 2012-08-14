Spine  = @Spine or require('spine')
$      = Spine.$
Model  = Spine.Model
Queue  = $({})

Ajax =
  getURL: (object) ->
    object and object.url?() or object.url

  enabled: true

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

  queue: (request) ->
    if request then Queue.queue(request) else Queue.queue()

  clearQueue: ->
    @queue []

class Base
  defaults:
    contentType: 'application/json'
    dataType: 'json'
    processData: false
    headers: {'X-Requested-With': 'XMLHttpRequest'}

  queue: Ajax.queue

  ajax: (params, defaults) ->
    $.ajax @ajaxSettings(params, defaults)

  ajaxQueue: (params, defaults) ->
    jqXHR    = null
    deferred = $.Deferred()

    promise  = deferred.promise()
    return promise unless Ajax.enabled

    settings = @ajaxSettings(params, defaults)

    request = (next) ->
      jqXHR = $.ajax(settings)
                .done(deferred.resolve)
                .fail(deferred.reject)
                .then(next, next)

    promise.abort = (statusText) ->
      return jqXHR.abort(statusText) if jqXHR
      index = $.inArray(request, @queue())
      @queue().splice(index, 1) if index > -1

      deferred.rejectWith(
        settings.context or settings,
        [promise, statusText, '']
      )
      promise

    @queue request
    promise

  ajaxSettings: (params, defaults) ->
    $.extend({}, @defaults, defaults, params)

class Collection extends Base
  constructor: (@model) ->

  find: (id, params) ->
    record = new @model(id: id)
    @ajaxQueue(
      params,
      type: 'GET',
      url:  Ajax.getURL(record)
    ).done(@recordsResponse)
     .fail(@failResponse)

  all: (params) ->
    @ajaxQueue(
      params,
      type: 'GET',
      url:  Ajax.getURL(@model)
    ).done(@recordsResponse)
     .fail(@failResponse)

  fetch: (params = {}, options = {}) ->
    if id = params.id
      delete params.id
      @find(id, params).done (record) =>
        @model.refresh(record, options)
    else
      @all(params).done (records) =>
        @model.refresh(records, options)

  # Private

  recordsResponse: (data, status, xhr) =>
    @model.trigger('ajaxSuccess', null, status, xhr)

  failResponse: (xhr, statusText, error) =>
    @model.trigger('ajaxError', null, xhr, statusText, error)

class Singleton extends Base
  constructor: (@record) ->
    @model = @record.constructor

  reload: (params, options) ->
    @ajaxQueue(
      params,
      type: 'GET'
      url:  Ajax.getURL(@record)
    ).done(@recordResponse(options))
     .fail(@failResponse(options))

  create: (params, options) ->
    @ajaxQueue(
      params,
      type: 'POST'
      data: JSON.stringify(@record)
      url:  Ajax.getURL(@model)
    ).done(@recordResponse(options))
     .fail(@failResponse(options))

  update: (params, options) ->
    @ajaxQueue(
      params,
      type: 'PUT'
      data: JSON.stringify(@record)
      url:  Ajax.getURL(@record)
    ).done(@recordResponse(options))
     .fail(@failResponse(options))

  destroy: (params, options) ->
    @ajaxQueue(
      params,
      type: 'DELETE'
      url:  Ajax.getURL(@record)
    ).done(@recordResponse(options))
     .fail(@failResponse(options))

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
      options.success?.apply(@record) # Deprecated
      options.done?.apply(@record)

  failResponse: (options = {}) =>
    (xhr, statusText, error) =>
      @record.trigger('ajaxError', xhr, statusText, error)
      options.error?.apply(@record) # Deprecated
      options.fail?.apply(@record)

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