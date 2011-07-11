# A Manager is basically a state machine that controls a set of controller's 'active' state.
# In other words, you feed a manager controllers, and it'll make sure that only controller has an 'active' state at any one time. 
# This is useful whenever you're implementing tabs or separate views inside an application. 
#
# By default, whenever a controller is activated, it's element receives a 'active' class. 
# You can use this class to show/hide views and tabs via CSS.
# For example:
#
#  var users = Users.init();
#  var groups = Groups.init();
#  Manager.init(users, groups);
#  
#  users.active();
#  assert( users.isActive() );
#  assert( users.el.hasClass("active") );
#  assert( ! groups.el.hasClass("active") );
#  
#  groups.active();
#  assert( groups.el.hasClass("active") );
#  assert( ! users.el.hasClass("active") );

Spine or= require("spine")
$     = Spine.$

class Spine.Manager extends Spine.Module
  @include Spine.Events
  
  constructor: ->
    @controllers = []
    @add(arguments...)
    @bind "change", @change
    
  add: (controllers...) ->
    @addOne(cont) for cont in controllers
    
  addOne: (controller) ->    
    controller.active (args...) =>
      @trigger("change", controller, args)

    @controllers.push(controller)
      
  deactivate: ->
    @trigger("change", false, arguments)
    
  # Private
    
  change: (current, args) ->
    for cont in @controllers
      if cont is current
        cont.activate(args...)
      else
        cont.deactivate(args...)

Spine.Controller.include
  active: (args...) ->
    if typeof args[0] is "function"
      @bind("active", args[0])
    else
      args.unshift("active")
      @trigger(args...)
    @
  
  isActive: ->
    @el.hasClass("active")
  
  activate: ->
    @el.addClass("active")
    @
  
  deactivate: ->
    @el.removeClass("active");
    @
    
module?.exports = Spine.Manager