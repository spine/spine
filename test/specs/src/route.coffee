describe "Routing", ->
  Route = Spine.Route
  RouteOptions = Route.options
  spy = undefined

  navigate = (args...) ->
    changed = false
    $.Deferred((dfd) ->
      Route.one 'change', -> changed = true

      Route.navigate args...

      waitsFor(-> changed is true)
      runs(-> dfd.resolve())
    ).promise()

  # Set (default REset) document's URL
  setUrl = do ->
    originalTitle = undefined
    originalPath = "#{window.location.pathname}#{window.location.search}"

    (url) ->
      window.history.replaceState(null, originalTitle, url or originalPath)

  beforeEach ->
    Route.options = RouteOptions # Reset default Route options

  afterEach ->
    Route.unbind()
    Route.routes = []
    delete Route.path


  it "should have default options", ->
    expect(Route.options).toEqual({
      trigger: true
      history: false
      shim: false
    })


  describe 'With shim', ->
    beforeEach ->
      Route.setup({shim: true})


    it "should not have bound any hashchange|popstate event to window", ->
      events = $(window).data('events') or {}

      expect('hashchange' of events or 'popstate' of events).toBe(false)


    it "can set its path", ->
      expect(Route.path).toBeUndefined()

      Route.change()

      # Don't check the path is valid but just set to something -> check this for hashes and history
      expect(Route.path).toBeDefined()


    it "can add a single route", ->
      Route.add('/foo')

      expect(Route.routes.length).toBe(1)


    it "can add a bunch of routes", ->
      Route.add({
        '/foo': ->
        '/bar': ->
      })

      expect(Route.routes.length).toBe(2)


    it "can add regex route", ->
      Route.add(/\/users\/(\d+)/)

      expect(Route.routes.length).toBe(1)


    it "should trigger 'change' when a route matches", ->
      changed = 0
      Route.one('change', -> changed += 1)
      Route.add("/foo", ->)

      Route.navigate('/foo')

      waitsFor(-> changed > 0)
      runs(->
        expect(changed).toBe(1)
      )


    it "can navigate to path", ->
      Route.add("/users", ->)

      navigate("/users").done(->
        expect(Route.path).toBe("/users")
      )


    it "can navigate to a path splitted into several arguments", ->
      Route.add("/users/1/2", ->)

      navigate("/users", 1, 2).done(->
        expect(Route.path).toBe("/users/1/2")
      )


    describe 'With spy', ->
      beforeEach ->
        noop = {spy: ->}
        spyOn(noop, "spy")
        spy = noop.spy


      it "should trigger 'navigate' when navigating", ->
        Route.one('navigate', spy)
        Route.add("/foo", ->)

        Route.navigate('/foo')

        expect(spy).toHaveBeenCalled()


      it "should not navigate to the same path as the current", ->
        Route.one('navigate', spy)
        Route.add("/foo", ->)
        Route.path = '/foo'

        Route.navigate('/foo')

        expect(spy).not.toHaveBeenCalled()
        expect(Route.path).toBe('/foo')


      it "can call routes when navigating", ->
        Route.add("/foo", spy)

        navigate('/foo').done(->
          expect(spy).toHaveBeenCalled()
        )


      it "can call routes with params", ->
        Route.add({"/users/:id/:id2": spy})

        navigate('/users/1/2').done(->
          expect(JSON.stringify(spy.mostRecentCall.args)).toBe(JSON.stringify([{
            trigger: true
            history: false
            shim: true
            match: ["/users/1/2", "1", "2"], id: "1", id2: "2"
          }]))
        )


      it "can call routes with glob", ->
        Route.add({"/page/*stuff": spy})

        navigate("/page/gah").done(->
          expect(JSON.stringify(spy.mostRecentCall.args)).toBe(JSON.stringify([{
            trigger: true
            history: false
            shim: true
            match: ["/page/gah", "gah"], stuff: "gah"
          }]))
        )


      it "can override trigger behavior when navigating", ->
        expect(Route.options.trigger).toBe(true)

        Route.one('change', spy)

        Route.add("/users", ->)

        Route.navigate('/users', false)
        waits(50)
        runs(->
          expect(Route.options.trigger).toBe(true)
          expect(spy).not.toHaveBeenCalled()
        )


  describe 'With hashes', ->
    beforeEach ->
      Route.setup()

    afterEach ->
      setUrl()


    it "should have bound 'hashchange' event to window", ->
      events = $(window).data('events') or {}

      expect('hashchange' of events).toBe(true)


    it "should unbind", ->
      Route.unbind()
      events = $(window).data('events') or {}

      expect('hashchange' of events).toBe(false)


    it "can set its path", ->
      delete Route.path # Remove path which has been set by @setup > @change

      window.location.hash = "#/foo"
      Route.change()

      expect(Route.path).toBe('/foo')


    it "can navigate", ->
      Route.add("/users/1", ->)

      navigate("/users", 1).done(->
        expect(window.location.hash).toBe("#/users/1")
      )


  describe 'With History API', ->
    beforeEach ->
      Route.setup({history: true})

    afterEach ->
      setUrl()


    it "should have bound 'popstate' event to window", ->
      events = $(window).data('events') or {}

      expect('popstate' of events).toBe(true)


    it "should unbind", ->
      Route.unbind()
      events = $(window).data('events') or {}

      expect('popstate' of events).toBe(false)


    it "can set its path", ->
      delete Route.path # Remove path which has been set by @setup > @change

      setUrl('/foo')
      Route.change()

      expect(Route.path).toBe('/foo')


    it "can navigate", ->
      Route.add("/users/1", ->)

      navigate("/users/1").done(->
        expect(window.location.pathname).toBe("/users/1")
      )