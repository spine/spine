describe("Model", function(){
  var Asset;

  beforeEach(function(){
    Asset = Spine.Model.setup("Asset", ["name", "visible", "contact_methods"]);
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
    expect(asset.hasOwnProperty("name")).toBeFalsy();
  });

  it("can refresh existing records", function(){
    var asset = Asset.create({name: "test.pdf"});
    expect(Asset.first().name).toEqual("test.pdf");

    var changedAsset = asset.toJSON();
    changedAsset.name = "wem.pdf";
    Asset.refresh(changedAsset);

    expect(Asset.count()).toEqual(1);
    expect(Asset.first().name).toEqual("wem.pdf");
  });

  it("can keep record clones in sync after refreshing the record", function(){
    var asset = Asset.create({name: "test.pdf"});
    expect(Object.getPrototypeOf(asset)).toEqual(Asset.irecords[asset.id]);

    var changedAsset = asset.toJSON();
    changedAsset.name = "wem.pdf";
    Asset.refresh(changedAsset);
    selectedAsset = Asset.select(function(rec){
      return rec.id === asset.id;
    })[0];

    expect(asset.name).toEqual("wem.pdf");
    expect(selectedAsset.name).toEqual("wem.pdf");
    expect(Object.getPrototypeOf(asset)).toBe(Asset.irecords[asset.id]);
    expect(Object.getPrototypeOf(selectedAsset)).toBe(Asset.irecords[asset.id]);
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
    expect(Asset.find(asset.id)).toBeFalsy();
  });

  it("can use notFound fallback function if records are not found with find", function(){
    var asset = Asset.create({name: "test.pdf"});
    expect(Asset.find(asset.id)).toBeTruthy();
    // defauly notFound simply returns null
    asset.destroy();
    expect(Asset.find(asset.id)).toBeFalsy();
    // a custom notFound fallback can be added to the find
    var customfallback = function(id){
      sessionStorage.fallbackRan = true
      sessionStorage.fallbackReceivedId = id
      return Asset.create({name: 'test2.pdf', id:id})
    };
    var foundAsset = Asset.find(asset.id, customfallback);
    expect(foundAsset).toBeTruthy();
    expect(foundAsset.id).toBe(asset.id);
    expect(sessionStorage.fallbackRan).toBe('true');
    expect(sessionStorage.fallbackReceivedId).toBe(asset.id);
    // notFound can be customized on the model
    asset.destroy(); //reset
    expect(Asset.find(asset.id)).toBeFalsy(); // test reset worked
    Asset.notFound = function(id){
      sessionStorage.fallback2Ran = true
      sessionStorage.fallback2ReceivedId = id
      return Asset.create({name: 'test3.pdf'})
    };
    var foundAsset2 = Asset.find(asset.id);
    expect(foundAsset2).toBeTruthy();
    expect(foundAsset2.name).toBe('test3.pdf');
    expect(sessionStorage.fallback2Ran).toBe('true');
    expect(sessionStorage.fallback2ReceivedId).toBe(asset.id);

    sessionStorage.clear()
  });

  it("can findAll records", function(){
    var asset1 = Asset.create({name: "test1.pdf"}),
        asset2 = Asset.create({name: "test2.pdf"});
    expect(Asset.findAll([asset1.id, asset2.id]).length).toBe(2);

    asset1.destroy();
    asset2.destroy();
    expect(Asset.findAll([asset1.id, asset2.id]).length).toBe(0);
  });

  it("can use notFound fallback function if records are not found with findAll", function(){
    var asset1 = Asset.create({name: "test1.pdf"}),
        asset2 = Asset.create({name: "test2.pdf"});
    expect(Asset.findAll([asset1.id, asset2.id]).length).toBe(2);
    // defauly notFound simply returns null
    asset1.destroy();
    expect(Asset.findAll([asset1.id]).length).toBe(0);
    expect(Asset.findAll([asset1.id, asset2.id]).length).toBe(1);
    // a custom notFound fallback can be added to the findAll
    var customfallback = function(id){
      sessionStorage.fallbackRan = true
      sessionStorage.fallbackReceivedId = id
      return Asset.create({name: 'test3.pdf', id:id})
    };
    var foundAssets = Asset.findAll([asset1.id, asset2.id], customfallback);
    expect(foundAssets.length).toBe(2);
    expect(foundAssets[0].id).toBe(asset1.id);
    expect(sessionStorage.fallbackRan).toBe('true');
    expect(sessionStorage.fallbackReceivedId).toBe(asset1.id);
    // notFound can be customized on the model
    asset1.destroy(); //reset
    expect(Asset.findAll([asset1.id]).length).toBe(0); // test reset worked
    expect(Asset.findAll([asset1.id, asset2.id]).length).toBe(1);
    Asset.notFound = function(id){
      sessionStorage.fallback2Ran = true
      sessionStorage.fallback2ReceivedId = id
      return Asset.create({name: 'test4.pdf'})
    };
    var foundAssets2 = Asset.findAll([asset1.id]);
    expect(foundAssets2.length).toBe(1);
    expect(foundAssets2[0].name).toBe('test4.pdf');
    expect(sessionStorage.fallback2Ran).toBe('true');
    expect(sessionStorage.fallback2ReceivedId).toBe(asset1.id);
    expect(Asset.findAll([asset1.id, asset2.id]).length).toBe(2);

    sessionStorage.clear()
  });

  it("can check existence", function(){
    var asset1 = Asset.create({id: 1, name: "test.pdf"});
    var asset2 = Asset.create({id: 2, name: "wem.pdf"});

    expect(asset1.exists()).toBeTruthy();
    expect(Asset.exists(asset1.id)).toBeTruthy();
    expect(Asset.find(asset1.id).name).toEqual("test.pdf");

    asset1.destroy();

    expect(asset1.exists()).toBeFalsy();
    expect(Asset.exists(asset1.id)).toBeFalsy();
  });

  it("can reload", function(){
    var asset = Asset.create({name: "test.pdf"}).dup(false);

    Asset.find(asset.id).updateAttributes({name: "foo.pdf"});

    expect(asset.name).toEqual("test.pdf");
    var original = asset.reload();
    expect(asset.name).toEqual("foo.pdf");

    // Reload should return a clone, more useful that way
    expect(Object.getPrototypeOf(Object.getPrototypeOf(original))).toEqual(Asset.prototype)
  });

  it("can refresh", function(){
    var asset = Asset.create({name: 'foo.pdf'});
    var clone = asset.clone();
    clone.refresh({name: 'bar.pdf'});
    expect(asset.name).toEqual('bar.pdf');
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

  it("can return a slice of records", function(){
    var asset0 = Asset.create({name: "test.pdf"});
    var asset1 = Asset.create({name: "foo1.pdf"});
    var asset2 = Asset.create({name: "foo2.pdf"});
    var asset3 = Asset.create({name: "foo3.pdf"});
    var asset4 = Asset.create({name: "foo4.pdf"});
    var asset5 = Asset.create({name: "womp.pdf"});
    var asset6 = Asset.create({name: "wamp.pdf"});
    expect(Asset.slice(3)).toEqual([asset3, asset4, asset5, asset6]);
    expect(Asset.slice(4,6)).toEqual([asset4, asset5]);
  });

  it("can find records by attribute", function(){
    var asset = Asset.create({name: "foo.pdf"});
    Asset.create({name: "test.pdf"});

    var findOne = Asset.findByAttribute("name", "foo.pdf");
    expect(findOne.name).toEqual(asset.name);

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

  it("can return first(x)/last(x) records", function(){
    var asset0 = Asset.create({name: "test.pdf"});
    var asset1 = Asset.create({name: "foo1.pdf"});
    var asset2 = Asset.create({name: "foo2.pdf"});
    var asset3 = Asset.create({name: "foo3.pdf"});
    var asset4 = Asset.create({name: "foo4.pdf"});
    var asset5 = Asset.create({name: "womp.pdf"});
    var asset6 = Asset.create({name: "wamp.pdf"});

    expect(Asset.last(3)).toEqual([asset4, asset5, asset6]);
    expect(Asset.first(2)).toEqual([asset0, asset1]);
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
    var asset = new Asset({name: "Johnson me!"});

    expect(JSON.stringify(asset)).toEqual('{"name":"Johnson me!"}');
  });

  it("can be deserialized from JSON", function(){
    var asset = Asset.fromJSON('{"name":"Un-Johnson me!"}')
    expect(asset.name).toEqual("Un-Johnson me!");

    var assets = Asset.fromJSON('[{"name":"Un-Johnson me!"}]')
    expect(assets[0] && assets[0].name).toEqual("Un-Johnson me!");
  });

  it("can be instantiated from a form", function(){
    var form = $('<form />');
    form.append('<input name="name" value="bar" />');
    var asset = Asset.fromForm(form);
    expect(asset.name).toEqual("bar");
  });

  describe ("from a form with unchecked checkboxes", function(){
    it("can be instantiated with boolean values", function(){
      var form = $('<form />');
      form.append('<input type="checkbox" name="visible" />');
      var asset = Asset.fromForm(form);
      expect(asset.visible).toEqual(false);
    });

    it("can be instantiated with array style checkboxes", function(){
      var form = $('<form />');
      form.append('<input type="checkbox" name="contact_methods[]" value="email" />');
      form.append('<input type="checkbox" name="contact_methods[]" value="phone" />');
      form.append('<input type="checkbox" name="contact_methods[]" value="sms" />');
      var asset = Asset.fromForm(form);
      expect(asset.contact_methods).toEqual([]);
    });

    it("can be instantiated with single style checkboxes", function(){
      var form = $('<form />');
      form.append('<input type="checkbox" name="association_id" value="12345" checked/>');
      var asset = Asset.fromForm(form);
      expect(asset.association_id).toEqual("12345");
    });
  })

  describe ("fromFroms with checked checkboxes", function(){
    it("can be instantiated with boolean values", function(){
      var form = $('<form />');
      form.append('<input type="checkbox" name="visible" />');
      var asset = Asset.fromForm(form);
      expect(asset.visible).toEqual(false);
    });

    it("can be instantiated with array style checkboxes", function(){
      var form = $('<form />');
      form.append('<input type="checkbox" name="contact_methods[]" value="email" checked/>');
      form.append('<input type="checkbox" name="contact_methods[]" value="phone" />');
      form.append('<input type="checkbox" name="contact_methods[]" value="sms" checked/>');
      var asset = Asset.fromForm(form);
      expect(asset.contact_methods).toEqual(['email', 'sms']);
    });

    it("can be instantiated with single style checkboxes", function(){
      var form = $('<form />');
      form.append('<input type="checkbox" name="association_id" value="12345" />');
      var asset = Asset.fromForm(form);
      expect(asset.association_id).toEqual(undefined);
    });
  })

  it("can validate", function(){
    Asset.include({
      validate: function(){
        if ( !this.name )
          return "Name required";
      }
    });

    expect(Asset.create({name: ""})).toBeFalsy();
    expect(new Asset({name: ""}).isValid()).toBeFalsy();

    expect(Asset.create({name: "Yo big dog"})).toBeTruthy();
    expect(new Asset({name: "Yo big dog"}).isValid()).toBeTruthy();
  });

  it("can have validation disabled", function(){
    Asset.include({
      validate: function(){
        if ( !this.name )
          return "Name required";
      }
    });

    var asset = new Asset;
    expect(asset.save()).toBeFalsy();
    expect(asset.save({validate: false})).toBeTruthy();
  });

  it("should have an attribute hash", function(){
    var asset = new Asset({name: "wazzzup!"});
    expect(asset.attributes()).toEqual({name: "wazzzup!"});
  });

  it("attributes() should not return undefined atts", function(){
    var asset = new Asset();
    expect(asset.attributes()).toEqual({});
  });

  it("can load() attributes", function(){
    var asset = new Asset();
    var result = asset.load({name: "In da' house"});
    expect(result).toBe(asset);
    expect(asset.name).toEqual("In da' house");
  });

  it("can load() attributes respecting getters/setters", function(){
    Asset.include({
      name: function(value){
        var ref = value.split(' ', 2);
        this.first_name = ref[0];
        this.last_name  = ref[1];
      }
    })

    var asset = new Asset();
    asset.load({name: "Alex MacCaw"});
    expect(asset.first_name).toEqual("Alex");
    expect(asset.last_name).toEqual("MacCaw");
  });

  it("can load() attributes from model instances respecting getters/setters", function(){
    spy = jasmine.createSpy();
    Asset.include({spy: spy});
    var asset     = Asset.create({name: "test.pdf"});
    var assetDupe = new Asset(asset.attributes());

    assetDupe.spy  = spy; // Simulate instance method using CoffeeScript fat-arrow
    assetDupe.name = "wem.pdf";

    asset.load(assetDupe);
    expect(spy).not.toHaveBeenCalled();
    expect(asset.name).toEqual("wem.pdf");

    assetDupe.spy = "setter value";
    asset.load(assetDupe);
    expect(spy).toHaveBeenCalledWith("setter value");
  });

  it("attributes() respects getters/setters", function(){
    Asset.include({
      name: function(){
        return "Bob";
      }
    })

    var asset = new Asset();
    expect(asset.attributes()).toEqual({name: "Bob"});
  });

  it("can generate ID", function(){
    var asset = Asset.create({name: "who's in the house?"});
    expect(asset.id).toBeTruthy();
  });

  it("can generate UUID if enabled", function(){
    Asset.uuid = function(){ return 'fc0942b0-956f-11e2-9c95-9b0af2c6635d' };
    var asset = new Asset({name: "who's in the house?"});
    expect(asset.id).toBeTruthy();
    expect(asset.id).toEqual(Asset.uuid());
    expect(asset.id).toEqual(asset.cid);
    delete Asset.uuid
  });

  it("can be duplicated", function(){
    var asset = Asset.create({name: "who's your daddy?"});
    expect(Object.getPrototypeOf(asset.dup())).toBe(Asset.prototype);

    expect(asset.name).toEqual("who's your daddy?");
    asset.name = "I am your father";
    expect(asset.reload().name).toBe("who's your daddy?");

    expect(asset).not.toBe(Asset.records[asset.id]);
  });

  it("can be cloned", function(){
    var asset = Asset.create({name: "what's cooler than cool?"}).dup(false);
    expect(Object.getPrototypeOf(asset.clone())).not.toBe(Asset.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(asset.clone()))).toBe(Asset.prototype);

    expect(asset.name).toEqual("what's cooler than cool?");
    asset.name = "ice cold";
    expect(asset.reload().name).toBe("what's cooler than cool?");
  });

  it("clones are dynamic", function(){
    var asset = Asset.create({name: "hotel california"});

    // reload reference
    var clone = Asset.find(asset.id);

    asset.name = "checkout anytime";
    asset.save();

    expect(clone.name).toEqual("checkout anytime");
  });

  it("create or save should return a clone", function(){
    var asset = Asset.create({name: "what's cooler than cool?"});
    expect(Object.getPrototypeOf(asset)).not.toBe(Asset.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(asset))).toBe(Asset.prototype);
  });

  it("should be able to be subclassed", function(){
    Asset.extend({
      aProperty: true
    });

    var File = Asset.setup("File");

    expect(File.aProperty).toBeTruthy();
    expect(File.className).toBe("File");

    expect(File.attributes).toEqual(Asset.attributes);
  });

  it("dup should take a newRecord argument, which controls if a new record is returned", function(){
    var asset = Asset.create({name: "hotel california"});
    expect(asset.dup().id).toBeUndefined();
    expect(asset.dup().isNew()).toBeTruthy();

    expect(asset.dup(false).id).toBe(asset.id);
    expect(asset.dup(false).newRecord).toBeFalsy();
  });

  it("should be able to change ID", function(){
    var asset = Asset.create({name: "hotel california"});
    expect(asset.id).toBeTruthy();
    asset.changeID("foo");
    expect(asset.id).toBe("foo");

    expect(Asset.exists("foo")).toBeTruthy();
  });

  it("eql should respect ID changes", function(){
    var asset1 = Asset.create({name: "hotel california", id: "bar"});
    var asset2 = asset1.dup(false);

    asset1.changeID("foo");
    expect(asset1.eql(asset2)).toBeTruthy();
  });

  it("should not delete reference to cID when changing ID", function(){
    var asset = Asset.create({name: "hotel california"});
    var cid = asset.cid;

    asset.changeID(1);
    expect(Asset.exists(cid)).toBeTruthy();
  });

  it("new records should not be eql", function(){
    var asset1 = new Asset;
    var asset2 = new Asset;
    expect(asset1.eql(asset2)).not.toBeTruthy();
  });

  it("should generate unique cIDs", function(){
    Asset.refresh({name: "Bob", id: 3});
    Asset.refresh({name: "Bob", id: 2});
    Asset.refresh({name: "Bob", id: 1});
    expect(Asset.find(2).eql(Asset.find(1))).not.toBeTruthy();
  });

  it("should handle more than 10 cIDs correctly", function(){
    for (i=0; i < 12; i++) {
      Asset.refresh({name: "Bob", id: i});
    }
    expect(Asset.idCounter).toEqual(12);
  });

  it("should keep model references in sync", function(){
    ref1 = Asset.create({name: "Bob"});
    ref2 = Asset.all()[0]
    ref1.updateAttribute("name", "Jack");
    ref2.updateAttribute("name", "Smith");
    expect(ref2.name).toEqual(ref1.name);
  });

  it("should return records in the same order they were created", function(){
    ref1 = Asset.create({name: "Bob", id: "1"});
    ref2 = Asset.create({name: "Jan", id: "some long string id"});
    ref3 = Asset.create({name: "Pat", id: "33"});
    ref4 = Asset.create({name: "Joe", id: 444});
    expect(Asset.last().id).toEqual(ref4.id);
    expect(Asset.first().id).toEqual(ref1.id);
  });

  it("should preserve relative order of records when instances created or destroyed", function(){
    ref1 = Asset.create({name: "Bob", id: "1"});
    ref2 = Asset.create({name: "Jan", id: "some long string id"});
    expect(Asset.last().id).toEqual(ref2.id);
    ref3 = Asset.create({name: "Pat", id: "33"});
    ref4 = Asset.create({name: "Joe", id: 444});
    expect(Asset.last().id).toEqual(ref4.id);
    expect(Asset.first().id).toEqual(ref1.id);
    ref4.destroy();
    expect(Asset.last().id).toEqual(ref3.id);
    expect(Asset.first().id).toEqual(ref1.id);
    ref1.destroy();
    expect(Asset.last().id).toEqual(ref3.id);
    expect(Asset.first().id).toEqual(ref2.id);
  });

  it("should return records in the in the order defined by the @comparator", function() {
    Asset.comparator = function(a,b) { return a.id - b.id };
    ref1 = Asset.create({name: "Bob", id: 3});
    ref2 = Asset.create({name: "Jan", id: 1});
    ref3 = Asset.create({name: "Pat", id: 8});
    ref4 = Asset.create({name: "Joe", id: 4});
    expect(Asset.last().id).toEqual(ref3.id);
    expect(Asset.first().id).toEqual(ref2.id);
    // after adding or removing items comparator should still work
    ref5 = Asset.create({name: "Bob", id: 6});
    expect(Asset.last().id).toEqual(ref3.id);
    ref6 = Asset.create({name: "Jan", id: 11});
    expect(Asset.last().id).toEqual(ref6.id);
    ref2.destroy()
    expect(Asset.first().id).toEqual(ref1.id);
  });

  describe("with spy", function(){
    var spy;

    beforeEach(function(){
      spy = jasmine.createSpy();
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
      expect(spy).toHaveBeenCalledWith(asset, {});
    });

    it("can fire save events", function(){
      Asset.bind("save", spy);
      var asset = Asset.create({name: "cartoon world.png"});
      expect(spy).toHaveBeenCalledWith(asset, {});

      asset.save();
      expect(spy).toHaveBeenCalled();
    });

    it("can fire update events", function(){
      Asset.bind("update", spy);

      var asset = Asset.create({name: "cartoon world.png"});
      expect(spy).not.toHaveBeenCalledWith(asset);

      asset.save();
      expect(spy).toHaveBeenCalledWith(asset, {});
    });

    it("can fire destroy events", function(){
      Asset.bind("destroy", spy);
      var asset = Asset.create({name: "cartoon world.png"});
      asset.destroy();
      expect(spy).toHaveBeenCalledWith(asset, {clear: true});
    });

    it("can fire destroy events when destroy all record with options", function(){
      Asset.bind("destroy", spy);
      var asset = Asset.create({name: "screaming goats.png"});
      Asset.destroyAll({ajax: false});
      expect(spy).toHaveBeenCalledWith(asset, {ajax: false, clear: true});
    });

    it("can fire refresh events", function(){
      Asset.bind("refresh", spy);

      var values = JSON.stringify([]);
      Asset.refresh(values, {refresh: true, clear: true});
      expect(spy).toHaveBeenCalledWith([], {refresh: true, clear: true});

      var asset = Asset.create({name: "test.pdf"});
      var values = asset.toJSON();
      var tmpRecords = Asset.refresh(values, {clear: true});
      expect(spy).toHaveBeenCalledWith(tmpRecords, {clear: true});

      var asset1 = Asset.create({id: 1, name: "test.pdf"});
      var asset2 = Asset.create({id: 2, name: "wem.pdf"});
      var values = JSON.stringify([asset1, asset2]);
      var tmpRecords = Asset.refresh(values, {clear: true});
      expect(spy).toHaveBeenCalledWith(tmpRecords, {clear: true});
    });

    it("can fire events on record", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("save", spy);
      asset.save();
      expect(spy).toHaveBeenCalledWith(asset, {});
    });

    it("can fire change events on record", function(){
      Asset.bind("change", spy);

      var asset = Asset.create({name: "cartoon world.png"});
      expect(spy).toHaveBeenCalledWith(asset, "create", {});

      asset.save();
      expect(spy).toHaveBeenCalledWith(asset, "update", {});

      asset.destroy();
      expect(spy).toHaveBeenCalledWith(asset, "destroy", {clear: true});
    });

    it("can fire error events", function(){
      Asset.bind("error", spy);

      Asset.include({
        validate: function(){
          if ( !this.name )
            return "Name required";
        }
      });

      var asset = new Asset({name: ""});
      expect(asset.save()).toBeFalsy();
      expect(spy).toHaveBeenCalledWith(asset, "Name required");
    });

    it("should be able to bind once", function(){
      Asset.one("save", spy);

      var asset = new Asset({name: "cartoon world.png"});
      asset.save();

      expect(spy).toHaveBeenCalledWith(asset, {});
      spy.reset();

      asset.save();
      expect(spy).not.toHaveBeenCalled();
    });

    it("should be able to bind once on instance", function(){
      var asset = Asset.create({name: "cartoon world.png"});

      asset.one("save", spy);
      asset.save();

      expect(spy).toHaveBeenCalledWith(asset, {});
      spy.reset();

      asset.save();
      expect(spy).not.toHaveBeenCalled();
    });

    it("it should pass clones with events", function(){
      Asset.bind("create", function(asset){
        expect(Object.getPrototypeOf(asset)).not.toBe(Asset.prototype);
        expect(Object.getPrototypeOf(Object.getPrototypeOf(asset))).toBe(Asset.prototype);
      });

      Asset.bind("update", function(asset){
        expect(Object.getPrototypeOf(asset)).not.toBe(Asset.prototype);
        expect(Object.getPrototypeOf(Object.getPrototypeOf(asset))).toBe(Asset.prototype);
      });
      var asset = Asset.create({name: "cartoon world.png"});
      asset.updateAttributes({name: "lonely heart.png"});
    });

    it("should be able to unbind all instance events", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("save", spy);
      asset.unbind();
      asset.save();
      expect(spy).not.toHaveBeenCalled();
    });

    it("should be able to unbind individual instance events", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("save", spy);
      asset.bind("customEvent", spy);
      asset.unbind('save');
      asset.save();
      expect(spy).not.toHaveBeenCalled();
      asset.trigger('customEvent');
      expect(spy).toHaveBeenCalled();
    });

    it("should be able to unbind individual callbacks to individual instance events", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      var noop2 = {spy2: function(){}};
      spyOn(noop2, "spy2");
      var spy2 = noop2.spy2;
      asset.bind("customEvent", spy);
      asset.bind("customEvent", spy2);
      asset.trigger("customEvent");
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      spy.reset();
      spy2.reset();
      asset.unbind("customEvent", spy2);
      asset.trigger('customEvent');
      expect(spy).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });

    it("should be able to unbind a single event that uses a callback another event is bind to.", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("customEvent1 customEvent2", spy);
      asset.trigger("customEvent1");
      asset.trigger("customEvent2");
      expect(spy.calls.length).toEqual(2);
      spy.reset();
      asset.unbind("customEvent1");
      asset.trigger("customEvent1");
      asset.trigger("customEvent2");
      expect(spy.calls.length).toEqual(1);
    });

    it("should be able to bind and unbind multiple events with a single call.", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("customEvent1 customEvent2", spy)
      asset.trigger("customEvent1");
      asset.trigger("customEvent2");
      expect(spy.calls.length).toEqual(2);
      spy.reset();
      asset.unbind("customEvent1 customEvent2")
      asset.trigger("customEvent1");
      asset.trigger("customEvent2");
      expect(spy.calls.length).toEqual(0);
    });

    it("should be able to unbind all events if no arguments given", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("customEvent1 customEvent2", spy)
      asset.trigger("customEvent1");
      asset.trigger("customEvent2");
      expect(spy.calls.length).toEqual(2);
      spy.reset();
      asset.unbind();
      asset.trigger("customEvent1");
      asset.trigger("customEvent2");
      expect(spy.calls.length).toEqual(0);
    });

    it("should not be able to unbind all events if given and undefined object", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("customEvent1 customEvent2", spy)
      asset.trigger("customEvent1");
      asset.trigger("customEvent2");
      expect(spy.calls.length).toEqual(2);
      spy.reset();
      asset.unbind(undefined);
      asset.trigger("customEvent1");
      asset.trigger("customEvent2");
      expect(spy.calls.length).toEqual(2);
    });

    it("should not unbind class-level callbacks", function(){
      Asset.bind('customEvent1', spy);
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind('customEvent2', function() {});
      asset.trigger('unbind');
      Asset.trigger('customEvent1');
      expect(spy.calls.length).toEqual(1);
    });

    it("should unbind events on instance destroy", function(){
      var asset = Asset.create({name: "cartoon world.png"});
      asset.bind("save", spy);
      asset.destroy();
      asset.trigger("save", asset);
      expect(spy).not.toHaveBeenCalled();
    });

    it("callbacks should still work on ID changes", function(){
      var asset = Asset.create({name: "hotel california", id: "bar"});
      asset.bind("test", spy);
      asset.changeID("foo");
      asset = Asset.find("foo");
      asset.trigger("test", asset);
      expect(spy).toHaveBeenCalled();
    })
  });

  /*
    tests related to .listenTo(), .listenToOnce(), and .stopListening()
  */

  describe("When using event listener methods", function(){
    var spy, spy2, Asset, asset, asset2, asset3;

    beforeEach(function(){
      Asset = Spine.Model.sub();
      Asset.configure("Asset", "name");
      asset = Asset.create({name: "test.pdf"});
      asset2 = Asset.create({name: "scooby.pdf"});
      asset3 = Asset.create({name: "shaggy.pdf"});
      spy = jasmine.createSpy();
      spy2 = jasmine.createSpy();
    });

    it("can listen to one event on a model instance", function(){
      asset2.listenTo(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
    });

    it("wont listen to events of the same name on unlistened to model instances", function(){
      asset2.listenTo(asset, 'event1', spy);
      asset3.trigger("event1");
      asset2.trigger("evemt1")
      expect(spy).not.toHaveBeenCalled();
    });

    it("can listen to many events on a model instance", function(){
      asset2.listenTo(asset, 'event1 event2 event3', spy);
      asset.trigger("event1");
      asset.trigger("event2");
      asset.trigger("event3");
      expect(spy).toHaveBeenCalled();
      expect(spy.callCount).toBe(3);
    });

    it("can listen once for an event on a model instance", function(){
      asset2.listenToOnce(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
    });

    it("can stop listening to a specific event on a model instance while maintaining listeners on other events", function(){
      asset2.listenTo(asset, 'event1 event2 event3', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      asset2.stopListening(asset, 'event1');
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
      spy.reset();
      asset.trigger("event2");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      asset.trigger("event3");
      expect(spy).toHaveBeenCalled();
    });

    it("can stop listening to all events on a model instance", function(){
      asset2.listenTo(asset, 'event1 event2 event3', spy);
      asset.trigger("event2");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      asset2.stopListening(asset);
      asset.trigger("event1");
      asset.trigger("event2");
      asset.trigger("event3");
      expect(spy).not.toHaveBeenCalled();
    });

    it("can stop listening to events on a model instance, without canceling out other binders on that model instance", function(){
      Asset.bind('event1', spy2)
      asset2.listenTo(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      spy.reset();
      spy2.reset();
      asset2.stopListening(asset, 'event1');
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });


    it("can stop listening to all events on a model instance, those are being listened to once", function(){
      asset2.listenToOnce(asset, 'event1', spy);
      asset2.listenToOnce(asset, 'event2', spy);
      asset2.stopListening(asset);
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
      spy.reset();
      asset.trigger("event2");
      expect(spy).not.toHaveBeenCalled();
    });

    it("can stop listening to all events on a model instance if no arguments given", function(){
      asset2.listenTo(asset, 'event1', spy);
      asset2.listenToOnce(asset, 'event2', spy);
      asset2.stopListening();
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
      spy.reset();
      asset.trigger("event2");
      expect(spy).not.toHaveBeenCalled();
    });

    // this is the major benefit of the listeners. helps manage cleanup of obsolete binders

    it("will stop listening if the listener is destroyed", function(){
      asset2.listenTo(asset, 'event1', spy);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      asset2.destroy();
      asset.trigger("event1");
      expect(spy).not.toHaveBeenCalled();
    });

    it("should not stop listening to all events on model instance if given and undefined object", function(){
      asset2.listenTo(asset, 'event1', spy);
      asset2.listenToOnce(asset, 'event2', spy);
      asset2.stopListening(undefined);
      asset.trigger("event1");
      expect(spy).toHaveBeenCalled();
      spy.reset();
      asset.trigger("event2");
      expect(spy).toHaveBeenCalled();
    });
  });
});
