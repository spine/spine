should = require 'should'
sinon  = require 'sinon'
zombie = require 'zombie'

describe 'Class', ->

  before (done) ->
    browser = new zombie.Browser()

    browser.visit("file://localhost#{__dirname}/index.html", ->
      global.document      ?= browser.document
      global.window        ?= browser.window
      global.window.jQuery ?= require('jQuery').create(window)

      global.Spine ?= require '../src/spine'

      done()
    )

  after ->
    delete global[key] for key in ['document', 'window', 'Spine']


  User = undefined

  beforeEach ->
    User = Spine.Class.create()


  it "is sane", ->
    Spine.should.be.ok


  it "can create subclasses", ->
    User.extend(classProperty: true)
    Friend = User.create()

    Friend.should.be.ok
    Friend.classProperty.should.be.ok


  it "can create instance", ->
    User.include(instanceProperty: true)
    Bob = new User

    Bob.should.be.ok
    Bob.instanceProperty.should.be.ok


  it "can be extendable", ->
    User.extend(classProperty: true)

    User.classProperty.should.be.ok


  it "can be includable", ->
    User.include(instanceProperty: true)

    User.prototype.instanceProperty.should.be.ok
    (new User).instanceProperty.should.be.ok


  it "should trigger module callbacks", ->
    module =
      included: ->
      extended: ->

    sinon.spy(module, "included")
    User.include(module)
    module.included.should.be.called

    sinon.spy(module, "extended")
    User.extend(module)
    module.extended.should.be.called


  it "include/extend should raise without arguments", ->
    (-> User.include()).should.throw()
    (-> User.extend()).should.throw()


  it "can proxy functions in class/instance context", ->
    func = -> this

    (do User.proxy(func)).should.eql(User)

    user = new User
    (do user.proxy(func)).should.eql(user)