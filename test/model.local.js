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

  it("should work with cIDs", function(){
    User.refresh([
      {name: "Bob", id: "c-1"},
      {name: "Bob", id: "c-3"},
      {name: "Bob", id: "c-2"}
    ]);
    expect(User.idCounter).toEqual(3);
  });

  it("should work with a blank refresh", function(){
    User.refresh([]);
    expect(User.idCounter).toEqual(0);
  });

  describe(".saveLocal", function(){
    beforeEach(function(){
      User.extend(Spine.Model.Local);
    });

    it("should store User JSON data in localStorage", function(){
      var data = [
        {name: "Bob", id: "c-1"}
      ];
      User.refresh(data);
      
      delete localStorage['User'];
      expect(localStorage['User']).toEqual(undefined);
      User.saveLocal();
      expect(localStorage['User']).toEqual(JSON.stringify(data));
    });
  });

  describe(".loadLocal", function(){
    beforeEach(function(){
      User.extend(Spine.Model.Local);
      var data = [
        {name: "Bob", id: "c-1"}
      ];
      localStorage['User'] = JSON.stringify(data);
    });

    it("should read User JSON data from localStorage and refresh User", function(){
      expect(User.count()).toEqual(0);
      User.loadLocal();
      expect(User.count()).toEqual(1);
    });

    it("should not delete existing records when set clear option to false", function(){
      User.refresh([
        {name: "Bob", id: "c-0"}
      ]);
      expect(User.count()).toEqual(1);
      User.loadLocal({clear: false});
      expect(User.count()).toEqual(2);
    });
  });

});
