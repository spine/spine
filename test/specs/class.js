describe("Class", function(){
  var User;
  
  beforeEach(function(){
    User = Spine.Class.create();
  });
  
  it("is sane", function(){
    expect(Spine).toBeTruthy();
  });
  
  it("can create subclasses", function(){
    User.extend({classProperty: true});
    
    var Friend = User.create();
    expect(Friend).toBeTruthy();
    expect(Friend.classProperty).toBeTruthy();
  });
  
  it("can create instance", function(){
    User.include({instanceProperty: true})
    
    var Bob = User.init();
    expect(Bob).toBeTruthy();
    expect(Bob.instanceProperty).toBeTruthy();
  });
  
  it("calls instances' initializer", function(){
    spyOn(User.fn, "init");
    User.init();
    expect(User.fn.init).toHaveBeenCalled();
  });
  
  it("can be extendable", function(){
    User.extend({
      classProperty: true
    });
    
    expect(User.classProperty).toBeTruthy();
  });
  
  it("can be includable", function(){
    User.include({
      instanceProperty: true
    });
    
    expect(User.prototype.instanceProperty).toBeTruthy();
    expect(User.init().instanceProperty).toBeTruthy();
  });
  
  it("should trigger module callbacks", function(){
    var module = {
      included: function(){}, 
      extended: function(){}
    };
    
    spyOn(module, "included");
    User.include(module);
    expect(module.included).toHaveBeenCalled();
    
    spyOn(module, "extended");
    User.extend(module);
    expect(module.extended).toHaveBeenCalled();    
  });
  
  it("should trigger inheritance callbacks", function(){
    spyOn(User, "inherited");
    var Friend = User.create();    
    expect(User.inherited).toHaveBeenCalled();    
  });
  
  it("can proxy functions", function(){
    User.extend({
      weirdScope: function(){ return this }
    });
    
    expect(User.weirdScope()).toBe(User);
    
    var scope = {};
    expect(User.weirdScope.apply(scope)).toBe(scope);
    expect(User.proxy(User.weirdScope).apply(scope)).toBe(User);
  });
  
  it("can rewrite proxy functions", function(){
    User.extend({
      weirdScope: function(){ return this }
    });
    
    expect(User.weirdScope()).toBe(User);
    User.proxyAll("weirdScope");
    expect(User.weirdScope.apply({})).toBe(User);
  });
});