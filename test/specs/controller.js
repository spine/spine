describe("Controller", function(){
  var Users;
  var element;

  beforeEach(function(){
    Users = Spine.Controller.sub();
    element = $("<div />");
  });

  it("should be configurable", function(){
    element.addClass("testy");
    var users = new Users({el: element});
    expect(users.el.hasClass("testy")).toBeTruthy();

    users = new Users({item: "foo"});
    expect(users.item).toEqual("foo");
  });

  it("should generate element", function(){
    var users = new Users();
    expect(users.el).toBeTruthy();
  });

  it("can replace generated element", function(){
    element = '<div class="new" />'
    var users = new Users();
    users.replace(element);
    expect(users.el.hasClass("new")).toBeTruthy();
    element = $('<div class="newer" />');
    users.replace(element);
    expect(users.el.hasClass("newer")).toBeTruthy();
  });

  it("should populate elements", function(){
    Users.include({
      elements: {".foo": "foo"}
    });

    element.append($("<div />").addClass("foo"));
    var users = new Users({el: element});

    expect(users.foo).toBeTruthy();
    expect(users.foo.hasClass("foo")).toBeTruthy();
  });

  it("should remove element upon release event", function(){
    var parent = $('<div />');
    parent.append(element);

    var users = new Users({el: element});
    expect(parent.children().length).toBe(1);

    users.release();
    expect(parent.children().length).toBe(0);
  });

  it("should set attributes on el", function(){
    Users.include({
      attributes: {"style": "width: 100%"}
    });
    var users = new Users();
    expect(users.el.attr("style")).toMatch("width: 100%");
  });

  describe("When binding DOM events", function(){
    var spy;

    beforeEach(function(){
      spy = jasmine.createSpy();
    });

    it("should add events", function(){
      Users.include({
        events: {"click": "wasClicked"},
        // Context change confuses Spy
        wasClicked: $.proxy(spy, jasmine)
      });
      var users = new Users({el: element});
      element.click();
      expect(spy).toHaveBeenCalled();
    });

    it("should delegate events", function(){
      Users.include({
        events: {"click .foo": "wasClicked"},
        wasClicked: $.proxy(spy, jasmine)
      });
      var child = $("<div />").addClass("foo");
      element.append(child);
      var users = new Users({el: element});
      child.click();
      expect(spy).toHaveBeenCalled();
    });
  });

  /*
    tests related to .listenTo(), .listenToOnce(), and .stopListening()
  */

  describe("When using event listener methods", function(){
    var spy, spy2, Asset, Users, asset, users;

    beforeEach(function(){
      Asset = Spine.Model.setup("Asset", ["name"]);
      asset = Asset.create({name: "test.pdf"});
      Users = Spine.Controller.sub();
      users = new Users();
      spy = jasmine.createSpy();
      spy2 = jasmine.createSpy();
    });

    it("can listen to one event on a model instance", function(){
      users.listenTo(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
    });

    it("wont listen to events of the same name on unlistened to model instances", function(){
      users.listenTo(asset, 'event1', spy);
      var asset2 = Asset.create({name: "scooby.pdf"});
      var asset3 = Asset.create({name: "shaggy.pdf"});
      asset3.trigger("event1");
      asset2.trigger("evemt1")
      expect(spy).not.toHaveBeenCalled();
    });

    it("can listen to many events on a model instance", function(){
      users.listenTo(asset, 'event1 event2 event3', spy);
      asset.trigger("event1");
      asset.trigger("event2");
      asset.trigger("event3");
      expect(spy).toHaveBeenCalled();
      expect(spy.callCount).toBe(3);
    });

    it("can listen once for an event on a model instance", function(){
      users.listenToOnce(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
    });

    it("can stop listening to a specific event on a model instance while maintaining listeners on other events", function(){
      users.listenTo(asset, 'event1 event2 event3', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      users.stopListening(asset, 'event1');
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
      spy.reset();
      asset.trigger("event2");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      asset.trigger("event3");
      expect(spy).toHaveBeenCalled();
    });

    it("can stop listening to all events on a model instance", function(){
      users.listenTo(asset, 'event1 event2 event3', spy);
      asset.trigger("event2");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      users.stopListening(asset);
      asset.trigger("event1");
      asset.trigger("event2");
      asset.trigger("event3");
      expect(spy).not.toHaveBeenCalled();
    });

    it("should stop listening to events on a model instance, without canceling out other binders on that model instance", function(){
      Asset.bind('event1', spy2)
      users.listenTo(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      spy.reset();
      spy2.reset();
      users.stopListening(asset, 'event1');
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    // this is the major benefit of the listeners. helps manage cleanup of obsolete binders

    it("should stop listening if the controller is released", function(){
      users.listenTo(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      users.release();
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
    });

    it("should stop listening to events on a model instance if the controller is released, without canceling out other binders on that model instance", function(){
      asset.bind('event1', spy2)
      users.listenTo(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      spy.reset();
      spy2.reset();
      users.release();
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

  });

  describe("When using inheritance", function() {
    beforeEach(function() {
      element = $('<div/>').html('<div class="a-el"></div><div class="b-el"></div><div class="c-el"></div>');
      A = Spine.Controller.sub({
        events: {"click .a-el": "aEventHandler"},
        elements: {".a-el": "elA"},
        aEventHandler: function() {}
      });

      B = A.sub({
        el: element,
        events: {"click .b-el": "bEventHandler"},
        elements: {".b-el": "elB"},
        bEventHandler: function() {}
      });

      C = B.sub({
        el: element,
        events: {"click .c-el": "cEventHandler"},
        elements: {".c-el": "elC"},
        cEventHandler: function() {}
      });

      c = new C();
    });

    it("should inherit elements from parent controllers", function(){
      expect(c.elA).toBeDefined();
      expect(c.elB).toBeDefined();
      expect(c.elC).toBeDefined();
    });

    it("should inherit events from parent controllers", function(){
      spyOn(c, 'aEventHandler');
      spyOn(c, 'bEventHandler');
      spyOn(c, 'cEventHandler');
      c.el.find('.a-el').click();
      c.el.find('.b-el').click();
      c.el.find('.c-el').click();

      expect(c.aEventHandler).toHaveBeenCalled();
      expect(c.bEventHandler).toHaveBeenCalled();
      expect(c.cEventHandler).toHaveBeenCalled();
    });
  });
});
