should = require 'should'
sinon  = require 'sinon'
zombie = require 'zombie'

describe "Ajax", ->
  $ = jQuery = undefined

  before (done) ->
    browser = new zombie.Browser()

    browser.visit("file://localhost#{__dirname}/index.html", ->
      global.document      ?= browser.document
      global.window        ?= browser.window
      global.window.jQuery ?= require('jQuery').create(window)

      global.Spine ?= require '../src/spine'
      require '../src/ajax'
      $ = jQuery = Spine.$

      done()
    )

  after ->
    delete global[key] for key in ['document', 'window', 'Spine']

  User     = undefined
  jqXHR    = undefined
  stub     = undefined

  beforeEach ->
    Spine.Ajax.requests = []
    Spine.Ajax.pending  = false

    User = Spine.Model.setup("User", ["first", "last"])
    User.extend(Spine.Model.Ajax)

    jqXHR = $.Deferred()

    $.extend(jqXHR, {
      readyState: 0
      setRequestHeader: -> this
      getAllResponseHeaders: ->
      getResponseHeader: ->
      overrideMimeType: -> this
      abort: -> this
      success: jqXHR.done
      error: jqXHR.fail
      complete: jqXHR.done
    })

    stub = sinon.stub(jQuery, "ajax").returns(jqXHR)

  afterEach ->
    stub.restore()


  it "can GET a collection on fetch", ->
    User.fetch()

    stub.calledWith(
      type:         'GET'
      headers:      {'X-Requested-With': 'XMLHttpRequest'}
      contentType:  'application/json'
      dataType:     'json'
      url:          '/users'
      processData:  false
    ).should.be.true


  it "can GET a record on fetch", ->
    User.refresh([{first: "John", last: "Williams", id: "IDD"}])

    User.fetch({id: "IDD"})

    stub.calledWith(
      type:         'GET'
      headers:      {'X-Requested-With': 'XMLHttpRequest'}
      contentType:  'application/json'
      dataType:     'json'
      url:          '/users/IDD'
      processData:  false
    ).should.be.true


  it "can send POST on create", ->
    User.create({first: "Hans", last: "Zimmer", id: "IDD"})

    stub.calledWith(
      type:         'POST'
      headers:      {'X-Requested-With': 'XMLHttpRequest'}
      contentType:  'application/json'
      dataType:     'json'
      data:         '{"first":"Hans","last":"Zimmer","id":"IDD"}'
      url:          '/users'
      processData:  false
    ).should.be.true


  it "can send PUT on update", ->
    User.refresh([{first: "John", last: "Williams", id: "IDD"}])

    User.first().updateAttributes({first: "John2", last: "Williams2"})

    stub.calledWith(
      type:         'PUT'
      headers:      {'X-Requested-With': 'XMLHttpRequest'}
      contentType:  'application/json'
      dataType:     'json'
      data:         '{"first":"John2","last":"Williams2","id":"IDD"}'
      url:          '/users/IDD'
      processData:  false
    ).should.be.true


  it "can send DELETE on destroy", ->
    User.refresh([{first: "John", last: "Williams", id: "IDD"}])

    User.first().destroy()

    stub.calledWith(
      type:        'DELETE'
      headers:     {'X-Requested-With': 'XMLHttpRequest'}
      contentType: 'application/json'
      dataType:    'json'
      processData: false
      url:         '/users/IDD'
    ).should.be.true


  it "can update record after PUT/POST", ->
    User.create({first: "Hans", last: "Zimmer", id: "IDD"})

    newAtts = {first: "Hans2", last: "Zimmer2", id: "IDD"}
    jqXHR.resolve(newAtts)

    User.first().attributes().should.eql newAtts


  it "can change record ID after PUT/POST", ->
    User.create({id: "IDD"})

    newAtts = {id: "IDD2"}
    jqXHR.resolve(newAtts)

    User.first().id.should.equal "IDD2"
    User.records["IDD2"].should.equal User.first().__proto__


  it "should send requests syncronously", ->
    User.create({first: "First"})

    stub.should.be.called

    stub.reset()

    User.create({first: "Second"})

    stub.should.not.be.called
    jqXHR.resolve()
    stub.should.be.called


  it "should have success callbacks", ->
    noop = {spy: ->}
    spy = sinon.spy(noop, "spy")

    User.create({first: "Second"}, {success: spy})
    jqXHR.resolve()
    spy.should.be.called


  it "should have error callbacks", ->
    noop = {spy: ->}
    spy = sinon.spy(noop, "spy")

    User.create({first: "Second"}, {error: spy});
    jqXHR.reject();
    spy.should.be.called


  it "can cancel ajax on change", ->
    User.create({first: "Second"}, {ajax: false})
    jqXHR.resolve()

    stub.should.not.be.called


  it "should expose the defaults object", ->
    Spine.Ajax.defaults.should.be.ok


  it "should have a url function", ->
    User.url().should.equal '/users'
    User.url('search').should.equal '/users/search'

    user = new User({id: 1})
    user.url().should.equal '/users/1'
    user.url('custom').should.equal '/users/1/custom'

    Spine.Model.host = 'http://example.com'
    User.url().should.equal 'http://example.com/users'
    user.url().should.equal 'http://example.com/users/1'