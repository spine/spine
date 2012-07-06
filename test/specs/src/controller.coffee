describe "Controller", ->
  Users   = undefined
  element = undefined

  beforeEach ->
    Users = Spine.Controller.sub()
    element = $("<div />")


  it "should be configurable", ->
    element.addClass("testy")
    users = new Users({el: element})
    expect(users.el.hasClass("testy")).toBeTruthy()

    users = new Users({item: "foo"})
    expect(users.item).toEqual("foo")


  it "should generate element", ->
    users = new Users()
    expect(users.el).toBeTruthy()


  it "can populate elements", ->
    Users.include({
      elements: {".foo": "foo"}
    })

    element.append($("<div />").addClass("foo"))
    users = new Users({el: element})

    expect(users.foo).toBeTruthy()
    expect(users.foo.hasClass("foo")).toBeTruthy()


  it "can remove element upon release event", ->
    parent = $('<div />')
    parent.append(element)

    users = new Users({el: element})
    expect(parent.children().length).toBe(1)

    users.release()
    expect(parent.children().length).toBe(0)


  describe "with spy", ->
    spy = undefined

    beforeEach ->
      noop = {spy: ->}
      spyOn(noop, "spy")
      spy = noop.spy


    it "can add events", ->
      Users.include({
        events: {"click": "wasClicked"}
        wasClicked: $.proxy(spy, jasmine) # Context change confuses Spy
      })

      users = new Users({el: element})
      element.click()
      expect(spy).toHaveBeenCalled()


    it "can delegate events", ->
      Users.include({
        events: {"click .foo": "wasClicked"}
        wasClicked: $.proxy(spy, jasmine)
      })

      child = $("<div />").addClass("foo")
      element.append(child)

      users = new Users({el: element})
      child.click()
      expect(spy).toHaveBeenCalled()


  it "can set attributes on el", ->
    Users.include({
      attributes: {"style": "width: 100%"}
    })

    users = new Users()
    expect(users.el.attr("style")).toEqual("width: 100%")