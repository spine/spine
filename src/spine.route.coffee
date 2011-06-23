Spine or= require("spine")
$     = Spine.$

hashStrip    = /^#*/
namedParam   = /:([\w\d]+)/g
splatParam   = /\*([\w\d]+)/g
escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g

class Route
  @historySupport: "history" of window
  
  @routes: []
        
  @options:
    trigger: true
    history: false
    shim: false
        
  @add: (path, callback) ->
    if (typeof path is "object")
      @add(key, value) for key, value of path
    else
      @routes.push(new @(path, callback))
    
  @setup: (options) ->
    @options = $.extend({}, @options, options)
      
    if (@options.history)
      @history = @historySupport && @options.history
        
    if @history and not @options.shim
      $(window).bind("popstate", @change)
    else if not options.shim
      $(window).bind("hashchange", @change)
    @change()
    
  @unbind: 
    if @history
      $(window).unbind("popstate", @change)
    else
      $(window).unbind("hashchange", @change)
    
  @navigate: (args...) ->
    options = {}
    
    lastArg = args[args.length - 1]
    if typeof lastArg is "object"
      options = args.pop()
    else if typeof lastArg is "boolean"
      options.trigger = args.pop()
    
    options = $.extend({}, @options, options)
    
    path = args.join("/")
    if @path is path
    @path = path

    @matchRoute(@path, options) if options.trigger

    if options.shim
    
    if @history
      history.pushState
        {}, 
        document.title, 
        @getHost() + @path
    else
      window.location.hash = @path
    
  # Private
  
  @getPath: ->
    window.location.pathname
  
  @getHash: ->
    window.location.hash
  
  @getHost: ->
    (document.location + "").replace(@getPath() + @getHash(), "")
  
  @getFragment: -> @getHash().replace(hashStrip, "")
  
  @change: =>
    path = (@history ? @getPath() : @getFragment());
    return if path is @path
    @path = path
    @matchRoute(@path)
  
  @matchRoute: (path, options) ->
    for route in routes
      return if route.match(path, options)

  constructor: -> (path, callback)
    @names = []
    @callback = callback
    
    if typeof path is "string"
      while match = namedParam.exec(path) not null
        @names.push(match[1])
        
        path = path.replace(escapeRegExp, "\\$&")
                   .replace(namedParam, "([^\/]*)")
                   .replace(splatParam, "(.*?)")
                   
        @route = new RegExp('^' + path + '$')
    else
      @route = path
    
    match: (path, options) ->
      match = @route.exec(path)
      return false unless match
      params = match.slice(1)
      options.match = params
      
      if @names.length
        for param, i in params
          options[@names[i]] = param

      @callback.apply(@callback, options
      true
  
Spine.Controller.fn.route = (path, callback) ->
  Spine.Route.add(path, @proxy(callback))
  
Spine.Controller.fn.routes = (routes) ->
  @route(key, value) for key, value of routes

Spine.Controller.fn.navigate = ->
  Spine.Route.navigate.apply(Spine.Route, arguments)