describe "Model", ->
  Asset = undefined

  beforeEach ->
    Asset = Spine.Model.setup("Asset", ["name"])


  it "can create records", ->
    asset = Asset.create({name: "test.pdf"})
    expect(Asset.first()).toEqual(asset)


  it "can update records", ->
    asset = Asset.create({name: "test.pdf"})

    expect(Asset.first().name).toEqual("test.pdf")

    asset.name = "wem.pdf"
    asset.save()

    expect(Asset.first().name).toEqual("wem.pdf")


  it "can destroy records", ->
    asset = Asset.create({name: "test.pdf"})

    expect(Asset.first()).toEqual(asset)
    asset.destroy()
    expect(Asset.first()).toBeFalsy()


  it "can find records", ->
    asset = Asset.create({name: "test.pdf"})
    expect(Asset.find(asset.id)).toBeTruthy()

    asset.destroy()
    expect(-> Asset.find(asset.id)).toThrow()


  it "can check existence", ->
    asset = Asset.create({name: "test.pdf"})

    expect(asset.exists()).toBeTruthy()
    expect(Asset.exists(asset.id)).toBeTruthy()

    asset.destroy()

    expect(asset.exists()).toBeFalsy()
    expect(Asset.exists(asset.id)).toBeFalsy()


  it "can reload", ->
    asset = Asset.create({name: "test.pdf"}).dup(false)

    Asset.find(asset.id).updateAttributes({name: "foo.pdf"})

    expect(asset.name).toEqual("test.pdf")
    original = asset.reload()
    expect(asset.name).toEqual("foo.pdf")

    # Reload should return a clone, more useful that way
    expect(original.__proto__.__proto__).toEqual(Asset.prototype)


  it "can select records", ->
    asset1 = Asset.create({name: "test.pdf"})
    asset2 = Asset.create({name: "foo.pdf"})

    selected = Asset.select((rec) -> rec.name is "foo.pdf")

    expect(selected).toEqual([asset2])


  it "can return all records", ->
    asset1 = Asset.create({name: "test.pdf"})
    asset2 = Asset.create({name: "foo.pdf"})

    expect(Asset.all()).toEqual([asset1, asset2])


  it "can find records by attribute", ->
    asset = Asset.create({name: "foo.pdf"})
    Asset.create({name: "test.pdf"})

    findOne = Asset.findByAttribute("name", "foo.pdf")
    expect(findOne).toEqual(asset)

    findAll = Asset.findAllByAttribute("name", "foo.pdf")
    expect(findAll).toEqual([asset])


  it "can find first/last record", ->
    first = Asset.create({name: "foo.pdf"})
    Asset.create({name: "test.pdf"})
    last = Asset.create({name: "wem.pdf"})

    expect(Asset.first()).toEqual(first)
    expect(Asset.last()).toEqual(last)


  it "can destroy all records", ->
    Asset.create({name: "foo.pdf"})
    Asset.create({name: "foo.pdf"})

    expect(Asset.count()).toEqual(2)
    Asset.destroyAll()
    expect(Asset.count()).toEqual(0)


  it "can delete all records", ->
    Asset.create({name: "foo.pdf"})
    Asset.create({name: "foo.pdf"})

    expect(Asset.count()).toEqual(2)
    Asset.deleteAll()
    expect(Asset.count()).toEqual(0)


  it "can be serialized into JSON", ->
    asset = new Asset({name: "Johnson me!"})

    expect(JSON.stringify(asset)).toEqual('{"name":"Johnson me!"}')


  it "can be deserialized from JSON", ->
    asset = Asset.fromJSON('{"name":"Un-Johnson me!"}')
    expect(asset.name).toEqual("Un-Johnson me!")

    assets = Asset.fromJSON('[{"name":"Un-Johnson me!"}]')
    expect(assets[0] and assets[0].name).toEqual("Un-Johnson me!")


  it "can be instantiated from a form", ->
    form = $('<form />')
    form.append('<input name="name" value="bar" />')
    asset = Asset.fromForm(form)
    expect(asset.name).toEqual("bar")


  it "can validate", ->
    Asset.include({
      validate: -> return "Name required" unless this.name
    })

    expect(Asset.create({name: ""})).toBeFalsy()
    expect(new Asset({name: ""}).isValid()).toBeFalsy()

    expect(Asset.create({name: "Yo big dog"})).toBeTruthy()
    expect(new Asset({name: "Yo big dog"}).isValid()).toBeTruthy()


  it "validation can be disabled", ->
    Asset.include({
      validate: -> return "Name required" unless this.name
    })

    asset = new Asset
    expect(asset.save()).toBeFalsy()
    expect(asset.save({validate: false})).toBeTruthy()


  it "has attribute hash", ->
    asset = new Asset({name: "wazzzup!"})
    expect(asset.attributes()).toEqual({name: "wazzzup!"})


  it "attributes() should not return undefined atts", ->
    asset = new Asset()
    expect(asset.attributes()).toEqual({})


  it "can load attributes()", ->
    asset = new Asset()
    result = asset.load({name: "In da' house"})
    expect(result).toBe(asset)
    expect(asset.name).toEqual("In da' house")


  it "can load() attributes respecting getters/setters", ->
    Asset.include({
      name: (value) -> [@first_name, @last_name] = value.split(' ', 2)
    })

    asset = new Asset()
    asset.load({name: "Alex MacCaw"})
    expect(asset.first_name).toEqual("Alex")
    expect(asset.last_name).toEqual("MacCaw")


  it "attributes() respecting getters/setters", ->
    Asset.include({
      name: -> "Bob"
    })

    asset = new Asset()
    expect(asset.attributes()).toEqual({name: "Bob"})


  it "can generate ID", ->
    asset = Asset.create({name: "who's in the house?"})
    expect(asset.id).toBeTruthy()


  it "can be duplicated", ->
    asset = Asset.create({name: "who's your daddy?"})
    expect(asset.dup().__proto__).toBe(Asset.prototype)

    expect(asset.name).toEqual("who's your daddy?")
    asset.name = "I am your father"
    expect(asset.reload().name).toBe("who's your daddy?")

    expect(asset).not.toBe(Asset.records[asset.id])


  it "can be cloned", ->
    asset = Asset.create({name: "what's cooler than cool?"}).dup(false)
    expect(asset.clone().__proto__).not.toBe(Asset.prototype)
    expect(asset.clone().__proto__.__proto__).toBe(Asset.prototype)

    expect(asset.name).toEqual("what's cooler than cool?")
    asset.name = "ice cold"
    expect(asset.reload().name).toBe("what's cooler than cool?")


  it "clones are dynamic", ->
    asset = Asset.create({name: "hotel california"})

    # reload reference
    clone = Asset.find(asset.id)

    asset.name = "checkout anytime"
    asset.save()

    expect(clone.name).toEqual("checkout anytime")


  it "create or save should return a clone", ->
    asset = Asset.create({name: "what's cooler than cool?"})
    expect(asset.__proto__).not.toBe(Asset.prototype)
    expect(asset.__proto__.__proto__).toBe(Asset.prototype)


  it "should be able to be subclassed", ->
    Asset.extend({
      aProperty: true
    })

    File = Asset.setup("File")

    expect(File.aProperty).toBeTruthy()
    expect(File.className).toBe("File")

    expect(File.attributes).toEqual(Asset.attributes)


  it "dup should take a newRecord argument, which controls if a new record is returned", ->
    asset = Asset.create({name: "hotel california"})
    expect(asset.dup().id).toBeUndefined()
    expect(asset.dup().isNew()).toBeTruthy()

    expect(asset.dup(false).id).toBe(asset.id)
    expect(asset.dup(false).newRecord).toBeFalsy()


  it "should be able to change ID", ->
    asset = Asset.create({name: "hotel california"})
    expect(asset.id).toBeTruthy()
    asset.changeID("foo")
    expect(asset.id).toBe("foo")

    expect(Asset.exists("foo")).toBeTruthy()


  it "eql should respect ID changes", ->
    asset1 = Asset.create({name: "hotel california", id: "bar"})
    asset2 = asset1.dup(false)

    asset1.changeID("foo")
    expect(asset1.eql(asset2)).toBeTruthy()


  it "new records should not be eql", ->
    asset1 = new Asset
    asset2 = new Asset
    expect(asset1.eql(asset2)).not.toBeTruthy()


  it "should generate unique cIDs", ->
      Asset.refresh({name: "Bob", id: 3})
      Asset.refresh({name: "Bob", id: 2})
      Asset.refresh({name: "Bob", id: 1})
      expect(Asset.find(2).eql(Asset.find(1))).not.toBeTruthy()


  it "should handle more than 10 cIDs correctly", ->
      Asset.refresh({name: "Bob", id: i}) for i in [0...12]

      expect(Asset.idCounter).toEqual(12)


  describe "with spy", ->
    spy = undefined

    beforeEach ->
      noop = {spy: ->}
      spyOn(noop, "spy")
      spy = noop.spy


    it "can interate over records", ->
      asset1 = Asset.create({name: "test.pdf"})
      asset2 = Asset.create({name: "foo.pdf"})

      Asset.each(spy)
      expect(spy).toHaveBeenCalledWith(asset1)
      expect(spy).toHaveBeenCalledWith(asset2)


    it "can fire create events", ->
      Asset.bind("create", spy)
      asset = Asset.create({name: "cartoon world.png"})
      expect(spy).toHaveBeenCalledWith(asset, {})


    it "can fire save events", ->
      Asset.bind("save", spy)
      asset = Asset.create({name: "cartoon world.png"})
      expect(spy).toHaveBeenCalledWith(asset, {})

      asset.save()
      expect(spy).toHaveBeenCalled()


    it "can fire update events", ->
      Asset.bind("update", spy)

      asset = Asset.create({name: "cartoon world.png"})
      expect(spy).not.toHaveBeenCalledWith(asset)

      asset.save()
      expect(spy).toHaveBeenCalledWith(asset, {})


    it "can fire destroy events", ->
      Asset.bind("destroy", spy)
      asset = Asset.create({name: "cartoon world.png"})
      asset.destroy()
      expect(spy).toHaveBeenCalledWith(asset, {})


    it "can fire events on record", ->
      asset = Asset.create({name: "cartoon world.png"})
      asset.bind("save", spy)
      asset.save()
      expect(spy).toHaveBeenCalledWith(asset, {})


    it "can fire change events on record", ->
      Asset.bind("change", spy)

      asset = Asset.create({name: "cartoon world.png"})
      expect(spy).toHaveBeenCalledWith(asset, "create", {})

      asset.save()
      expect(spy).toHaveBeenCalledWith(asset, "update", {})

      asset.destroy()
      expect(spy).toHaveBeenCalledWith(asset, "destroy", {})


    it "can fire error events", ->
      Asset.bind("error", spy)

      Asset.include({
        validate: -> return "Name required" unless this.name
      })

      asset = new Asset({name: ""})
      expect(asset.save()).toBeFalsy()
      expect(spy).toHaveBeenCalledWith(asset, "Name required")


    it "should be able to bind once", ->
      Asset.one("save", spy)

      asset = new Asset({name: "cartoon world.png"})
      asset.save()

      expect(spy).toHaveBeenCalledWith(asset, {})
      spy.reset()

      asset.save()
      expect(spy).not.toHaveBeenCalled()


    it "should be able to bind once on instance", ->
      asset = Asset.create({name: "cartoon world.png"})

      asset.one("save", spy)
      asset.save()

      expect(spy).toHaveBeenCalledWith(asset, {})
      spy.reset()

      asset.save()
      expect(spy).not.toHaveBeenCalled()


    it "it should pass clones with events", ->
      Asset.bind("create", (asset) ->
        expect(asset.__proto__).not.toBe(Asset.prototype)
        expect(asset.__proto__.__proto__).toBe(Asset.prototype)
      )

      Asset.bind("update", (asset) ->
        expect(asset.__proto__).not.toBe(Asset.prototype)
        expect(asset.__proto__.__proto__).toBe(Asset.prototype)
      )
      asset = Asset.create({name: "cartoon world.png"})
      asset.updateAttributes({name: "lonely heart.png"})


    it "should be able to unbind instance events", ->
      asset = Asset.create({name: "cartoon world.png"})

      asset.bind("save", spy)
      asset.unbind()
      asset.save()

      expect(spy).not.toHaveBeenCalled()


    it "should unbind events on instance destroy", ->
      asset = Asset.create({name: "cartoon world.png"})

      asset.bind("save", spy)
      asset.destroy()

      asset.trigger("save", asset)
      expect(spy).not.toHaveBeenCalled()


    it "callbacks should still work on ID changes", ->
      asset = Asset.create({name: "hotel california", id: "bar"})
      asset.bind("test", spy)
      asset.changeID("foo")

      asset = Asset.find("foo")
      asset.trigger("test", asset)
      expect(spy).toHaveBeenCalled()