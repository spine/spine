describe("Ajax", function(){
  var User;
  var defaultAjaxConfig = $.extend({}, Spine.Ajax.config);

  beforeEach(function(){
    Spine.Ajax.clearQueue();
    // reset default ajax config (tests might modify that)
    Spine.Ajax.config = $.extend({}, defaultAjaxConfig);

    User = Spine.Model.setup("User", ["first", "last"]);
    User.extend(Spine.Model.Ajax);

    jasmine.Ajax.install();
    spyOn(jQuery, "ajax").and.callThrough();
  });

  afterEach(function(){
    jasmine.Ajax.uninstall();
  });

  it("can GET a collection on fetch", function(){
    User.fetch();

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:     'json',
      processData:  false,
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      type:         'GET',
      url:          '/users',
      data:         undefined
    });
  });

  it("can use custom HTTP method to fetch a collection", function(){
    Spine.Ajax.config.loadMethod = 'POST'
    User.fetch();

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:     'json',
      processData:  false,
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      type:         'POST',
      url:          '/users',
      data:         undefined
    });
  });

  it("can GET a record on fetch", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    User.fetch({id: "IDD"});

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:     'json',
      processData:  false,
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      type:         'GET',
      url:          '/users/IDD',
      data:         undefined
    });
  });

  it("can use custom HTTP method to fetch a record", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    Spine.Ajax.config.loadMethod = 'POST'
    User.fetch({id: "IDD"});

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:     'json',
      processData:  false,
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      type:         'POST',
      url:          '/users/IDD',
      data:         undefined
    });
  });

  it("allows undeclared attributes from server", function(){
    User.refresh([{
      id: "12345",
      first: "Hans",
      last: "Zimmer",
      created_by: "spine_user",
      created_at: "2013-07-14T14:00:00-04:00",
      updated_at: "2013-07-14T14:00:00-04:00"
    }]);

    expect(User.first().created_by).toEqual("spine_user");
  });

  it("should send POST on create", function(){
    User.create({first: "Hans", last: "Zimmer", id: "IDD"});

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:     'json',
      processData:  false,
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      type:         'POST',
      contentType:  'application/json',
      url:          '/users',
      data:         '{"first":"Hans","last":"Zimmer","id":"IDD"}'
    });
  });

  it("shouldn't send extra PUT requests on create", function(){
    User.create({fist: "Hans", last: "Zimmer"});
    var serverAttrs = {fist: "Hans", last: "Zimmer", id: "server-uuid"};
    expect(jQuery.ajax.calls.count()).toEqual(1);
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });
    expect(jQuery.ajax.calls.count()).toEqual(1);
  });

  it("can use custom HTTP method to create a record", function(){
    Spine.Ajax.config.createMethod = 'PUT'
    User.create({first: "Hans", last: "Zimmer", id: "IDD"});

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'PUT',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      contentType:  'application/json',
      dataType:     'json',
      data:         '{"first":"Hans","last":"Zimmer","id":"IDD"}',
      url:          '/users',
      processData:  false
    });
  });

  it("should send PUT on update", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    User.first().updateAttributes({first: "John2", last: "Williams2"});

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'PUT',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      contentType:  'application/json',
      dataType:     'json',
      data:         '{"first":"John2","last":"Williams2","id":"IDD"}',
      url:          '/users/IDD',
      processData:  false
    });
  });

  it("can use custom HTTP method when updating record", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    Spine.Ajax.config.updateMethod = 'PATCH'
    User.first().updateAttributes({first: "John2", last: "Williams2"});

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'PATCH',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      contentType:  'application/json',
      dataType:     'json',
      data:         '{"first":"John2","last":"Williams2","id":"IDD"}',
      url:          '/users/IDD',
      processData:  false
    });
  });

  it("should send DELETE on destroy", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    User.first().destroy();

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:   'json',
      processData: false,
      headers:     { 'X-Requested-With' : 'XMLHttpRequest' },
      type:        'DELETE',
      url:         '/users/IDD',
      data:        undefined
    });
  });

  it("can use custom HTTP method to destroy record", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    Spine.Ajax.config.destroyMethod = 'POST'
    User.first().destroy();

    expect(jQuery.ajax).toHaveBeenCalledWith({
      headers:     { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:    'json',
      processData: false,
      type:        'POST',
      url:         '/users/IDD',
      data:        undefined
    });
  });

  it("should update record after PUT/POST", function(){
    User.create({first: "Hans", last: "Zimmer", id: "IDD"});

    var serverAttrs = {first: "Hans2", last: "Zimmer2", id: "IDD"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(User.first().attributes()).toEqual(serverAttrs);
  });

  it("should update record with undeclared attributes from server", function(){
    User.create({first: "Hans", last: "Zimmer"});

    var serverAttrs = {
      id: "12345",
      first: "Hans",
      last: "Zimmer",
      created_by: "spine_user",
      created_at: "2013-07-14T14:00:00-04:00",
      updated_at: "2013-07-14T14:00:00-04:00"
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(User.first().created_by).toEqual("spine_user");
  });

  it("should change record ID after PUT/POST", function(){
    User.create({id: "IDD"});

    var serverAttrs = {id: "IDD2"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    var first = User.first()
    expect(first.id).toEqual("IDD2");
    expect(User.irecords["IDD2"].id).toEqual(first.id);
  });

  it("can update record IDs for already queued requests", function(){
    u = User.create();
    u.first = "Todd";
    u.last = "Shaw";
    u.save();

    var serverAttrs = {id: "IDD"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    updateAjaxRequest = jQuery.ajax.calls.mostRecent().args[0]
    expect(updateAjaxRequest.url).toBe("/users/IDD")
  });

  it("should not recreate records after DELETE", function() {
    User.refresh([{first: "Phillip", last: "Fry", id: "MYID"}]);
    User.first().destroy();
    expect(User.count()).toEqual(0);

    var serverAttrs = {id: "MYID", name: "Phillip", last: "Fry"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(User.count()).toEqual(0);
  });

  it("should send requests serially", function(){
    User.create({first: "First"});
    expect(jQuery.ajax).toHaveBeenCalled();

    jQuery.ajax.calls.reset();
    User.create({first: "Second"});
    expect(jQuery.ajax).not.toHaveBeenCalled();

    var serverAttrs = {first: "Second"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(jQuery.ajax).toHaveBeenCalled();
  });

  it("should send GET requests in parallel by default", function() {
    User.fetch(1);
    expect(jQuery.ajax).toHaveBeenCalled();
    User.fetch(2);
    User.fetch(3);
    User.fetch(4);
    User.fetch(5);
    expect(jQuery.ajax.calls.count()).toEqual(5);
  });

  it("should be able to send GET requests serially", function() {
    User.fetch(1, {parallel:false});
    User.fetch(2, {parallel:false});
    User.fetch(3, {parallel:false});
    User.fetch(4, {parallel:false});
    User.fetch(5, {parallel:false});
    expect(jQuery.ajax.calls.count()).toEqual(1);
    jQuery.ajax.calls.reset();
  });

  it("should be able to send non GET requests in parallel", function() {
    User.create({first: "First"}, {parallel:true});
    User.create({first: "Second"}, {parallel:true});
    expect(jQuery.ajax.calls.count()).toEqual(2);
  });

  it("should return jquery promise objects", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    var user = User.find("IDD");
    var spy = jasmine.createSpy();
    user.ajax().update().done(spy);

    expect(spy).not.toHaveBeenCalled();

    var serverAttrs = {first: "Second"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(spy).toHaveBeenCalled();
  });

  it("should respect promises for parallel requests", function(){
    var user1 = User.create({first: "First"}, {parallel:true});
    var user2 = User.create({first: "Second"}, {parallel:true});

    expect(jQuery.ajax.calls.count()).toEqual(2);
  });

  it("should allow promise objects to abort the request and dequeue", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    var user = User.find("IDD");
    var spy = jasmine.createSpy();
    var promise = user.ajax().update();

    expect(Spine.Ajax.queue().length).toEqual(1);
    promise.fail(spy);
    promise.abort();

    expect(Spine.Ajax.queue().length).toEqual(0);
    expect(spy).toHaveBeenCalled();
  });

  it("should not replace AJAX results when dequeued", function() {
    User.refresh([], {clear: true});
    User.fetch();

    var serverAttrs = [{id: "IDD"}];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(User.exists("IDD")).toBeTruthy();
  });

  it("should have done callbacks for singleton requests", function(){
    var spy = jasmine.createSpy();
    User.create({first: "Second"}, {done: spy});

    var serverAttrs = {first: "Second"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(spy).toHaveBeenCalled();
    var settings = spy.calls.mostRecent().args[0]
    expect(settings).toBeDefined();
    expect(settings.type).toEqual("POST");
    expect(settings.data).toEqual(JSON.stringify(User.first()));
  });

  it("should have done callbacks for collection requests", function(){
    var spy = jasmine.createSpy();
    User.fetch(null, {done: spy});

    var serverAttrs = {first: "Second"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(spy).toHaveBeenCalled();
    var settings = spy.calls.mostRecent().args[0]
    expect(settings.type).toEqual("GET");
  });

  it("should trigger an 'ajaxSuccess' event", function(){
    var spy = jasmine.createSpy();
    var user = new User({first: "Adam"});
    user.on('ajaxSuccess', spy);
    user.save();

    expect(spy).not.toHaveBeenCalled();

    var serverAttrs = {first: "Adam"};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      responseText: JSON.stringify(serverAttrs)
    });

    expect(spy).toHaveBeenCalled();
    var settings = spy.calls.mostRecent().args[4]
    expect(settings.type).toEqual("POST");
    expect(settings.data).toEqual(JSON.stringify(user));
  });

  it("should have fail callbacks for singleton requests", function(){
    var spy = jasmine.createSpy();
    var user = User.create({first: "Second"}, {fail: spy});
    jasmine.Ajax.requests.mostRecent().respondWith({ status: 400 });
    expect(spy).toHaveBeenCalled();
    var settings = spy.calls.mostRecent().args[0]
    expect(settings.type).toEqual("POST");
    expect(settings.data).toEqual(JSON.stringify(user));
  });

  it("should have fail callbacks for collection requests", function(){
    var spy = jasmine.createSpy();
    User.fetch(null, {fail: spy});
    jasmine.Ajax.requests.mostRecent().respondWith({ status: 400 });
    expect(spy).toHaveBeenCalled();
    var settings = spy.calls.mostRecent().args[0]
    expect(settings.type).toEqual("GET");
  });

  it("should trigger an 'ajaxError' event", function(){
    var spy = jasmine.createSpy();
    var user = new User({first: "Adam"});
    user.on('ajaxError', spy);
    user.save();
    expect(spy).not.toHaveBeenCalled();
    jasmine.Ajax.requests.mostRecent().respondWith({status: 501});
    expect(spy).toHaveBeenCalled();
    var settings = spy.calls.mostRecent().args[4]
    expect(settings.type).toEqual("POST");
    expect(settings.data).toEqual(JSON.stringify(user));
  });

  it("removes new records from model storage if creation fails on the server", function(){
    var user = User.create({first: "Adam"});
    expect(User.count()).toEqual(1);
    jasmine.Ajax.requests.mostRecent().respondWith({status: 501});
    expect(User.count()).toEqual(0);
    expect(user.destroyed).toBeFalsy();
  });

  it("restores destroyed records in model storage if deletion fails on the server", function(){
    var user = User.create({first: "Adam"}, {ajax: false});
    user.destroy();
    expect(User.count()).toEqual(0);
    jasmine.Ajax.requests.mostRecent().respondWith({status: 501});
    expect(User.count()).toEqual(1);
    expect(user.destroyed).toBeFalsy();
  });

  it("can be disabled in method options", function() {
    User.create({first: "Second"}, {ajax: false});
    expect(jQuery.ajax).not.toHaveBeenCalled();
  });

  it("should expose the defaults object", function(){
    expect(Spine.Ajax.defaults).toBeDefined();
  });

  it("should not double stringify GET requests where data is a string", function(){
    User.fetch({ data : "shineyHappy=true" });

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:     'json',
      processData:  false,
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      type:         'GET',
      url:          '/users',
      data:         'shineyHappy=true',
    });
  });

  it("should not stringify data for GET requests where data is an object and `processData` is set to true", function(){
    User.fetch({ data : { shineyHappy : true }, processData : true });

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:     'json',
      processData:  true,
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      type:         'GET',
      data:         { shineyHappy : true },
      url:          '/users',
    });
  });

  it("should stringify data for POST requests where data gets passed as an object and processData is set as default (false)", function(){
    User.create({ first: 'Adam', id: '123' });

    expect(jQuery.ajax).toHaveBeenCalledWith({
      dataType:     'json',
      processData:  false,
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      type:         'POST',
      contentType:  'application/json',
      data:         '{"first":"Adam","id":"123"}',
      url:          '/users',
    });
  });

  it("can get a url property with optional host from a model and model instances", function(){
    User.url = "/people";
    expect(Spine.Ajax.getURL(User)).toBe('/people');

    var user = new User({id: 1});
    expect(user.url()).toBe('/people/1');
    expect(user.url('custom')).toBe('/people/1/custom');

    Spine.Model.host = 'http://example.com';
    expect(user.url()).toBe('http://example.com/people/1');
  });

  it("can override POST url with options on create", function(){
    User.create({ first: 'Adam', id: '123' }, { url: '/people' });

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'POST',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:     'json',
      data:         '{"first":"Adam","id":"123"}',
      contentType:  'application/json',
      url:          '/people',
      processData:  false
    });
  });

  it("can override GET url with options on fetch", function(){
    User.fetch({ url: '/people' });

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'GET',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:     'json',
      url:          '/people',
      processData:  false,
      data:         undefined
    });
  });

  it("can override PUT url with options on update", function(){
    user = User.create({ first: 'Adam', id: '123' }, { ajax: false });
    user.updateAttributes({ first: 'Odam' }, { url: '/people' });

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'PUT',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:     'json',
      data:         '{"first":"Odam","id":"123"}',
      contentType:  'application/json',
      url:          '/people',
      processData:  false
    });
  });

  it("can override DELETE url with options on destroy", function(){
    user = User.create({ first: 'Adam', id: '123' }, { ajax: false });
    user.destroy({ url: '/people' });

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'DELETE',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:     'json',
      url:          '/people',
      processData:  false,
      data:         undefined
    });
  });

  it("should have a url function", function(){
    Spine.Model.host = '';
    expect(User.url()).toBe('/users');
    expect(User.url('search')).toBe('/users/search');

    var user = new User({id: 1});
    expect(user.url()).toBe('/users/1');
    expect(user.url('custom')).toBe('/users/1/custom');

    Spine.Model.host = 'http://example.com';
    expect(User.url()).toBe('http://example.com/users');
    expect(user.url()).toBe('http://example.com/users/1');
  });

  it("can gather scope for the url from the model", function(){
    Spine.Model.host = '';
    User.scope = "admin";
    expect(User.url()).toBe('/admin/users');
    expect(User.url('custom')).toBe('/admin/users/custom');

    var user = new User({id: 1});
    expect(user.url()).toBe('/admin/users/1');

    User.scope = function() { return "/roots/1"; };
    expect(User.url()).toBe('/roots/1/users');
    expect(user.url()).toBe('/roots/1/users/1');
    expect(user.url('custom')).toBe('/roots/1/users/1/custom');

    Spine.Model.host = 'http://example.com';
    expect(User.url()).toBe('http://example.com/roots/1/users');
    expect(user.url()).toBe('http://example.com/roots/1/users/1');
  });

  it("can gather scope for the url from a model instance", function(){
    Spine.Model.host = '';

    expect(User.url()).toBe('/users');

    var user = new User({id: 1});
    user.scope = "admin";
    expect(user.url()).toBe('/admin/users/1');

    user.scope = function() { return "/roots/1"; };
    expect(User.url()).toBe('/users');
    expect(user.url()).toBe('/roots/1/users/1');
    expect(user.url('custom')).toBe('/roots/1/users/1/custom');

    Spine.Model.host = 'http://example.com';
    expect(User.url()).toBe('http://example.com/users');
    expect(user.url()).toBe('http://example.com/roots/1/users/1');
  });

  it("should allow the scope for url on model to be superseeded by an instance", function(){
    Spine.Model.host = '';
    User.scope = "admin";
    expect(User.url()).toBe('/admin/users');

    var user = new User({id: 1});
    expect(user.url()).toBe('/admin/users/1');

    user.scope = function() { return "/roots/1"; };
    expect(User.url()).toBe('/admin/users');
    expect(user.url()).toBe('/roots/1/users/1');

    Spine.Model.host = 'http://example.com';
    expect(User.url()).toBe('http://example.com/admin/users');
    expect(user.url()).toBe('http://example.com/roots/1/users/1');
  });

  it("should work with relative urls", function() {
    User.url = '../api/user';
    expect(Spine.Ajax.getURL(User)).toBe('../api/user');

    var user = new User({id: 1});
    expect(Spine.Ajax.getURL(user)).toBe('../api/user/1');
  });

  it("should get the collection url from the model instance", function(){
    Spine.Model.host = '';
    User.scope = "admin";
    var user = new User({id: 1});
    expect(Spine.Ajax.getCollectionURL(user)).toBe('/admin/users');

    user.scope = "/root";
    expect(Spine.Ajax.getCollectionURL(user)).toBe('/root/users');

    user.scope = function() { return "/roots/" + this.id; };
    expect(Spine.Ajax.getCollectionURL(user)).toBe('/roots/1/users');
  });

  it("should apply scope to all urls", function(){
    Spine.Model.host = ''
    User.scope = 'foobar'
    var user = new User({id: 1})
    expect(Spine.Ajax.getURL(User)).toBe('/foobar/users')
    expect(Spine.Ajax.getURL(user)).toBe('/foobar/users/1')

    user.url = 'foobaz'
    expect(Spine.Ajax.getURL(user)).toBe('/foobar/foobaz/1')
    expect(Spine.Ajax.getCollectionURL(user)).toBe('/foobar/foobaz')
  })

  it("should allow scope and url to be defined functions", function(){
    Spine.Model.host = ''
    User.scope = function(){
      return 'foo'
    }
    User.url = function(){
      return 'bar'
    }
    var user = new User({id: 1})
    expect(Spine.Ajax.getURL(User)).toBe('/foo/bar')
    expect(Spine.Ajax.getURL(user)).toBe('/foo/bar/1')
    delete User.scope
    User.url = User.getCollectionURL
  })

  it("should allow scope and url to be functions on model instance", function(){
    Spine.Model.host = ''
    var user = new User({id: 1})
    user.scope = function(){
      return 'one'
    }
    user.url = function(){
      return 'two'
    }
    expect(Spine.Ajax.getURL(user)).toBe('/one/two/1')
  })
});
