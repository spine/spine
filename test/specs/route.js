describe("Routing", function () {
  var Route = Spine.Route,
      RouteOptions = Route.options,
      spy;

  // http://coffeescript.org/#try:navigate%20%3D%20(args...)%20-%3E%0A%20%20newPath%20%3D%20undefined%0A%20%20%24.Deferred((dfd)%20-%3E%0A%20%20%20%20Route.one%20'change'%2C%20(route%2C%20path)%20-%3E%20newPath%20%3D%20path%0A%0A%20%20%20%20Route.navigate%20args...%0A%0A%20%20%20%20waitsFor(-%3E%20newPath%3F)%0A%20%20%20%20runs(-%3E%20dfd.resolveWith(null%2C%20newPath))%0A%20%20).promise()
  function navigate() {
    var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [],
        changed = false;

    return $.Deferred(function(dfd) {
      Route.one('change', function() {changed = true;});

      Route.navigate.apply(Route, args);

      waitsFor(function() {return changed === true;});
      runs(function () {dfd.resolve()});
    }).promise();
  };

  // Set (default Reset) document's URL
  var setUrl = (function () {
    var originalTitle,
        originalPath = window.location.pathname + window.location.search;

    return function (url) {
      window.history.replaceState(null, originalTitle, url || originalPath);
    };
  }());

  beforeEach(function () {
    Route.options = RouteOptions; // Reset default Route options
  });

  afterEach(function () {
    Route.unbind();
    Route.routes = [];
    delete Route.path;
  });


  it("should have default options", function () {
    expect(Route.options).toEqual({
      trigger: true,
      history: false,
      shim: false,
      replace: false
    });
  });

  it("should clear route set in controller if controller released", function() {
    var Users = Spine.Controller.sub();
    var users = new Users;
    var callback = jasmine.createSpy('callback');

    users.route('/test', callback);

    Spine.Route.navigate('/test');
    expect(callback).toHaveBeenCalled();

    users.release();
    callback.reset();

    Spine.Route.navigate('/test');
    expect(callback).not.toHaveBeenCalled();
  })

  it("can get the host", function() {
    host = Route.getHost();
    expect(host).not.toBeNull();
    //console.log('result of getHost()', host)
  });


  describe('With shim', function () {
    beforeEach(function () {
      Route.setup({shim: true});
    });

    it("should not have bound any hashchange|popstate event to window", function () {
      var events = $(window).data('events') || {};
      expect('hashchange' in events || 'popstate' in events).toBe(false);
    });

    it("can set its path", function () {
      expect(Route.path).toBeUndefined()
      Route.change();

      // Don't check the path is valid but just set to something -> check this for hashes and history
      expect(Route.path).toBeDefined();
    });

    it("can add a single route", function () {
      Route.add('/foo');
      expect(Route.routes.length).toBe(1);
    });

    it("can add a bunch of routes", function () {
      Route.add({
        '/foo': function () {},
        '/bar': function () {}
      });
      expect(Route.routes.length).toBe(2);
    });

    it("can add regex route", function () {
      Route.add(/\/users\/(\d+)/);
      expect(Route.routes.length).toBe(1);
    });

    it("should trigger 'change' when a route matches", function () {
      var changed = 0;
      Route.one('change', function () {changed += 1;});
      Route.add("/foo", function () {});

      Route.navigate('/foo');

      waitsFor(function () {return changed > 0;})
      runs(function () {
        expect(changed).toBe(1);
      })
    });

    it("can navigate to path", function () {
      Route.add("/users", function () {});

      navigate("/users").done(function () {
        expect(Route.path).toBe("/users");
      });
    });

    it("can navigate to a path splitted into several arguments", function () {
      Route.add("/users/1/2", function () {});

      navigate("/users", 1, 2).done(function () {
        expect(Route.path).toBe("/users/1/2");
      });
    });

    describe('When route changes happen', function () {
      beforeEach(function () {
        var noop = {spy: function () {}};
        spyOn(noop, "spy");
        spy = noop.spy;
      });

      it("should trigger 'navigate' when navigating", function () {
        Route.one('navigate', spy);
        Route.add("/foo", function () {});

        Route.navigate('/foo');

        expect(spy).toHaveBeenCalled();
      });

      it("should not navigate to the same path as the current", function () {
        Route.one('navigate', spy);
        Route.add("/foo", function () {});
        Route.path = '/foo';

        Route.navigate('/foo');

        expect(spy).not.toHaveBeenCalled();
        expect(Route.path).toBe('/foo');
      });


      it("should call routes when navigating", function () {
        Route.add("/foo", spy);

        navigate('/foo').done(function () {
          expect(spy).toHaveBeenCalled();
        });
      });


      it("can call routes with params", function () {
        Route.add({"/users/:id/:id2": spy});

        navigate('/users/1/2').done(function () {
          expect(JSON.stringify(spy.mostRecentCall.args)).toBe(JSON.stringify([{
            trigger: true,
            history: false,
            shim: true,
            replace: false,
            match: ["/users/1/2", "1", "2"], id: "1", id2: "2"
          }]));
        });
      });

      it("can call routes with glob", function () {
        Route.add({"/page/*stuff": spy});

        navigate("/page/gah").done(function () {
          expect(JSON.stringify(spy.mostRecentCall.args)).toBe(JSON.stringify([{
            trigger: true,
            history: false,
            shim: true,
            replace: false,
            match: ["/page/gah", "gah"], stuff: "gah"
          }]));
        });
      });

      it("can override trigger behavior when navigating", function () {
        expect(Route.options.trigger).toBe(true);

        Route.one('change', spy)

        Route.add("/users", function () {});

        Route.navigate('/users', false);
        waits(50);
        runs(function () {
          expect(Route.options.trigger).toBe(true);
          expect(spy).not.toHaveBeenCalled();
        });
      });
    });
  });


  describe('With hashes', function () {
    beforeEach(function () {
      Route.setup();
    });

    afterEach(function () {
      setUrl();
    });


    it("should have bound 'hashchange' event to window", function () {
      // $(window).data('events') was the way to get events before jquery 1.8
      var events = $(window).data('events') || $._data(window, "events");

      expect('hashchange' in events).toBe(true);
    });

    it("should unbind", function () {
      Route.unbind();
      var events = $(window).data('events') || {};

      expect('hashchange' in events).toBe(false);
    });

    it("can get a path", function () {
      // not checking weather the path is correct, just that it is something...
      expect(Route.getPath()).toBeDefined();
    });

    it("can set its path", function () {
      delete Route.path // Remove path which has been set by @setup > @change

      window.location.hash = "#/foo"
      Route.change();

      expect(Route.path).toBe('/foo');
    });

    it("can navigate", function () {
      Route.add("/users/1", function () {});

      navigate("/users", 1).done(function () {
        expect(window.location.hash).toBe("#/users/1");
      });
    });

  });


  describe('With History API', function () {
    beforeEach(function () {
      Route.setup({history: true});
    });

    afterEach(function () {
      setUrl();
    });


    it("should have bound 'popstate' event to window", function () {
      // $(window).data('events') was the way to get events before jquery 1.8
      var events = $(window).data('events') || $._data(window, "events");

      expect('popstate' in events).toBe(true);
    });

    it("should unbind", function () {
      Route.unbind();
      var events = $(window).data('events') || {};

      expect('popstate' in events).toBe(false);
    });

    it("can get a path", function () {
      // not checking weather the path is correct, just that it is something...
      expect(Route.getPath()).toBeDefined();
    });

    it("can set its path", function () {
      delete Route.path // Remove path which has been set by @setup > @change

      setUrl('/foo');
      Route.change();
      expect(Route.path).toBe('/foo');
    });

    it("can navigate", function () {
      Route.add("/users/1", function () {});
      navigate("/users/1").done(function () {
        expect(window.location.pathname).toBe("/users/1");
      });
    });
  });
});
