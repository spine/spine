should = require 'should'
sinon  = require 'sinon'
zombie = require 'zombie'

describe "Events", ->
  $ = jQuery = undefined

  before (done) ->
    browser = new zombie.Browser()

    browser.visit("file://localhost#{__dirname}/index.html", ->
      global.document      ?= browser.document
      global.window        ?= browser.window
      global.window.jQuery ?= require('jQuery').create(window)

      global.Spine ?= require '../src/spine'
      $ = jQuery = Spine.$

      done()
    )

  after ->
    delete global[key] for key in ['document', 'window', 'Spine']

  EventTest = undefined
  spy       = undefined

  beforeEach ->
    EventTest = Spine.Class.create()
    EventTest.extend(Spine.Events)

    noop = {spy: ->}
    spy = sinon.spy(noop, "spy")


  it "can bind/trigger events", ->
    EventTest.bind("daddyo", spy)
    EventTest.trigger("daddyo")

    spy.should.be.called


  it "should trigger correct events", ->
    EventTest.bind("daddyo", spy)
    EventTest.trigger("motherio")

    spy.should.not.be.called


  it "can bind/trigger multiple events", ->
    EventTest.bind("house car windows", spy)
    EventTest.trigger("car")

    spy.should.be.called


  it "can pass data to triggered events", ->
    EventTest.bind("yoyo", spy)
    EventTest.trigger("yoyo", 5, 10)

    spy.calledWith(5, 10).should.be.true


  it "can unbind events", ->
    EventTest.bind("daddyo", spy)
    EventTest.unbind("daddyo")
    EventTest.trigger("daddyo")

    spy.should.not.be.called


  it "can bind to a single event", ->
    EventTest.one("indahouse", spy)
    EventTest.trigger("indahouse")
    spy.should.be.called

    spy.reset()
    EventTest.trigger("indahouse")
    spy.should.not.be.called


  it "should allow a callback unbind itself", ->
    a = sinon.spy()
    b = sinon.spy({unbindItself: -> EventTest.unbind("once", b)}, "unbindItself")
    c = sinon.spy()

    EventTest.bind("once", a)
    EventTest.bind("once", b)
    EventTest.bind("once", c)

    EventTest.trigger("once")

    a.should.be.called
    b.should.be.called
    c.should.be.called

    EventTest.trigger("once")

    a.calledTwice.should.be.true
    b.calledOnce.should.be.true
    c.calledTwice.should.be.true


  it "can cancel propogation", ->
    EventTest.bind("motherio", -> false)
    EventTest.bind("motherio", spy)

    EventTest.trigger("motherio")
    spy.should.not.be.called


  it "should clear events on inherited objects", ->
    EventTest.bind("yoyo", spy)
    Sub = EventTest.sub()
    Sub.trigger("yoyo")
    spy.should.not.be.called