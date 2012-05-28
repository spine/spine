describe("Model.Dirty", function() {
  var user;
  var spy;

  beforeEach(function() {
    var User = Spine.Model.setup("User", ["name", "emails"]);
    User.extend(Spine.Model.Dirty);
    user = User.create({name: "Dingding", emails: ["yedingding@gmail.com"]});
    var noop = {spy: function(){}};
    spyOn(noop, "spy");
    spy = noop.spy;
  });

  it("should have previousAttributes", function() {
    expect(user.previousAttributes.name).toEqual("Dingding");
    expect(user.previousAttributes.emails).toEqual(["yedingding@gmail.com"]);
  });

  it("should trigger the change:name event", function() {
    user.bind("change:name", spy);
    user.updateAttribute("name", "Bob");
    expect(spy).toHaveBeenCalledWith(user, "Bob");
  });

  it("should trigger the change:emails event", function() {
    user.bind("change:emails", spy);
    user.updateAttribute("emails", ["bob@gmail.com"]);
    expect(spy).toHaveBeenCalledWith(user, ["bob@gmail.com"]);
  });
});