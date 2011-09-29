Spine ?= require('spine')
$      = Spine.$

class Spine.Manager extends Spine.Module
  @include Spine.Events
  
  constructor: ->
    @controllers = []
    @add(arguments...)
    @bind 'change', @change
    
  add: (controllers...) ->
    @addOne(cont) for cont in controllers
    
  addOne: (controller) ->    
    controller.bind 'active', (args...) =>
      @trigger('change', controller, args)
    controller.bind 'destroy', =>
      @controllers.splice(@controllers.indexOf(controller), 1)

    @controllers.push(controller)
      
  deactivate: ->
    @trigger('change', false, arguments)
    
  # Private
    
  change: (current, args) ->
    for cont in @controllers
      if cont is current
        cont.activate(args...)
      else
        cont.deactivate(args...)

Spine.Controller.include
  active: (args...) ->
    if typeof args[0] is 'function'
      @bind('active', args[0])
    else
      args.unshift('active')
      @trigger(args...)
    @
  
  isActive: ->
    @el.hasClass('active')
  
  activate: ->
    @el.addClass('active')
    @
  
  deactivate: ->
    @el.removeClass('active');
    @
    
module?.exports = Spine.Manager