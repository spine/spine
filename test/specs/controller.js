describe("Controller", function(){
  var Users;
  var element;
  
  beforeEach(function(){
    Users = Spine.Controller.sub();
    element = $("<div />");
  });
    
  it("should be configurable", function(){
    element.addClass("testy");
    var users = Users.init({el: element});
    expect(users.el.hasClass("testy")).toBeTruthy();
    
    var users = Users.init({item: "foo"});
    expect(users.item).toEqual("foo");
  });
  
  it("should generate element", function(){
    var users = Users.init();
    expect(users.el).toBeTruthy();
  });
  
  it("can populate elements", function(){
    Users.include({
      elements: {".foo": "foo"},
    });
    
    element.append($("<div />").addClass("foo"));
    var users = Users.init({el: element});
    
    expect(users.foo).toBeTruthy();
    expect(users.foo.hasClass("foo")).toBeTruthy();
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
        
      var users = Users.init({el: element});
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
    
      var users = Users.init({el: element});
      child.click();    
      expect(spy).toHaveBeenCalled();
    });
  });
});