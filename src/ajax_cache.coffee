class Cached
  constructor: (@keyStr, @data) ->

  getData: -> @data

  exists: -> @data?

  invalidate: ->
    delete AjaxCache.globalCache[@keyStr]

AjaxCache =

  globalCache: {}

  cleanCache: ->
    @globalCache = {}

  hashf: (key) ->
    # a place for may be some hash function implementation
    key

  createKeyString: (url, params) ->
    result = url
    for name, el of params
      result += "#{name}=#{el}" unless typeof el is 'function' or typeof el is 'object'
    result

  hashKey: (url, params) ->
    @hashf @createKeyString url, params

  store: (url, params, data) ->
    keyStr = @hashKey url, params
    @globalCache[keyStr] = new Cached keyStr, data
    @globalCache[keyStr]

  get: (url, params) ->
    keyStr = @hashKey url, params
    @globalCache[keyStr] or new Cached


Spine.Model.AjaxCache =
  extended: ->
    @caches = []

  invalidate: ->
    cache.invalidate() for cache in @caches

  fetchCache: (params) ->
    url = Spine.Ajax.getURL(@)
    cache = AjaxCache.get url, params
    if cache.exists() and not params?.noCache
      @trigger 'ajaxSuccess', cache.getData()...
      @refresh(cache.getData()[0], {})
      true
    else
      @one 'ajaxSuccess', (data, status, xhr) => 
        @caches.push AjaxCache.store url, params, [data, status, xhr]
      @fetch(params)
      

Spine.AjaxCache = AjaxCache


