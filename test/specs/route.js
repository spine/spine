describe("Routing", function(){
  var Route = Spine.Route,
      RouteOptions = Route.options,
      spy;
      
  // Set (default Reset) document's URL
  var setUrl = (function(){
    var originalTitle,
        originalPath = window.location.pathname + window.location.search;

    return function(url){
      window.history.replaceState(null, originalTitle, url || originalPath);
    };
  }());

  beforeEach(function(){
    Route.options = RouteOptions; // Reset default Route options
    Route.unbind();
    Route.routers = [];
    Route.router = new Route();
    delete Route.path;
  });

  afterEach(function(){
  });

  it("should have default options", function(){
    expect(Route.options).toEqual({
      trigger: true,
      history: false,
      shim: false,
      replace: false,
      redirect: false
    });
  });

  it("can get the host", function(){
    host = Route.getHost();
    expect(host).not.toBeNull();
    //console.log('result of getHost()', host)
  });


  describe("With trigger disabled", function(){
     var routeSpy;

    beforeEach(function(){
      Route.setup({trigger: false});
      routeSpy = {
        go: function(done){
          done();
        }
      }
      spyOn(routeSpy, 'go').and.callThrough();
    });
    
    //afterEach(function(){
    //  setUrl();
    //});

    it("should not trigger before, navigate, or change", function(done){
      var triggerspy = jasmine.createSpy('triggerspy');
      Route.add('/foobe', routeSpy.go(done));

      Route.one('before', triggerspy);
      Route.one('navigate', triggerspy);
      Route.one('change', triggerspy);
      Route.path = '/';
      Route.navigate('/foobe');

      expect(Route.router.routes.length).toBe(1);

      expect(triggerspy).not.toHaveBeenCalled();
      expect(Route.path).toBe('/');

      expect(triggerspy).not.toHaveBeenCalled();
      expect(Route.path).toBe('/foobe');
    });

  });

  describe("With shim", function(){

    beforeEach(function(){
      Route.setup({shim: true});
      Route.add({
        '/users': function(){},
        '/foo': function(){}
      });
      expect(Route.router.routes.length).toBe(2);
    });

    it("should not have bound any hashchange|popstate event to window", function(){
      var events = $(window).data('events') || {};
      expect('hashchange' in events || 'popstate' in events).toBe(false);
    });

    it("can set its path", function(){
      expect(Route.path).toBeUndefined();
      Route.change();

      // Don't check the path is valid but just set to something -> check this for hashes and history
      expect(Route.path).toBeDefined();
    });

    it("can add a single route", function(){
      Route.add('/wamp');
      expect(Route.router.routes.length).toBe(3);
    });

    it("can add a bunch of routes", function(){
      Route.add({
        '/wamp': function(){},
        '/womp': function(){}
      });
      expect(Route.router.routes.length).toBe(4);
    });

    it("can add regex route", function(){
      Route.add(/\/hosers\/(\d+)/);
      expect(Route.router.routes.length).toBe(3);
    });

    it("should trigger 'change' with matching routes", function(){
      var changed = 0;
      Route.one('change', function(){
          changed += 1;
          //done();
        }
      );
      Route.navigate('/foo');

      expect(changed).toBeGreaterThan(0);
      expect(changed).toBe(1);
    });

    it("should trigger 'before' when a route matches", function () {
      var triggerBefore = false;
      var routePath     = '';
      Route.one('before', function (route) {
        triggerBefore = true;
        routePath     = route.path;
      });

      Route.navigate('/foo');
      expect(triggerBefore).toBe(true);
      expect(routePath).toBe('/foo');
    });

    it("can navigate to path", function(){
      Route.add('/users');
      Route.navigate('/users');

      expect(Route.path).toBe('/users');
    });

    it("can navigate to a path split into several arguments", function(){
      Route.add('/users/1/2', function(){});
      Route.navigate('/users', 1, 2);
      //done();
      expect(Route.path).toBe('/users/1/2');
    });


    describe("When route changes happen", function(){
      var routeSpy;

      beforeEach(function(){
        routeSpy = {
          go: function(done){
            done();
          }
        }
        spyOn(routeSpy, 'go').and.callThrough();
      })

      it("should trigger 'navigate' when navigating", function(done){
        Route.one('navigate', routeSpy.go(done));
        Route.navigate('/foo');
        expect(routeSpy.go).toHaveBeenCalled();
      });

      it("should not navigate to the same path as the current", function(done){
        Route.one('navigate', routeSpy.go(done));
        Route.path = '/foo';

        Route.navigate('/foo');

        expect(routeSpy.go).not.toHaveBeenCalled();
        expect(Route.path).toBe('/foo');
      });

      it("should call routes when navigating", function(done){
        Route.add('/foo', routeSpy.go(done));
        Route.navigate('/foo');
        done();
        expect(routeSpy.go).toHaveBeenCalled();
      });


      it("can call routes with params", function(done){
        Route.add({'/users/:id/:id2': routeSpy.go(done)});
        Route.navigate('/users/1/2');

        expect(routeSpy.go.calls.mostRecent().args).toEqual(jasmine.objectContaining([{
          trigger: true,
          history: false,
          shim: true,
          replace: false,
          redirect: false,
          match: ['/users/1/2', '1', '2'], id: '1', id2: '2'
        }]));
      });

      it("can call routes with glob", function(done){
        Route.add({'/page/*stuff': routeSpy.go(done)});
        Route.navigate('/page/gah');
        expect(routeSpy.go.calls.mostRecent().args).toEqual(jasmine.objectContaining([{
          trigger: true,
          history: false,
          shim: true,
          replace: false,
          redirect: false,
          match: ['/page/gah', 'gah'], stuff: 'gah'
        }]));
      });

      it("can override trigger behavior when navigating", function(done){
        expect(Route.options.trigger).toBe(true);
        Route.one('change', routeSpy.go(done));

        Route.navigate('/users', false);
        expect(Route.options.trigger).toBe(true);
        expect(routeSpy.go).not.toHaveBeenCalled();
      });

    });

  });


  describe("With hashes", function(){

    beforeEach(function(){
      Route.setup();
    });

    afterEach(function(){
      setUrl();
    });

    it("should have bound 'hashchange' event to window", function(){
      // $(window).data('events') was the way to get events before jquery 1.8
      var events = $(window).data('events') || $._data(window, 'events');
      console.log(events)
      expect(events).toBeDefined();
      expect('hashchange' in events).toBe(true);
    });

    it("should unbind", function(){
      Route.unbind();
      var events = $(window).data('events') || {};

      expect(events).toBeDefined();
      expect('hashchange' in events).toBe(false);
    });

    it("can get a path", function(){
      // not checking weather the path is correct, just that it is something...
      expect(Route.getPath()).toBeDefined();
    });

    it("can set its path", function(){
      delete Route.path; // Remove path which has been set by @setup > @change

      window.location.hash = '#/foo';
      Route.change();

      expect(Route.path).toBe('/foo');
    });

    it("can navigate", function(){
      Route.add('/users/1', function(){});
      Route.navigate('/users/1');
      
      console.log(Route.path);
      expect(window.location.hash).toBe('#/users/1');
    });

  });


  describe('With History API', function(){

    beforeEach(function(){
      Route.setup({history: true});
      spy = jasmine.createSpy('historyRouteSpy');
    });

    afterEach(function(){
      setUrl();
    });

    it("should have bound 'popstate' event to window", function(){
      // $(window).data('events') was the way to get events before jquery 1.8
      var events = $(window).data('events') || $._data(window, 'events');

      expect(events).toBeDefined();
      expect('popstate' in events).toBe(true);
    });

    it("should unbind", function(){
      Route.unbind();
      var events = $(window).data('events') || $._data(window, 'events');

      expect(events).toBeDefined();
      expect('popstate' in events).toBe(false);
    });

    it("should unbind single listeners", function(){
      Route.bind('navigate', spy);
      Route.unbind('navigate', spy);

      // make sure our listener got unbound
      Route.trigger('navigate');
      expect(spy).not.toHaveBeenCalled();

      // make sure popstate didn't get unbound
      var events = $(window).data('events') || $._data(window, 'events');
      expect(events).toBeDefined();
      expect('popstate' in events).toBe(true);
    });

    it("can get a path", function(){
      // not checking weather the path is correct, just that it is something...
      expect(Route.getPath()).toBeDefined();
    });

    it("can set its path", function(){
      delete Route.path; // Remove path which has been set by @setup > @change

      setUrl('/foo');
      Route.change();
      expect(Route.path).toBe('/foo');
    });

    it("can navigate", function(){
      Route.add('/users/1', function(){});
      Route.navigate('/users/1');
      
      expect(window.location.pathname).toBe('/users/1');
    });

  });


  describe("With Redirect", function(){

    afterEach(function(){
      setUrl();
    });

    it("when true bubbles unmatched routes to the browser", function(){
      Route.setup({redirect: true});
      spyOn(Route, 'redirect');
      Route.navigate('/unmatched');
      expect(Route.redirect).toHaveBeenCalledWith('/unmatched');
    });

    it("when function will apply function with path and options arguments", function(){
      var calledCount = 0;
      var callback =  function(path, options){
        calledCount++;
        return [path, options.testing];
      };
      Route.setup({redirect: callback});
      //spyOn(callback);
      var options = {'testing': 123};
      var unmatchedResult = Route.navigate('/unmatched', options);
      //expect(callback).toHaveBeenCalled();
      expect(calledCount).toBe(1);
      expect(unmatchedResult).toEqual(['/unmatched', options.testing]);
    });

  });


  describe("With multiple Routes", function(){

    beforeEach(function(){
      spy1 = jasmine.createSpy('spy1');
      spy2 = jasmine.createSpy('spy2');
      Route.setup();
      otherRoute = Route.create();
    });

    afterEach(function(){
     setUrl();
    });

    it("should match 1 route per router", function(done){
      Route.add('/foo/bar', spy1);
      Route.add('/foo/baz', spy1);
      otherRoute.add('/foo/*glob', spy2);
      otherRoute.add('/foo/baz', spy2);
      Route.navigate('/foo/bar');
      done();

      expect(spy1).toHaveBeenCalled();
      expect(spy1.calls.count()).toEqual(1);
      expect(spy2).toHaveBeenCalled();
      expect(spy2.calls.count()).toEqual(1);
    });

    it("should trigger 'change' with matching routes", function(done){
      spy = jasmine.createSpy();
      Route.one('change', spy);
      Route.add('/foo/bar', spy1);
      otherRoute.add('/foo/*glob', spy2);
      Route.navigate('/foo/bar');
      done();
      
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(
        [
          otherRoute.routes[0],
          Route.router.routes[0]
        ],
        '/foo/bar'
      );
    });

    it("can destroy routers without affecting other routers", function(done){
      Route.add('/foo/bar', spy1);
      otherRoute.add('/foo/bar', spy2);
      otherRoute.destroy();
      Route.navigate('/foo/bar');
      done();
      
      expect(spy1).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });

  });

});
