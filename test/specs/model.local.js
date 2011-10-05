describe("Model.Local", function(){
  var User;
  
  beforeEach(function(){
    User = Spine.Model.setup("User", ["name"]);
  });
  
  it("should persist attributes", function(){
    User.extend(Spine.Model.Local);
    User.create({name: "Bob"});    
    User.fetch();
    
    expect(User.first()).toBeTruthy();
    expect(User.first().name).toEqual("Bob");
  });
});