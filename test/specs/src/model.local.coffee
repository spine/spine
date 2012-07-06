describe "Model.Local", ->
  User = undefined

  beforeEach ->
    User = Spine.Model.setup("User", ["name"])


  it "should persist attributes", ->
    User.extend(Spine.Model.Local)
    User.create({name: "Bob"})
    User.fetch()

    expect(User.first()).toBeTruthy()
    expect(User.first().name).toEqual("Bob")


  it "should work with cIDs", ->
    User.refresh([
      {name: "Bob", id: "c-1"}
      {name: "Bob", id: "c-3"}
      {name: "Bob", id: "c-2"}
    ])
    expect(User.idCounter).toEqual(3)


  it "should work with a blank refresh", ->
    User.refresh([])
    expect(User.idCounter).toEqual(0)