Spine = @Spine or require('spine')
$     = Spine.$


class Spine.Manager extends Spine.Module
  @include Spine.Events

  constructor: ->
    @controllers = []
    @on 'change', @change
    @add(arguments...)

  add: (controllers...) ->
    @addOne(cont) for cont in controllers

  addOne: (controller) ->
    controller.on 'active', (args...) =>
      @trigger('change', controller, args...)
    controller.on 'release', =>
      @controllers = (c for c in @controllers when c isnt controller)

    @controllers.push(controller)

  deactivate: ->
    @trigger('change', false, arguments...)

  # Private

  change: (current, args...) ->
    for cont in @controllers when cont isnt current
      cont.deactivate(args...)

    current.activate(args...) if current


Spine.Controller.include
  active: (args...) ->
    if typeof args[0] is 'function'
      @on('active', args[0])
    else
      args.unshift('active')
      @trigger(args...)
    @

  isActive: ->
    @el.hasClass('active')

  activate: ->
    @el.addClass('active')
    this

  deactivate: ->
    @el.removeClass('active')
    this


class Spine.Stack extends Spine.Controller
  @controllers = []
  controllers: {}
  routes: {}

  className: 'spine stack'

  constructor: ->
    super

    @manager = new Spine.Manager
    @router  = Spine.Route?.create()

    for key, value of @controllers
      throw Error "'@#{ key }' already assigned" if @[key]?
      @[key] = new value(stack: this)
      @add(@[key])

    for key, value of @routes
      do (key, value) =>
        callback = value if typeof value is 'function'
        callback or= => @[value].active(arguments...)
        @route(key, callback)

    @[@default].active() if @default

    for name, cont of @manager.controllers
      for stack_cont of Stack.controllers
        if cont.el.find stack_cont.el
          stack_cont.active cont.active

    Stack.controllers = Array.prototype.push.apply(Stack.controllers, @manager.controllers)

  add: (controller) ->
    @manager.add(controller)
    @append(controller)

  release: =>
    @router?.destroy()
    super


module?.exports       = Spine.Manager
module?.exports.Stack = Spine.Stack
