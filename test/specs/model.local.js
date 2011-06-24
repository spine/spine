describe("Model.Local", function(){
  var User;
  
  beforeEach(function(){
    User = Spine.Model("User", "name")
  });
  
  it("should persist attributes", function(){
    User.extend(Spine.Model.Local);
    
    User.create({name: "Bob"});
    User.records = {};
    
    User.loadLocal();
    expect(User.first()).toBeTruthy();
  });
});