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

  it("can populate elements", function(){
    Users.include({
      elements: {".foo": "foo"}
    });

    element.append($("<div />").addClass("foo"));
    var users = new Users({el: element});

    expect(users.foo).toBeTruthy();
    expect(users.foo.hasClass("foo")).toBeTruthy();
  });

  it("can remove element upon release event", function(){
    var parent = $('<div />');
    parent.append(element);

    var users = new Users({el: element});
    expect(parent.children().length).toBe(1);

    users.release();
    expect(parent.children().length).toBe(0);
  });

  describe("with spy", function(){
    var spy;

    beforeEach(function(){
      var noop = {spy: function(){}};
      spyOn(noop, "spy");
      spy = noop.spy;
    });

    it("can add events", function(){
      Users.include({
        events: {"click": "wasClicked"},

        // Context change confuses Spy
        wasClicked: $.proxy(spy, jasmine)
      });

      var users = new Users({el: element});
      element.click();
      expect(spy).toHaveBeenCalled();
    });

    it("can delegate events", function(){
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

  it("can set attributes on el", function(){
    Users.include({
      attributes: {"style": "width: 100%"}
    });

    var users = new Users();
    expect(users.el.attr("style")).toEqual("width: 100%");
  });
  
  it("can listen to events on a model instance", function(){
    var Asset = Spine.Model.setup("Asset", ["name"]);
    var asset = Asset.create({name: "test.pdf"});
    var users = new Users();
    var noop = {spy: function(){}};
    spyOn(noop, "spy");
    spy = noop.spy;
    users.listenTo(asset, 'event1 event2', spy);
    asset.trigger("event1");
    expect(spy).toHaveBeenCalled();
  });
  
  it("can listen once for an event on a model instance", function(){
    var Asset = Spine.Model.setup("Asset", ["name"]);
    var asset = Asset.create({name: "test.pdf"});
    var users = new Users();
    var noop = {spy: function(){}};
    spyOn(noop, "spy");
    spy = noop.spy;
    users.listenToOnce(asset, 'event1', spy);
    asset.trigger("event1");
    expect(spy).toHaveBeenCalled();
    spy.reset();
    asset.trigger("event1");
    expect(spy).not.toHaveBeenCalled();
  });
  
  it("can stop listening to events on a model instance", function(){
    var Asset = Spine.Model.setup("Asset", ["name"]);
    var asset = Asset.create({name: "test.pdf"});
    var users = new Users();
    var noop = {spy: function(){}};
    spyOn(noop, "spy");
    spy = noop.spy;
    users.listenTo(asset, 'event1', spy);
    asset.trigger("event1");
    expect(spy).toHaveBeenCalled();
    spy.reset();
    users.stopListening(asset, 'event1', spy);
    asset.trigger("event1");
    expect(spy).not.toHaveBeenCalled();
  });
  
  it("can stop listening to events on a model instance, without canceling out other binders on that model instance", function(){
    var Asset = Spine.Model.setup("Asset", ["name"]);
    var asset = Asset.create({name: "test.pdf"});
    var users = new Users();
    var noop = {spy: function(){}, spy2: function(){}};
    spyOn(noop, "spy");
    spyOn(noop, "spy2");
    spy = noop.spy;
    spy2 = noop.spy2;
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
});
