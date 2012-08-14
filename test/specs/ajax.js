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
      contentType:  'application/json',
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
      contentType:  'application/json',
      dataType:     'json',
      url:          '/users/IDD',
      processData:  false
    });
  });

  it("can send POST on create", function(){
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

  it("can send PUT on update", function(){
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

  it("can send DELETE on destroy", function(){
    User.refresh([{first: "John", last: "Williams", id: "IDD"}]);

    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.first().destroy();

    expect(jQuery.ajax).toHaveBeenCalledWith({
      contentType: 'application/json',
      headers:     { 'X-Requested-With' : 'XMLHttpRequest' },
      dataType:   'json',
      processData: false,
      type:        'DELETE',
      url:         '/users/IDD'
    })
  });

  it("can update record after PUT/POST", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({first: "Hans", last: "Zimmer", id: "IDD"});

    var newAtts = {first: "Hans2", last: "Zimmer2", id: "IDD"};
    jqXHR.resolve(newAtts);

    expect(User.first().attributes()).toEqual(newAtts);
  });

  it("can change record ID after PUT/POST", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({id: "IDD"});

    var newAtts = {id: "IDD2"};
    jqXHR.resolve(newAtts);

    expect(User.first().id).toEqual("IDD2");
    expect(User.records["IDD2"]).toEqual(User.first());
  });

  it("should send requests syncronously", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({first: "First"});

    expect(jQuery.ajax).toHaveBeenCalled();

    jQuery.ajax.reset()

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

  it("can cancel ajax on change", function() {
    spyOn(jQuery, "ajax").andReturn(jqXHR);

    User.create({first: "Second"}, {ajax: false});
    jqXHR.resolve();
    expect(jQuery.ajax).not.toHaveBeenCalled();
  });

  it("should expose the defaults object", function(){
    expect(Spine.Ajax.defaults).toBeDefined();
  });

  it("should have a url function", function(){
    expect(User.url()).toBe('/users');
    expect(User.url('search')).toBe('/users/search');

    var user = new User({id: 1});
    expect(user.url()).toBe('/users/1');
    expect(user.url('custom')).toBe('/users/1/custom');

    Spine.Model.host = 'http://example.com';
    expect(User.url()).toBe('http://example.com/users');
    expect(user.url()).toBe('http://example.com/users/1');
  });

});