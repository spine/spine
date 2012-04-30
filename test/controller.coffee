should = require 'should'
sinon  = require 'sinon'
zombie = require 'zombie'

describe "Controller", ->
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

  Users   = undefined
  element = undefined

  beforeEach ->
    Users = Spine.Controller.sub()
    element = $("<div/>")


  it "should be configurable", ->
    element.addClass("testy")
    users = new Users(el: element)
    users.el.hasClass("testy").should.be.ok

    users = new Users(item: "foo")
    users.item.should.eql 'foo'


  it "should generate element", ->
    users = new Users
    users.el.should.be.ok


  it "can populate elements", ->
    Users.include({elements: {".foo": "foo"}})

    element.append($("<div/>").addClass("foo"))
    users = new Users(el: element)

    users.foo.should.be.ok
    users.foo.hasClass("foo").should.be.ok


  it "can remove element upon release event", ->
    parent = $('<div/>')
    parent.append(element)

    users = new Users(el: element)
    parent.children().length.should.eql 1

    users.release()
    parent.children().length.should.eql 0


  describe "with spy", ->
    spy = undefined

    beforeEach ->
      noop = {spy: ->}
      spy = sinon.spy(noop, "spy")


    it "can add events", ->
      Users.include(
        events: {"click": "wasClicked"}
        wasClicked: spy
      )

      users = new Users(el: element)
      element.click()
      spy.should.be.called


    it "can delegate events", ->
      Users.include(
        events: {"click .foo": "wasClicked"}
        wasClicked: spy
      )

      child = $("<div/>").addClass("foo")
      element.append(child)

      users = new Users(el: element)
      child.click()
      spy.should.be.called


  it "can set attributes on el", ->
    Users.include(attributes: {"style": "width: 100%;"})

    users = new Users
    users.el.attr("style").should.eql "width: 100%;"