describe "Class", ->
  User = undefined

  beforeEach ->
    User = Spine.Class.create()


  it "is sane", ->
    expect(Spine).toBeTruthy()


  it "can create subclasses", ->
    User.extend({classProperty: true})

    Friend = User.create()
    expect(Friend).toBeTruthy()
    expect(Friend.classProperty).toBeTruthy()


  it "can create instance", ->
    User.include({instanceProperty: true})

    Bob = new User()
    expect(Bob).toBeTruthy()
    expect(Bob.instanceProperty).toBeTruthy()


  it "can be extendable", ->
    User.extend({classProperty: true})

    expect(User.classProperty).toBeTruthy()


  it "can be includable", ->
    User.include({instanceProperty: true})

    expect(User.prototype.instanceProperty).toBeTruthy()
    expect((new User()).instanceProperty).toBeTruthy()


  it "should trigger module callbacks", ->
    module = {
      included: ->
      extended: ->
    }

    spyOn(module, "included")
    User.include(module)
    expect(module.included).toHaveBeenCalled()

    spyOn(module, "extended")
    User.extend(module)
    expect(module.extended).toHaveBeenCalled()


  it "include/extend should raise without arguments", ->
    expect(-> User.include()).toThrow()
    expect(-> User.extend()).toThrow()


  it "can proxy functions in class/instance context", ->
    func = -> this

    expect(User.proxy(func)()).toBe(User)

    user = new User()
    expect(user.proxy(func)()).toBe(user)