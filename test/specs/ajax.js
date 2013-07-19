describe("Ajax", function(){
  var User;
  var jqXHR;

  beforeEach(function(){
    Spine.Ajax.clearQueue();

    User = Spine.Model.setup("User", ["first", "last"]);
    User.extend(Spine.Model.Ajax);

    jqXHR = $.Deferred();

    $.extend(jqXHR, {
      readyState: 0,
      setRequestHeader: function() { return this; },
      getAllResponseHeaders: function() {},
      getResponseHeader: function() {},
      overrideMimeType: function() { return this; },
      abort: function() { this.reject(arguments); return this; },
      success: jqXHR.done,
      error: jqXHR.fail,
      complete: jqXHR.done
    });
  });

  it("can GET a collection on fetch", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.fetch();

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'GET',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:     'json',
      url:          '/users',
      processData:  false
    });
  });

  it("can GET a record on fetch", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);

    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.fetch({id: "IDD"});

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'GET',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:     'json',
      url:          '/users/IDD',
      processData:  false
    });
  });

  it("should send POST on create", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({first: "Hans", last: "Zimmer", id: "IDD"});

    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'POST',
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

    spyOn(jQuery, "ajax").andReturn(jqXHR);

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

  it("should send DELETE on destroy", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);

    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.first().destroy();

    expect(jQuery.ajax).toHaveBeenCalledWith({
      headers:     { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:   'json',
      processData: false,
      type:        'DELETE',
      url:         '/users/IDD'
    });
  });

  it("should update record after PUT/POST", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({first: "Hans", last: "Zimmer", id: "IDD"});

    var newAtts = {first: "Hans2", last: "Zimmer2", id: "IDD"};
    jqXHR.resolve(newAtts);

    expect(User.first().attributes()).toEqual(newAtts);
  });

  it("should change record ID after PUT/POST", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({id: "IDD"});

    var newAtts = {id: "IDD2"};
    jqXHR.resolve(newAtts);

    expect(User.first().id).toEqual("IDD2");
    expect(User.irecords["IDD2"]).toEqual(User.first());
  });

  it("can update record IDs for already queued requests", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    u = User.create();
    u.first = "Todd";
    u.last = "Shaw";
    u.save();

    var newAtts = {id: "IDD"};
    jqXHR.resolve(newAtts);


    updateAjaxRequest = jQuery.ajax.mostRecentCall.args[0]
    expect(updateAjaxRequest.url).toBe("/users/IDD")
  });

  it("should not recreate records after DELETE", function() {
    User.refresh([{first: "Phillip", last: "Fry", id: "MYID"}]);

    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.first().destroy();

    expect(User.count()).toEqual(0);
    jqXHR.resolve({id: "MYID", name: "Phillip", last: "Fry"});
    expect(User.count()).toEqual(0);
  });

  it("should send requests syncronously", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({first: "First"});

    expect(jQuery.ajax).toHaveBeenCalled();

    jQuery.ajax.reset();

    User.create({first: "Second"});

    expect(jQuery.ajax).not.toHaveBeenCalled();
    jqXHR.resolve();
    expect(jQuery.ajax).toHaveBeenCalled();
  });

  it("should return promise objects", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    var user = User.find("IDD");

    var noop = {spy: function(){}};
    spyOn(noop, "spy");
    var spy = noop.spy;

    user.ajax().update().done(spy);
    jqXHR.resolve();
    expect(spy).toHaveBeenCalled();
  });

  it("should allow promise objects to abort the request and dequeue", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
    var user = User.find("IDD");

    var noop = {spy: function(){}};
    spyOn(noop, "spy");
    var spy = noop.spy;

    user.ajax().update().fail(spy);
    expect(Spine.Ajax.queue().length).toEqual(1);

    jqXHR.abort();
    expect(Spine.Ajax.queue().length).toEqual(0);
    expect(spy).toHaveBeenCalled();
  });

  it("should not replace AJAX results when dequeue", function() {
    User.refresh([], {clear: true});

    spyOn(jQuery, "ajax").andReturn(jqXHR);
    jqXHR.resolve([{id: "IDD"}]);

    User.fetch();
    expect(User.exists("IDD")).toBeTruthy();
  });

  it("should have success callbacks", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    var noop = {spy: function(){}};
    spyOn(noop, "spy");
    var spy = noop.spy;

    User.create({first: "Second"}, {success: spy});
    jqXHR.resolve();
    expect(spy).toHaveBeenCalled();
  });

  it("should have error callbacks", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    var noop = {spy: function(){}};
    spyOn(noop, "spy");
    var spy = noop.spy;

    User.create({first: "Second"}, {error: spy});
    jqXHR.reject();
    expect(spy).toHaveBeenCalled();
  });

  it("should cancel ajax on change", function() {
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({first: "Second"}, {ajax: false});
    jqXHR.resolve();
    expect(jQuery.ajax).not.toHaveBeenCalled();
  });

  it("should expose the defaults object", function(){
    expect(Spine.Ajax.defaults).toBeDefined();
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
    spyOn(jQuery, "ajax").andReturn(jqXHR);

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
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.fetch({ url: '/people' });
    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'GET',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:     'json',
      url:          '/people',
      processData:  false
    });
  });

  it("can override PUT url with options on update", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

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
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    user = User.create({ first: 'Adam', id: '123' }, { ajax: false });
    user.destroy({ url: '/people' });
    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'DELETE',
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:     'json',
      url:          '/people',
      processData:  false
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
});
