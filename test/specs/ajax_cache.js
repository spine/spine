describe("AjaxCache", function() {

  var params, url, data, User, jqXHR;

  beforeEach(function() {
    params = { text: 1, data: 'test', fn: function() {}, arr: [] }
    url = '/host?test';
    data = { test: 1, change: 'some test', arr: [1, 2] }
    Spine.Ajax.clearQueue();
    Spine.AjaxCache.cleanCache();

    User = Spine.Model.setup("User", ["first", "last"]);
    User.extend(Spine.Model.Ajax);
    User.extend(Spine.Model.AjaxCache);

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

  })

  it("exits", function() {
    expect(Spine.AjaxCache).toBeDefined();
  })

  it("can hash", function() {
    var time = new Date().getMilliseconds();
    expect(Spine.AjaxCache.hashf('sometest really long test')).toEqual('sometest really long test');
    expect((new Date().getMilliseconds()) - time).toBeLessThan(10);
  })

  it("creates valid key string", function() {
    expect(Spine.AjaxCache.createKeyString(url, params)).toEqual("/host?testtext=1data=test")
  })

  it("sends ajax request if no cache", function() {
    spyOn(jQuery, "ajax").andReturn(jqXHR);
    User.fetchCache();
    expect(jQuery.ajax).toHaveBeenCalled();
  })

  it("should return cache hit", function() {
    data = [{id: 8}, {id: 200}]
    dataTest = [{id: 8}, {id: 200}]
    spy = spyOn(jQuery, "ajax").andReturn(jqXHR);
    User.fetchCache();
    User.bind('ajaxSuccess', function(data) {
      expect(data).toEqual(dataTest);
    });
    jqXHR.resolve(data)
    User.fetchCache();
    expect(spy.callCount).toBe(1);
  })

  it("should make ajax call on after cache invalidations", function() {
    data = [{id: 8}, {id: 200}]
    dataTest = [{id: 8}, {id: 200}]
    spy = spyOn(jQuery, "ajax").andReturn(jqXHR);
    User.fetchCache();
    User.bind('ajaxSuccess', function(data) {
      expect(data).toEqual(dataTest);
    });
    jqXHR.resolve(data);
    User.fetchCache();
    User.invalidate();
    User.fetchCache();
    expect(spy.callCount).toBe(2);
  })

});