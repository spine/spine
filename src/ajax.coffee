Spine  = @Spine or require('spine')
$      = Spine.$
Model  = Spine.Model
Queue  = $({})

Ajax =
  getURL: (object) ->
    object.url?() or object.url

  getCollectionURL: (object) ->
    if object
      if typeof object.url is "function"
        @generateURL(object)
      else
        object.url

  getScope: (object) ->
    object.scope?() or object.scope

  generateURL: (object, args...) ->
    if object.className
      collection = object.className.toLowerCase() + 's'
      scope = Ajax.getScope(object)
    else
      if typeof object.constructor.url is 'string'
        collection = object.constructor.url
      else
        collection = object.constructor.className.toLowerCase() + 's'
      scope = Ajax.getScope(object) or Ajax.getScope(object.constructor)
    args.unshift(collection)
    args.unshift(scope)
    # construct and clean url
    path = args.join('/')
    path = path.replace /(\/\/)/g, "/"
    path = path.replace /^\/|\/$/g, ""
    # handle relative urls vs those that use a host
    if path.indexOf("../") isnt 0
      Model.host + "/" + path
    else
      path

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
    dataType: 'json'
    processData: false
    headers: {'X-Requested-With': 'XMLHttpRequest'}

  queue: Ajax.queue

  ajax: (params, defaults) ->
    $.ajax @ajaxSettings(params, defaults)

  ajaxQueue: (params, defaults, record) ->
    jqXHR    = null
    deferred = $.Deferred()
    promise  = deferred.promise()
    return promise unless Ajax.enabled
    settings = @ajaxSettings(params, defaults)

    request = (next) ->
      if record?.id?
        # for existing singleton, model id may have been updated
        # after request has been queued
        settings.url ?= Ajax.getURL(record)
        settings.data?.id = record.id

      settings.data = JSON.stringify(settings.data)
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

  find: (id, params, options = {}) ->
    record = new @model(id: id)
    @ajaxQueue(
      params,
      type: 'GET',
      url: options.url or Ajax.getURL(record)
    ).done(@recordsResponse)
     .fail(@failResponse)

  all: (params, options = {}) ->
    @ajaxQueue(
      params,
      type: 'GET',
      url: options.url or Ajax.getURL(@model)
    ).done(@recordsResponse)
     .fail(@failResponse)

  fetch: (params = {}, options = {}) ->
    if id = params.id
      delete params.id
      @find(id, params, options).done (record) =>
        @model.refresh(record, options)
    else
      @all(params, options).done (records) =>
        @model.refresh(records, options)

  # Private

  recordsResponse: (data, status, xhr) =>
    @model.trigger('ajaxSuccess', null, status, xhr)

  failResponse: (xhr, statusText, error) =>
    @model.trigger('ajaxError', null, xhr, statusText, error)

class Singleton extends Base
  constructor: (@record) ->
    @model = @record.constructor

  reload: (params, options = {}) ->
    @ajaxQueue(
      params, {
        type: 'GET'
        url: options.url
      }, @record
    ).done(@recordResponse(options))
     .fail(@failResponse(options))

  create: (params, options = {}) ->
    @ajaxQueue(
      params,
      type: 'POST'
      contentType: 'application/json'
      data: @record.toJSON()
      url: options.url or Ajax.getCollectionURL(@record)
    ).done(@recordResponse(options))
     .fail(@failResponse(options))

  update: (params, options = {}) ->
    @ajaxQueue(
      params, {
        type: 'PUT'
        contentType: 'application/json'
        data: @record.toJSON()
        url: options.url
      }, @record
    ).done(@recordResponse(options))
     .fail(@failResponse(options))

  destroy: (params, options = {}) ->
    @ajaxQueue(
      params, {
        type: 'DELETE'
        url: options.url
      }, @record
    ).done(@recordResponse(options))
     .fail(@failResponse(options))

  # Private

  recordResponse: (options = {}) =>
    (data, status, xhr) =>
      if Spine.isBlank(data) or @record.destroyed
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
    args.unshift(encodeURIComponent(@id))
    Ajax.generateURL(@, args...)

Extend =
  ajax: -> new Collection(this)

  url: (args...) ->
    Ajax.generateURL(@, args...)

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
Ajax.Base       = Base
Ajax.Singleton  = Singleton
Ajax.Collection = Collection
Spine.Ajax      = Ajax
module?.exports = Ajax
