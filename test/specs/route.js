describe("Routing", function(){
  var Route = Spine.Route,
      RouteOptions = Route.options,
      spy;

  // http://coffeescript.org/#try:navigate%20%3D%20(args...)%20-%3E%0A%20%20newPath%20%3D%20undefined%0A%20%20%24.Deferred((dfd)%20-%3E%0A%20%20%20%20Route.one%20'change'%2C%20(route%2C%20path)%20-%3E%20newPath%20%3D%20path%0A%0A%20%20%20%20Route.navigate%20args...%0A%0A%20%20%20%20waitsFor(-%3E%20newPath%3F)%0A%20%20%20%20runs(-%3E%20dfd.resolveWith(null%2C%20newPath))%0A%20%20).promise()
  function navigate(){
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [],
        changed = false;

    return $.Deferred(function(dfd){
      Route.one('change', function(){changed = true;});

      Route.navigate.apply(Route, args);

      waitsFor(function(){return changed === true;});
      runs(function(){dfd.resolve();});
    }).promise();
  }

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


  describe("Without trigger", function(){

    beforeEach(function(){
      Route.setup({trigger: false});
      spy = jasmine.createSpy();
    });

    it("should not trigger before, navigate, or change", function(){
      Route.one('before', spy);
      Route.one('navigate', spy);
      Route.one('change', spy);
      Route.add('/foo', function(){});
      Route.path = '/';

      Route.navigate('/foo');

      waits(1000);
      runs(function(){
        expect(spy).not.toHaveBeenCalled();
        expect(Route.path).toBe('/foo');
      });
    });
  });


  describe("With shim", function(){

    beforeEach(function(){
      Route.setup({shim: true});
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
      Route.add('/foo');
      expect(Route.router.routes.length).toBe(1);
    });

    it("can add a bunch of routes", function(){
      Route.add({
        '/foo': function(){},
        '/bar': function(){}
      });
      expect(Route.router.routes.length).toBe(2);
    });

    it("can add regex route", function(){
      Route.add(/\/users\/(\d+)/);
      expect(Route.router.routes.length).toBe(1);
    });

    it("should trigger 'change' with matching routes", function(){
      var changed = 0;
      Route.one('change', function(){changed += 1;});
      Route.add('/foo', function(){});

      Route.navigate('/foo');

      waitsFor(function(){return changed > 0;});
      runs(function(){
        expect(changed).toBe(1);
      });
    });

    it("should trigger 'before' when a route matches", function () {
      var triggerBefore = false;
      var routePath     = '';
      Route.one('before', function (route) {
        triggerBefore = true;
        routePath     = route.path;
      });
      Route.add('/foo', function () {});

      Route.navigate('/foo');

      runs(function () {
        expect(triggerBefore).toBe(true);
        expect(routePath).toBe('/foo');
      });
    });

    it("can navigate to path", function(){
      Route.add('/users', function(){});

      navigate('/users').done(function(){
        expect(Route.path).toBe('/users');
      });
    });

    it("can navigate to a path split into several arguments", function(){
      Route.add('/users/1/2', function(){});

      navigate('/users', 1, 2).done(function(){
        expect(Route.path).toBe('/users/1/2');
      });
    });


    describe("When route changes happen", function(){

      beforeEach(function(){
        spy = jasmine.createSpy();
      });

      it("should trigger 'navigate' when navigating", function(){
        Route.one('navigate', spy);
        Route.add('/foo', function(){});

        Route.navigate('/foo');

        expect(spy).toHaveBeenCalled();
      });

      it("should not navigate to the same path as the current", function(){
        Route.one('navigate', spy);
        Route.add('/foo', function(){});
        Route.path = '/foo';

        Route.navigate('/foo');

        expect(spy).not.toHaveBeenCalled();
        expect(Route.path).toBe('/foo');
      });

      it("should call routes when navigating", function(){
        Route.add('/foo', spy);

        navigate('/foo').done(function(){
          expect(spy).toHaveBeenCalled();
        });
      });


      it("can call routes with params", function(){
        Route.add({'/users/:id/:id2': spy});

        navigate('/users/1/2').done(function(){
          expect(JSON.stringify(spy.mostRecentCall.args)).toBe(JSON.stringify([{
            trigger: true,
            history: false,
            shim: true,
            replace: false,
            redirect: false,
            match: ['/users/1/2', '1', '2'], id: '1', id2: '2'
          }]));
        });
      });

      it("can call routes with glob", function(){
        Route.add({'/page/*stuff': spy});

        navigate('/page/gah').done(function(){
          expect(JSON.stringify(spy.mostRecentCall.args)).toBe(JSON.stringify([{
            trigger: true,
            history: false,
            shim: true,
            replace: false,
            redirect: false,
            match: ['/page/gah', 'gah'], stuff: 'gah'
          }]));
        });
      });

      it("can override trigger behavior when navigating", function(){
        expect(Route.options.trigger).toBe(true);

        Route.one('change', spy);

        Route.add('/users', function(){});

        Route.navigate('/users', false);
        waits(50);
        runs(function(){
          expect(Route.options.trigger).toBe(true);
          expect(spy).not.toHaveBeenCalled();
        });
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

      expect('hashchange' in events).toBe(true);
    });

    it("should unbind", function(){
      Route.unbind();
      var events = $(window).data('events') || {};

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

      navigate('/users', 1).done(function(){
        expect(window.location.hash).toBe('#/users/1');
      });
    });

  });


  describe('With History API', function(){

    beforeEach(function(){
      Route.setup({history: true});
      spy = jasmine.createSpy();
    });

    afterEach(function(){
      setUrl();
    });

    it("should have bound 'popstate' event to window", function(){
      // $(window).data('events') was the way to get events before jquery 1.8
      var events = $(window).data('events') || $._data(window, 'events');

      expect('popstate' in events).toBe(true);
    });

    it("should unbind", function(){
      Route.unbind();
      var events = $(window).data('events') || {};

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
      navigate('/users/1').done(function(){
        expect(window.location.pathname).toBe('/users/1');
      });
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
      spy1 = jasmine.createSpy();
      spy2 = jasmine.createSpy();
      Route.setup();
      otherRoute = Route.create();
    });

    afterEach(function(){
     setUrl();
    });

    it("should match 1 route per router", function(){
      Route.add('/foo/bar', spy1);
      Route.add('/foo/baz', spy1);
      otherRoute.add('/foo/*glob', spy2);
      otherRoute.add('/foo/baz', spy2);
      navigate('/foo/bar').done(function(){
        expect(spy1).toHaveBeenCalled();
        expect(spy1.calls.length).toEqual(1);
        expect(spy2).toHaveBeenCalled();
        expect(spy2.calls.length).toEqual(1);
      });
    });

    it("should trigger 'change' with matching routes", function(){
      spy = jasmine.createSpy();
      Route.one('change', spy);
      Route.add('/foo/bar', spy1);
      otherRoute.add('/foo/*glob', spy2);
      navigate('/foo/bar').done(function(){
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith([
          otherRoute.routes[0],
          Route.router.routes[0]
        ], '/foo/bar');
      });
    });

    it("can destroy routers without affecting other routers", function(){
      Route.add('/foo/bar', spy1);
      otherRoute.add('/foo/bar', spy2);
      otherRoute.destroy();
      navigate('/foo/bar').done(function(){
        expect(spy1).toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
      });
    });

  });

});
