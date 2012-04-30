should = require 'should'
sinon  = require 'sinon'
zombie = require 'zombie'

describe "Manager", ->
  $ = jQuery = undefined

  before (done) ->
    browser = new zombie.Browser()

    browser.visit("file://localhost#{__dirname}/index.html", ->
      global.document      ?= browser.document
      global.window        ?= browser.window
      global.window.jQuery ?= require('jQuery').create(window)

      global.Spine ?= require '../src/spine'
      require '../src/manager'
      $ = jQuery = Spine.$

      done()
    )

  after ->
    delete global[key] for key in ['document', 'window', 'Spine']

  Users  = undefined
  Groups = undefined
  users  = undefined
  groups = undefined

  beforeEach ->
    Users = Spine.Controller.sub()
    Groups = Spine.Controller.sub()

    users = new Users
    groups = new Groups


  it "should toggle active class", ->
    new Spine.Manager(users, groups)

    groups.active()
    groups.el.hasClass('active').should.be.ok
    users.el.hasClass('active').should.not.be.ok

    users.active()
    groups.el.hasClass('active').should.not.be.ok
    users.el.hasClass('active').should.be.ok


  it "deactivate should work", ->
    manager = new Spine.Manager(users, groups)
    users.active()
    manager.deactivate()
    users.el.hasClass('active').should.not.be.ok


  it "should remove controllers on release event", ->
    manager = new Spine.Manager(users, groups)

    manager.controllers.should.eql [users, groups]

    users.release()
    manager.controllers.should.eql [groups]


  describe "with spy", ->
    spy = undefined

    beforeEach ->
      noop = {spy: ->}
      spy = sinon.spy(noop, "spy")


    it "should fire active event on controller", ->
      users.active(spy)
      users.active()
      spy.should.be.called


    it "should fire change event on manager", ->
      manager = new Spine.Manager(users, groups)
      manager.bind('change', spy)

      users.active()
      spy.calledWith(users).should.be.true


    it "should call activate on controller", ->
      new Spine.Manager(users, groups)
      users.activate = spy
      users.active(1, 2, 3)
      users.activate.calledWith(1, 2, 3).should.be.true


    it "should call deactivate on controller", ->
      new Spine.Manager(users, groups)
      users.deactivate = spy
      groups.active(1, 2, 3)
      users.deactivate.calledWith(1, 2, 3).should.be.true