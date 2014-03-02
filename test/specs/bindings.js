describe('Bindings', function() {

  var TestController = Spine.Controller.sub({
    modelVar: 'tmodel',
    elements: { '.testValues': 'input' },
    bindings: {
      '.testValues': 'value'
    }
  });

  TestController.extend(Spine.Bindings);

  var TestModel = Spine.Model.sub({});
  TestModel.configure('TestModel', 'value');

  var controller = {};
  var model = {};

  function init(controller) {
    controller.applyBindings()
    controller.el.append($('<input class="testValues" value="init" type="hidden"/>'))
    controller.refreshElements();
    controller.el.appendTo($('body'))
  }

  beforeEach(function() {
    model = new TestModel({ value: 'init' });
    controller = new TestController({ tmodel: model });
    init(controller);
  });

  afterEach(function() {
    controller.release();
    TestModel.deleteAll();
  });

  it("changes element when model has changed", function() {
    model.value = 'changed';
    model.save();
    expect(controller.input.val()).toEqual(model.value);
  });

  it("changes model when element has changed", function() {
    controller.input.val('new test');
    controller.input.trigger('change');
    expect(model.value).toEqual('new test');
  });

  it("changes only model if model direction is specified", function() {
    TestController2 = TestController.sub({
      bindings: {
        '.testValues': {
          field: 'value',
          direction: 'model',
        }
      }
    });
    controller = new TestController2({ tmodel: model });
    init(controller);
    model.value = 'test';
    model.save()

    expect(controller.input.val()).toEqual('init');

    controller.input.val('change');
    controller.input.trigger('change');
    expect(model.value).toEqual('change');

  });

  it("changes only element if element direction is specified", function() {
    TestController3 = TestController.sub({
      bindings: {
        '.testValues': {
          field: 'value',
          direction: 'element',
        }
      }
    });
    controller = new TestController3({ tmodel: model });
    init(controller);
    model.value = 'test';
    model.save()

    expect(controller.input.val()).toEqual('test');

    controller.input.val('change');
    controller.input.trigger('change');
    expect(model.value).toEqual('test');
  });

  it("uses custom setter and getter if specified", function() {
    TestController4 = TestController.sub({
      bindings: {
        '.testValues': {
          field: 'value',
          setter: function(element, value) { element.val('set') },
          getter: function(element) { return 'got'; }
        }
      }
    });
    controller = new TestController4({ tmodel: model });
    init(controller);

    controller.input.trigger('change');
    expect(model.value).toEqual('got');

    model.value = 'test';
    model.save();
    expect(controller.input.val()).toEqual('set');
  });

  it("changes source model of bindings", function() {
    var md = new TestModel({ value: 'another test' });

    controller.changeBindingSource(md);
    expect(controller.input.val()).toEqual('another test');

    md.value = 'new test';
    md.save();
    expect(controller.input.val()).toEqual('new test');
    expect(model.value).toEqual('init');

    controller.input.val('new test 2');
    controller.input.trigger('change');
    expect(md.value).toEqual('new test 2');
    expect(model.value).toEqual('init');

    model.value = 'init2';
    model.save();
    expect(controller.input.val()).not.toEqual('init2');
  });

});
