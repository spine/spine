describe("Model.Local", function(){
  var User;
  var Model = Spine.Model;
  
  beforeEach(function(){
    User = Model.setup("User", ["name"])
  });
  
  it("should persist attributes", function(){
    User.extend(Model.Local);
    
    User.create({name: "Bob"});
    User.records = {};
    
    User.loadLocal();
    expect(User.first()).toBeTruthy();
  });
});