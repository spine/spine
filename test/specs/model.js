describe("Model", function(){
  var Asset;
  
  beforeEach(function(){
    Asset = Spine.Model.setup("Asset", ["name"]);
  });
  
  it("can create records", function(){
    var asset = Asset.create({name: "test.pdf"});
    expect(Asset.first()).toEqual(asset);
  });

  it("can update records", function(){
    var asset = Asset.create({name: "test.pdf"});

    expect(Asset.first().name).toEqual("test.pdf");

    asset.name = "wem.pdf";
    asset.save();
    
    expect(Asset.first().name).toEqual("wem.pdf");
  });
  
  it("can destroy records", function(){
    var asset = Asset.create({name: "test.pdf"});

    expect(Asset.first()).toEqual(asset);
    asset.destroy();
    expect(Asset.first()).toBeFalsy();
  });
  
  it("can find records", function(){
    var asset = Asset.create({name: "test.pdf"});
    expect(Asset.find(asset.id)).toBeTruthy();
    
    asset.destroy();
    expect(function(){
      Asset.find(asset.id);
    }).toThrow();
  });
  
  it("can check existence", function(){
    var asset = Asset.create({name: "test.pdf"});
    
    expect(asset.exists()).toBeTruthy();
    expect(Asset.exists(asset.id)).toBeTruthy();
    
    asset.destroy();
    
    expect(asset.exists()).toBeFalsy();
    expect(Asset.exists(asset.id)).toBeFalsy();
  });
  
  it("can reload", function(){
    var asset = Asset.create({name: "test.pdf"});
    
    Asset.find(asset.id).updateAttributes({name: "foo.pdf"});
    
    expect(asset.name).toEqual("test.pdf");
    asset = asset.reload();
    expect(asset.name).toEqual("foo.pdf");
  });
  
  it("can select records", function(){
    var asset1 = Asset.create({name: "test.pdf"});
    var asset2 = Asset.create({name: "foo.pdf"});
    
    var selected = Asset.select(function(rec){ return rec.name == "foo.pdf" });
    
    expect(selected).toEqual([asset2]);
  });
  
  it("can return all records", function(){
    var asset1 = Asset.create({name: "test.pdf"});
    var asset2 = Asset.create({name: "foo.pdf"});
    
    expect(Asset.all()).toEqual([asset1, asset2]);
  });
  
  it("can find records by attribute", function(){
    var asset = Asset.create({name: "foo.pdf"});
    Asset.create({name: "test.pdf"});
    
    var findOne = Asset.findByAttribute("name", "foo.pdf");
    expect(findOne).toEqual(asset);
    
    var findAll = Asset.findAllByAttribute("name", "foo.pdf");
    expect(findAll).toEqual([asset]);
  });
  
  it("can find first/last record", function(){
    var first = Asset.create({name: "foo.pdf"});
    Asset.create({name: "test.pdf"});
    var last = Asset.create({name: "wem.pdf"});
    
    expect(Asset.first()).toEqual(first);
    expect(Asset.last()).toEqual(last);
  });
  
  it("can destroy all records", function(){
    Asset.create({name: "foo.pdf"});
    Asset.create({name: "foo.pdf"});
    
    expect(Asset.count()).toEqual(2);
    Asset.destroyAll();
    expect(Asset.count()).toEqual(0);
  });
  
  it("can delete all records", function(){
    Asset.create({name: "foo.pdf"});
    Asset.create({name: "foo.pdf"});
    
    expect(Asset.count()).toEqual(2);
    Asset.deleteAll();
    expect(Asset.count()).toEqual(0);
  });
  
  it("can be serialized into JSON", function(){
    var asset = Asset.init({name: "Johnson me!"});
    
    expect(JSON.stringify(asset)).toEqual('{"name":"Johnson me!"}');
  });
  
  it("can validate", function(){
    Asset.include({
      validate: function(){
        if ( !this.name )
          return "Name required";
      }
    });
    
    expect(function(){
      Asset.create({name: ""})
    }).toThrow();
    
    expect(function(){
      Asset.create({name: "Yo big dog"})
    }).not.toThrow();
  });
  
  it("has attribute hash", function(){
    var asset = Asset.init({name: "wazzzup!"});
    expect(asset.attributes()).toEqual({name: "wazzzup!"});
  });
  
  it("can generate GUID", function(){
    var asset = Asset.create({name: "who's in the house?"});
    expect(asset.id.length).toEqual(36);
  });
  
  describe("with spy", function(){
    var spy;
    
    beforeEach(function(){
      var noop = {spy: function(){}};
      spyOn(noop, "spy");
      spy = noop.spy;
    });
    
    it("can interate over records", function(){
      var asset1 = Asset.create({name: "test.pdf"});
      var asset2 = Asset.create({name: "foo.pdf"});
      
      Asset.each(spy);
      expect(spy).toHaveBeenCalledWith(asset1);
      expect(spy).toHaveBeenCalledWith(asset2);
    });
    
    it("can fire create events", function(){
      Asset.bind("create", spy);
      var asset = Asset.create({name: "cartoon world.png"});
      expect(spy).toHaveBeenCalledWith(asset);
    });

    it("can fire save events", function(){
      Asset.bind("save", spy);
      var asset = Asset.create({name: "cartoon world.png"});
      expect(spy).toHaveBeenCalledWith(asset);
      
      asset.save();
      expect(spy).toHaveBeenCalled();
    });

    it("can fire update events", function(){
      Asset.bind("update", spy);
      
      var asset = Asset.create({name: "cartoon world.png"});
      expect(spy).not.toHaveBeenCalledWith(asset);
      
      asset.save();
      expect(spy).toHaveBeenCalledWith(asset);
    });

    it("can fire destroy events", function(){
      Asset.bind("destroy", spy);
      var asset = Asset.create({name: "cartoon world.png"});
      asset.destroy();
      expect(spy).toHaveBeenCalledWith(asset);
    });

    it("can fire events on record", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("save", spy);
      asset.save();
      expect(spy).toHaveBeenCalledWith(asset);
    });
    
    it("can fire error events", function(){
      Asset.bind("error", spy);
            
      Asset.include({
        validate: function(){
          if ( !this.name )
            return "Name required";
        }
      });
      
      var asset = Asset.create({name: ""});
      expect(spy).toHaveBeenCalledWith(asset, "Name required");
    });
  });
});