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

  it("should reset ID counter", function(){
    User.refresh([{name: "Bob", id: 1}]);
    expect(User.idCounter).toEqual(2);
  });

  it("should work with non string IDs", function(){
    User.refresh([{name: "Bob", id: "b"}]);
    expect(User.idCounter).toEqual(0);
  });
});