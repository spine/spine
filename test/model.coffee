should = require 'should'
sinon  = require 'sinon'
zombie = require 'zombie'

describe "Model", ->
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

  Asset = undefined

  beforeEach ->
    Asset = Spine.Model.setup("Asset", ["name"])


  it "can create records", ->
    asset = Asset.create({name: "test.pdf"})
    Asset.first().should.eql asset


  it "can update records", ->
    asset = Asset.create({name: "test.pdf"})

    Asset.first().name.should.eql "test.pdf"

    asset.name = "wem.pdf"
    asset.save()

    Asset.first().name.should.eql "wem.pdf"


  it "can destroy records", ->
    asset = Asset.create({name: "test.pdf"})

    Asset.first().should.eql asset
    asset.destroy()
    should.not.exist Asset.first()


  it "can find records", ->
    asset = Asset.create({name: "test.pdf"})

    Asset.find(asset.id).should.eql asset
    asset.destroy()
    (-> Asset.find(asset.id)).should.throw()


  it "can check existence", ->
    asset = Asset.create({name: "test.pdf"})

    asset.exists().should.be.ok
    Asset.exists(asset.id).should.be.ok

    asset.destroy();

    asset.exists().should.be.false
    Asset.exists(asset.id).should.be.false


  it "can reload", ->
    asset = Asset.create({name: "test.pdf"}).dup(false)

    Asset.find(asset.id).updateAttributes({name: "foo.pdf"})

    asset.name.should.equal "test.pdf"
    original = asset.reload()
    asset.name.should.equal "foo.pdf"

    # Reload should return a clone, more useful that way
    original.__proto__.__proto__.should.equal Asset.prototype


  it "can select records", ->
    asset1 = Asset.create({name: "test.pdf"})
    asset2 = Asset.create({name: "foo.pdf"})

    selected = Asset.select((rec) -> rec.name is "foo.pdf")

    selected[0].__proto__.should.equal asset2.__proto__
    selected.should.length 1


  it "can return all records", ->
    asset1 = Asset.create({name: "test.pdf"})
    asset2 = Asset.create({name: "foo.pdf"})

    all = Asset.all()

    all[0].__proto__.should.equal asset1.__proto__
    all[1].__proto__.should.equal asset2.__proto__
    all.should.length 2


  it "can find records by attribute", ->
    asset = Asset.create({name: "foo.pdf"})
    Asset.create({name: "test.pdf"})

    findOne = Asset.findByAttribute("name", "foo.pdf")
    findOne.__proto__.should.equal asset.__proto__

    findAll = Asset.findAllByAttribute("name", "foo.pdf");
    findAll[0].__proto__.should.equal asset.__proto__
    findAll.should.length(1)


  it "can find first/last record", ->
    first = Asset.create({name: "foo.pdf"})
    Asset.create({name: "test.pdf"})
    last = Asset.create({name: "wem.pdf"})

    Asset.first().__proto__.should.equal first.__proto__
    Asset.last().__proto__.should.equal last.__proto__


  it "can destroy all records", ->
    Asset.create({name: "foo.pdf"})
    Asset.create({name: "foo.pdf"})

    Asset.count().should.equal 2
    Asset.destroyAll()
    Asset.count().should.equal 0

  it "can delete all records", ->
    Asset.create({name: "foo.pdf"})
    Asset.create({name: "foo.pdf"})

    Asset.count().should.equal 2
    Asset.deleteAll()
    Asset.count().should.equal 0


  it "can be serialized into JSON", ->
    asset = new Asset({name: "Johnson me!"})

    JSON.stringify(asset).should.equal '{"name":"Johnson me!"}'


  it "can be deserialized from JSON", ->
    asset = Asset.fromJSON('{"name":"Un-Johnson me!"}')
    asset.name.should.equal "Un-Johnson me!"

    assets = Asset.fromJSON('[{"name":"Un-Johnson me!"}]')
    assets[0]?.name.should.equal "Un-Johnson me!"


  it "can be instantiated from a form", ->
    form = $('<form/>')
    form.append('<input name="name" value="bar"/>')
    asset = Asset.fromForm(form)

    asset.name.should.equal "bar"


  it "can validate", ->
    Asset.include({validate: -> return "Name required" unless @name})

    Asset.create({name: ""}).should.not.be.ok
    new Asset({name: ""}).isValid().should.not.be.ok

    Asset.create({name: "Yo big dog"}).should.be.ok
    new Asset({name: "Yo big dog"}).isValid().should.be.ok


  it "validation can be disabled", ->
    Asset.include({validate: -> return "Name required" unless @name})

    asset = new Asset
    asset.save().should.not.be.ok
    asset.save({validate: false}).should.be.ok


  it "has attribute hash", ->
    asset = new Asset({name: "wazzzup!"})
    asset.attributes().should.eql {name: "wazzzup!"}


  it "attributes() should not return undefined atts", ->
    asset = new Asset()
    asset.attributes().should.eql {}


  it "can load attributes()", ->
    asset = new Asset()
    result = asset.load({name: "In da' house"})

    result.should.equal asset
    asset.name.should.equal "In da' house"


  it "can load() attributes respecting getters/setters", ->
    Asset.include({
      name: (value) -> [@first_name, @last_name] = value.split(' ', 2)
    })

    asset = new Asset
    asset.load({name: "Alex MacCaw"})

    asset.first_name.should.equal "Alex"
    asset.last_name.should.equal "MacCaw"


  it "attributes() respecting getters/setters", ->
    Asset.include(name: -> "Bob")

    asset = new Asset
    asset.attributes().should.eql {name: "Bob"}


  it "can generate ID", ->
    asset = Asset.create({name: "who's in the house?"})

    asset.id.should.be.ok


  it "can be duplicated", ->
    asset = Asset.create({name: "who's your daddy?"})

    asset.dup().__proto__.should.equal Asset.prototype

    asset.name.should.equal "who's your daddy?"
    asset.name = "I am your father"
    asset.reload().name.should.equal "who's your daddy?"

    asset.should.not.equal Asset.records[asset.id]


  it "can be cloned", ->
    asset = Asset.create({name: "what's cooler than cool?"}).dup(false)

    asset.clone().__proto__.should.not.equal Asset.prototype
    asset.clone().__proto__.__proto__.should.equal Asset.prototype

    asset.name.should.equal "what's cooler than cool?"
    asset.name = "ice cold"
    asset.reload().name.should.equal "what's cooler than cool?"


  it "clones are dynamic", ->
    asset = Asset.create({name: "hotel california"})

    # reload reference
    clone = Asset.find(asset.id)

    asset.name = "checkout anytime"
    asset.save()

    clone.name.should.equal "checkout anytime"


  it "create or save should return a clone", ->
    asset = Asset.create({name: "what's cooler than cool?"})

    asset.__proto__.should.not.equal Asset.prototype
    asset.__proto__.__proto__.should.equal Asset.prototype


  it "should be able to be subclassed", ->
    Asset.extend({aProperty: true})
    File = Asset.setup("File")

    File.aProperty.should.be.ok
    File.className.should.equal "File"

    File.attributes.should.eql Asset.attributes


  it "dup should take a newRecord argument, which controls if a new record is returned", ->
    asset = Asset.create({name: "hotel california"})


    should.not.exist asset.dup().id
    asset.dup().isNew().should.be.ok

    asset.dup(false).id.should.equal asset.id
    should.not.exist asset.dup(false).newRecord


  it "should be able to change ID", ->
    asset = Asset.create({name: "hotel california"})

    asset.id.should.be.ok
    asset.changeID("foo")
    asset.id.should.equal "foo"

    Asset.exists("foo").should.be.ok


  it "eql should respect ID changes", ->
    asset1 = Asset.create({name: "hotel california", id: "bar"})
    asset2 = asset1.dup(false)
    asset1.changeID("foo")

    asset1.eql(asset2).should.be.ok


  it "new records should not be eql", ->
    asset1 = new Asset
    asset2 = new Asset

    asset1.eql(asset2).should.not.be.ok


  describe "with spy", ->
    spy = undefined

    beforeEach ->
      noop = {spy: ->}
      spy = sinon.spy(noop, "spy")


    it "can iterate over records", ->
      asset1 = Asset.create({name: "test.pdf"})
      asset2 = Asset.create({name: "foo.pdf"})

      Asset.each(spy)

      spy.calledWith(asset1).should.be.true
      spy.calledWith(asset2).should.be.true


    it "can fire create events", ->
      Asset.bind("create", spy)
      asset = Asset.create({name: "cartoon world.png"})

      spy.calledWith(asset, {}).should.be.true


    it "can fire save events", ->
      Asset.bind("save", spy)
      asset = Asset.create({name: "cartoon world.png"})

      spy.calledWith(asset, {}).should.be.true
      asset.save()
      spy.should.be.called


    it "can fire update events", ->
      Asset.bind("update", spy)
      asset = Asset.create({name: "cartoon world.png"})

      spy.calledWith(asset).should.be.false
      asset.save()
      spy.calledWith(asset, {}).should.be.true


    it "can fire destroy events", ->
      Asset.bind("destroy", spy)
      asset = Asset.create({name: "cartoon world.png"})
      asset.destroy()

      spy.calledWith(asset, {}).should.be.true


    it "can fire events on record", ->
      asset = Asset.create({name: "cartoon world.png"})
      asset.bind("save", spy)
      asset.save()

      spy.calledWith(asset, {}).should.be.true


    it "can fire change events on record", ->
      Asset.bind("change", spy)
      asset = Asset.create({name: "cartoon world.png"})

      spy.calledWith(asset, "create", {}).should.be.true

      asset.save()
      spy.calledWith(asset, "update", {}).should.be.true

      asset.destroy()
      spy.calledWith(asset, "destroy", {}).should.be.true


    it "can fire error events", ->
      Asset.bind("error", spy)
      Asset.include({
        validate: -> return "Name required" unless @name
      })
      asset = new Asset({name: ""})

      asset.save().should.not.be.ok
      spy.calledWith(asset, "Name required").should.be.true


    it "should be able to bind once", ->
      Asset.one("save", spy)
      asset = new Asset({name: "cartoon world.png"})
      asset.save()

      spy.should.be.called
      spy.reset()

      asset.save()
      spy.should.not.be.called


    it "should be able to bind once on instance", ->
      asset = Asset.create({name: "cartoon world.png"})

      asset.one("save", spy)
      asset.save()

      spy.calledWith(asset, {}).should.be.true
      spy.reset()

      asset.save()
      spy.should.not.be.called


    it "it should pass clones with events", ->
      Asset.bind "create", (asset) ->
        asset.__proto__.should.not.equal Asset.prototype
        asset.__proto__.__proto__.should.equal Asset.prototype

      Asset.bind "update", (asset) ->
        asset.__proto__.should.not.equal Asset.prototype
        asset.__proto__.__proto__.should.equal Asset.prototype

      asset = Asset.create({name: "cartoon world.png"})
      asset.updateAttributes({name: "lonely heart.png"})


    it "should be able to unbind instance events", ->
      asset = Asset.create({name: "cartoon world.png"})

      asset.bind("save", spy)
      asset.unbind()
      asset.save()

      spy.should.not.be.called


    it "should unbind events on instance destroy", ->
      asset = Asset.create({name: "cartoon world.png"})

      asset.bind("save", spy)
      asset.destroy()
      asset.trigger("save", asset)

      spy.should.not.be.called


    it "callbacks should still work on ID changes", ->
      asset = Asset.create({name: "hotel california", id: "bar"})
      asset.bind("test", spy)
      asset.changeID("foo")

      asset = Asset.find("foo")
      asset.trigger("test", asset)
      spy.should.be.called