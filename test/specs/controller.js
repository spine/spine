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

  it("saves controllers on append", function() {
    AnotherController = Spine.Controller.sub()
    var users = new Users();
    var ac    = new AnotherController();
    expect(users.controllers).toEqual([]);
    users.append(ac);
    expect(users.controllers.length).toEqual(1);
    expect(users.controllers).toEqual([ac]);
  });

  it("saves controllers on prepend", function() {
    AnotherController = Spine.Controller.sub()
    var users = new Users();
    var ac    = new AnotherController();
    expect(users.controllers).toEqual([]);
    users.prepend(ac);
    expect(users.controllers.length).toEqual(1);
    expect(users.controllers).toEqual([ac]);
  });

  it("does not save elements to controllers", function() {
    var users = new Users();
    expect(users.controllers).toEqual([]);
    users.append($("<div></div>"));
    expect(users.controllers).toEqual([]);
  });

  it("clears the controllers internal variable on an html call", function() {
    AnotherController = Spine.Controller.sub()
    var users = new Users();
    var ac    = new AnotherController();
    expect(users.controllers).toEqual([]);
    users.append(ac);
    expect(users.controllers).toEqual([ac]);
    users.html("<div></div>");
    expect(users.controllers).toEqual([]);
  });

  it("adds the controllers to the internals on an appendTo call", function() {
    AnotherController = Spine.Controller.sub()
    var users = new Users();
    var ac    = new AnotherController();
    expect(ac.controllers).toEqual([]);
    users.appendTo(ac);
    expect(ac.controllers).toEqual([users]);
  });
});
