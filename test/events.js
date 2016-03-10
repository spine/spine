describe("Events", function(){
  var EventTest, ListenTest;
  var spy;

  beforeEach(function(){
    spy = jasmine.createSpy();
    EventTest = Spine.Class.create();
    EventTest.extend(Spine.Events);
  });

  it("can bind/trigger events", function(){
    var spy2 = jasmine.createSpy('globalSpy');
    Spine.bind('notify', spy2);
    EventTest.bind("daddyo", spy);

    EventTest.trigger("somethingElse");
    expect(spy).not.toHaveBeenCalled();

    EventTest.trigger("daddyo");
    expect(spy).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });

  it("can bind/trigger global events", function(){
    var spy2 = jasmine.createSpy('globalSpy');
    Spine.bind('notify', spy2);
    EventTest.bind("daddyo", spy);

    Spine.trigger('somethingElse')
    expect(spy2).not.toHaveBeenCalled();

    Spine.trigger("notify");
    expect(spy2).toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });

  it("can listen for events on other objects", function(){
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenTo(EventTest, "daddyo", spy);
    EventTest.trigger("daddyo");
    expect(spy).toHaveBeenCalled();
  });

  it("should trigger correct events", function(){
    EventTest.bind("daddyo", spy);
    EventTest.trigger("motherio");
    expect(spy).not.toHaveBeenCalled();
  });

  it("can bind/trigger multiple events", function(){
    EventTest.bind("house car windows", spy);
    EventTest.trigger("car");
    expect(spy).toHaveBeenCalled();
    EventTest.trigger("house");
    EventTest.trigger("windows");
    expect(spy.calls.count()).toBe(3);
  });

  it("can listen for multiple events on other objects", function(){
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenTo(EventTest, "house car windows", spy);
    EventTest.trigger("car");
    expect(spy).toHaveBeenCalled();
    EventTest.trigger("house");
    EventTest.trigger("windows");
    expect(spy.calls.count()).toBe(3);
  });

  it("can pass data to triggered events", function(){
    var spy2 = jasmine.createSpy('globalSpy');
    Spine.bind('notify', spy2);
    EventTest.bind("yoyo", spy);

    EventTest.trigger("yoyo", 5, 10);
    expect(spy).toHaveBeenCalledWith(5, 10);

    Spine.trigger("notify", 'a message');
    expect(spy2).toHaveBeenCalledWith('a message');
  });

  it("can unbind events", function(){
    EventTest.bind("daddyo", spy);
    var spy2 = jasmine.createSpy('globalSpy');
    Spine.bind('notify', spy2);

    EventTest.unbind("daddyo");
    Spine.unbind('notify');
    EventTest.trigger("daddyo");
    Spine.trigger("notify");
    expect(spy).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });

  it("can unbind all events if no arguments given", function() {
    EventTest.bind("yoyo daddyo", spy);
    EventTest.unbind();
    EventTest.trigger("yoyo");
    expect(spy).not.toHaveBeenCalled();
    spy.calls.reset();
    EventTest.trigger("daddyo");
    expect(spy).not.toHaveBeenCalled();
  });

  it("can stop listening to events", function(){
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenTo(EventTest, "daddyo", spy);
    EventTest.trigger("daddyo");
    expect(spy).toHaveBeenCalled();
    spy.calls.reset();
    ListenTest.stopListening(EventTest, "daddyo");
    EventTest.trigger("daddyo");
    expect(spy).not.toHaveBeenCalled();
  });

  it("can unbind one event", function(){
    EventTest.bind("house car windows", spy);
    EventTest.unbind("car windows");
    EventTest.trigger("car");
    EventTest.trigger("windows");
    expect(spy).not.toHaveBeenCalled();
    EventTest.trigger("house");
    expect(spy).toHaveBeenCalled();
  });

  it("can stopListening to one event", function(){
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenTo(EventTest, "house car windows", spy)
    ListenTest.stopListening(EventTest, "car windows");
    EventTest.trigger("car");
    EventTest.trigger("windows");
    expect(spy).not.toHaveBeenCalled();
    EventTest.trigger("house");
    expect(spy).toHaveBeenCalled();
  });

  it("can stopListening to a specific callback", function(){
    var spy2 = jasmine.createSpy();
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenTo(EventTest, "keep", spy);
    ListenTest.listenTo(EventTest, "keep", spy2);
    //EventTest.trigger("keep");
    //expect(spy).toHaveBeenCalled();
    //expect(spy2).toHaveBeenCalled();
    ListenTest.stopListening(EventTest, "keep", spy2);
    EventTest.trigger("keep");
    expect(spy).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });

  it("can stopListening to a specific object", function(){
    ListenTest = Spine.Class.create();
    var EventTest2 = Spine.Class.create();
    var spy2 = jasmine.createSpy();
    ListenTest.extend(Spine.Events);
    EventTest2.extend(Spine.Events);
    ListenTest.listenTo(EventTest, "keep", spy);
    ListenTest.listenTo(EventTest2, "keep", spy2);
    ListenTest.stopListening(EventTest);
    EventTest.trigger("keep");
    EventTest2.trigger("keep");
    expect(spy).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it("can bind to an event only once", function(){
    EventTest.one("indahouse", spy);
    EventTest.trigger("indahouse");
    expect(spy).toHaveBeenCalled();
    spy.calls.reset();
    EventTest.trigger("indahouse");
    expect(spy).not.toHaveBeenCalled();
  });

  it("can bind to a global event only once", function(){
    var spy2 = jasmine.createSpy('globalSpy');
    Spine.one('notify', spy2);
    Spine.trigger("notify");
    expect(spy2).toHaveBeenCalled();
    spy2.calls.reset();
    Spine.trigger("notify");
    expect(spy2).not.toHaveBeenCalled();
  });

  it("can listen to to a event only once", function(){
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenToOnce(EventTest, 'indahouse', spy)
    EventTest.trigger("indahouse");
    expect(spy).toHaveBeenCalled();
    spy.calls.reset();
    EventTest.trigger("indahouse");
    expect(spy).not.toHaveBeenCalled();
  });

  it("can stopListening to a event that is being listened to once", function(){
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenToOnce(EventTest, "indahouse", spy)
    ListenTest.stopListening(EventTest, "indahouse");
    EventTest.trigger("indahouse");
    expect(spy).not.toHaveBeenCalled();
  });

  it("can stopListening to all events if no arguments given", function(){
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenTo(EventTest, "house", spy);
    ListenTest.listenToOnce(EventTest, "indahouse", spy);
    ListenTest.stopListening();
    EventTest.trigger("house");
    expect(spy).not.toHaveBeenCalled();
    spy.calls.reset();
    EventTest.trigger("indahouse");
    expect(spy).not.toHaveBeenCalled();
  });


  it("should allow a callback to unbind itself", function(){
    var a = jasmine.createSpy("a");
    var b = jasmine.createSpy("b");
    var c = jasmine.createSpy("c");

    b.and.callFake(function() {
      EventTest.unbind("once", b);
    });

    EventTest.bind("once", a);
    EventTest.bind("once", b);
    EventTest.bind("once", c);
    EventTest.trigger("once");

    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
    expect(c).toHaveBeenCalled();

    EventTest.trigger("once");

    expect(a.calls.count()).toBe(2);
    expect(b.calls.count()).toBe(1);
    expect(c.calls.count()).toBe(2);
  });

  it("can cancel propogation", function(){
    EventTest.bind("motherio", function(){ return false; });
    EventTest.bind("motherio", spy);
    EventTest.trigger("motherio");
    expect(spy).not.toHaveBeenCalled();
  });

  it("should clear events on inherited objects", function(){
    EventTest.bind("yoyo", spy);
    var Sub = EventTest.sub();
    Sub.trigger("yoyo");
    expect(spy).not.toHaveBeenCalled();
  });


  it("should not unbind all events if given and undefined object", function() {
    EventTest.bind("daddyo", spy);
    EventTest.unbind(undefined);
    EventTest.trigger("daddyo");
    expect(spy).toHaveBeenCalled();
  });

  it("should not stopListening to all events if given and undefined object", function() {
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenTo(EventTest, "house", spy);
    ListenTest.stopListening(undefined);
    EventTest.trigger("house");
    expect(spy).toHaveBeenCalled();
  });

  it("should stop listening only on the specified events", function() {
    var spy2 = jasmine.createSpy();
    ListenTest = Spine.Class.create();
    ListenTest.extend(Spine.Events);
    ListenTest.listenToOnce(EventTest, "dastardly1", spy);
    ListenTest.listenTo(EventTest, "dastardly2", spy2);
    EventTest.trigger("dastardly2");
    ListenTest.stopListening(EventTest, "dastardly2");
    EventTest.trigger("dastardly1");
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });
});
