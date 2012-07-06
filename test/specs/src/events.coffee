describe "Events", ->
  EventTest = undefined
  spy = undefined

  beforeEach ->
    EventTest = Spine.Class.create()
    EventTest.extend(Spine.Events)

    noop = {spy: ->}
    spyOn(noop, "spy")
    spy = noop.spy


  it "can bind/trigger events", ->
    EventTest.bind("daddyo", spy)
    EventTest.trigger("daddyo")
    expect(spy).toHaveBeenCalled()

  it "should trigger correct events", ->
    EventTest.bind("daddyo", spy)
    EventTest.trigger("motherio")
    expect(spy).not.toHaveBeenCalled()


  it "can bind/trigger multiple events", ->
    EventTest.bind("house car windows", spy)
    EventTest.trigger("car")
    expect(spy).toHaveBeenCalled()


  it "can pass data to triggered events", ->
    EventTest.bind("yoyo", spy)
    EventTest.trigger("yoyo", 5, 10)
    expect(spy).toHaveBeenCalledWith(5, 10)


  it "can unbind events", ->
    EventTest.bind("daddyo", spy)
    EventTest.unbind("daddyo")
    EventTest.trigger("daddyo")
    expect(spy).not.toHaveBeenCalled()


  it "can bind to a single event", ->
    EventTest.one("indahouse", spy)
    EventTest.trigger("indahouse")
    expect(spy).toHaveBeenCalled()

    spy.reset()
    EventTest.trigger("indahouse")
    expect(spy).not.toHaveBeenCalled()


  it "should allow a callback unbind itself", ->
    a = jasmine.createSpy("a")
    b = jasmine.createSpy("b")
    c = jasmine.createSpy("c")

    b.andCallFake -> EventTest.unbind("once", b)

    EventTest.bind("once", a)
    EventTest.bind("once", b)
    EventTest.bind("once", c)
    EventTest.trigger("once")

    expect(a).toHaveBeenCalled()
    expect(b).toHaveBeenCalled()
    expect(c).toHaveBeenCalled()

    EventTest.trigger("once")

    expect(a.callCount).toBe(2)
    expect(b.callCount).toBe(1)
    expect(c.callCount).toBe(2)


  it "can cancel propogation", ->
    EventTest.bind("motherio", -> false)
    EventTest.bind("motherio", spy)

    EventTest.trigger("motherio")
    expect(spy).not.toHaveBeenCalled()


  it "should clear events on inherited objects", ->
    EventTest.bind("yoyo", spy)
    Sub = EventTest.sub()
    Sub.trigger("yoyo")
    expect(spy).not.toHaveBeenCalled()
