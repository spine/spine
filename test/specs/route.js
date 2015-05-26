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
  });

  afterEach(function(){
    Route.unbind();
    Route.routers = [];
    Route.router = new Route();
    delete Route.path;
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

    beforeEach(function(){
      Route.setup({trigger: false});
    });

    it("should not trigger before, navigate, or change", function(){
      var triggerspy = jasmine.createSpy('triggerspy');
      Route.add('/foobe');
      expect(Route.router.routes.length).toBe(1);

      Route.one('before', triggerspy);
      Route.one('navigate', triggerspy);
      Route.one('change', triggerspy);
      Route.path = '/';

      expect(Route.path).toBe('/');
      expect(triggerspy).not.toHaveBeenCalled();

      Route.navigate('/foobe'); // since trigger isn't used nothing async should be happening

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
        routeSpy = jasmine.createSpy('routeSpy');
      });

      it("should trigger 'navigate' when navigating", function(){
        Route.one('navigate', routeSpy);
        Route.navigate('/foo');
        expect(routeSpy).toHaveBeenCalled();
      });

      it("should not navigate to the same path as the current", function(){
        Route.one('navigate', routeSpy);
        Route.path = '/foo';

        Route.navigate('/foo');

        expect(routeSpy).not.toHaveBeenCalled();
        expect(Route.path).toBe('/foo');
      });

      it("should call routes when navigating", function(done){

        Route.add('/fool', function(){
          expect(Route.path).toBe('/fool');
          done();
        });
        Route.navigate('/fool');
      });


      it("can call routes with params", function(){
        var spy = jasmine.createSpy();
        Route.add({'/users/:id/:id2': spy});
        Route.navigate('/users/1/2');

        expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
          trigger: true,
          history: false,
          shim: true,
          replace: false,
          redirect: false,
          match: jasmine.arrayContaining(['/users/1/2', '1', '2']),
          id: '1',
          id2: '2'
        }));
      });

      it("can call routes with glob", function(){
        var spy = jasmine.createSpy();
        Route.add({'/page/*stuff': spy});
        Route.navigate('/page/gah');

        expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
          trigger: true,
          history: false,
          shim: true,
          replace: false,
          redirect: false,
          match: jasmine.arrayContaining(['/page/gah', 'gah']),
          stuff: 'gah'
        }));
      });

      it("can override trigger behavior when navigating", function(){
        expect(Route.options.trigger).toBe(true);
        Route.one('change', routeSpy);
        Route.add({'/losers': routeSpy});
        //Route.add({'/losers': function(){
        //  expect(arguments[0].trigger).toBe(true);
        //  expect(Route.options.trigger).toBe(true);
        //  expect(routeSpy).not.toHaveBeenCalled();
        //  console.log(arguments, 'done');
        //  done();
        //}});
        Route.navigate('/losers', false);
        expect(routeSpy).not.toHaveBeenCalled();
        expect(Route.options.trigger).toBe(true);
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
      //var events = $(window).data('events') || $._data(window, 'events');
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
      //var events = $(window).data('events') || $._data(window, 'events');
      var events = $(window).data('events') || {};

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
    var spy1, spy2

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

      setTimeout(function() {
        expect(spy1).toHaveBeenCalled();
        expect(spy1.calls.count()).toEqual(1);
        expect(spy2).toHaveBeenCalled();
        expect(spy2.calls.count()).toEqual(1);
        done();
      }, 40);

    });

    it("should trigger 'change' with matching routes", function(done){
      spy = jasmine.createSpy('changeSpy');
      Route.one('change', spy);
      Route.add('/foo/bar', spy1);
      otherRoute.add('/foo/*glob', spy2);
      Route.navigate('/foo/bar');

      setTimeout(function() {
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(
          [
            otherRoute.routes[0],
            Route.router.routes[0]
          ],
          '/foo/bar'
        );
        done();
      }, 40);
    });

    it("can destroy routers without affecting other routers", function(done){
      Route.add('/foo/bar', spy1);
      otherRoute.add('/foo/bar', spy2);
      otherRoute.destroy();
      Route.navigate('/foo/bar');

      setTimeout(function() {
        expect(spy1).toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
        done();
      }, 40);
    });

  });

});
