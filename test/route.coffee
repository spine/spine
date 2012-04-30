should = require 'should'
sinon  = require 'sinon'
zombie = require("zombie")

describe "Routing", ->
  browser = undefined
  Route   = undefined
  $       = undefined

  before (done) ->
    browser = new zombie.Browser()

    browser.visit("file://localhost#{__dirname}/index.html", ->
      global.document      ?= browser.document
      global.window        ?= browser.window
      global.window.jQuery ?= require('jQuery').create(window)

      global.Spine ?= require '../src/spine'
      require '../src/route'
      Route = Spine.Route
      $ = Spine.$

      done()
    )

  after ->
    delete global[key] for key in ['document', 'window', 'Spine']

  spy      = undefined
  clock    = undefined
  navigate = (str, callback) ->
    $.Deferred((dfd) ->
      browser.location = "##{str}"
      browser.wait ->
        clock.tick(50)
        do callback if callback?
        dfd.resolve()
    ).promise()

  beforeEach ->
    Route.setup()
    
    noop = {spy: ->}
    spy = sinon.spy(noop, "spy")

    clock = sinon.useFakeTimers()

    Route.history = false
    Route.routes  = []

  afterEach ->
    clock.restore()
    Route.unbind()
    window.location.hash = ""


  it "can navigate", ->
    Route.navigate("/users/1")
    window.location.hash.should.equal "#/users/1"

    Route.navigate("/users", 2)
    window.location.hash.should.equal "#/users/2"


  it "can add regex route", ->
    Route.add(/\/users\/(\d+)/, ->)
    Route.routes.should.be.ok

    Route.navigate("/users/1")
    window.location.hash.should.equal "#/users/1"


  it "can trigger routes", (done) ->
    Route.add
      "/users":  spy
      "/groups": spy

    $.when(
      navigate "/users"
      navigate "/groups"
    ).done(->
      spy.callCount.should.equal 2
      done()
    )


  it "can call routes with params", (done) ->
    Route.add "/users/:id/:id2": spy

    navigate "/users/1/2", ->
      spy.calledWith({match: ["/users/1/2", "1", "2"], id: "1", id2: "2"}).should.be.true
      done()


  it "can call routes with glob", (done) ->
    Route.add "/page/*stuff": spy

    navigate "/page/gah", ->
      spy.lastCall.calledWith({match: ["/page/gah", "gah"]}).should.be.true
      done()


  it "should trigger routes when navigating", ->
    Route.add "/users/:id": spy

    Route.navigate("/users/1")

    clock.tick(50)

    spy.should.be.called


  it "has option to trigger routes when navigating", ->
    Route.add "/users/:id": spy

    Route.navigate("/users/1", true)

    clock.tick(50)

    spy.should.be.called