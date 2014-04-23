describe("Spine.Promise", function(){
  var promise;

  beforeEach(function(){
    promise = new Spine.Promise(function() {});
  });

  it("should return a 'thenable'", function(){
    expect(promise.then).toEqual(jasmine.any(Function));
  });

  describe("Spine.Promise.resolve", function(){
    var spy;

    beforeEach(function(){
      promise = new Spine.Promise.resolve('abc123');
      spy = jasmine.createSpy('onFulfilled');
    });

    it("should return a 'thenable'", function(){
      expect(promise.then).toEqual(jasmine.any(Function));
    });

    it("should execute success callbacks", function(){
      runs(function(){
        promise.then(spy);
      });

      waitsFor(function(){
        return spy.wasCalled;
      }, 50);

      runs(function(){
        expect(spy).toHaveBeenCalledWith('abc123');
      });

    });
  });

  describe("Spine.Promise.reject", function(){
    var spy;

    beforeEach(function(){
      promise = new Spine.Promise.reject('error');
      spy = jasmine.createSpy('onRejected');
    });

    it("should return a 'thenable'", function(){
      expect(promise.then).toEqual(jasmine.any(Function));
    });

    it("should execute failure callbacks", function(){
      runs(function(){
        promise.then(undefined, spy);
      });

      waitsFor(function(){
        return spy.wasCalled;
      }, 50);

      runs(function(){
        expect(spy).toHaveBeenCalledWith('error');
      });

    });
  });

});

