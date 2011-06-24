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
  constructor: ->
    @add.apply(@, arguments)
    
  add: (controllers...) ->
    @addOne(cont) for cont in controllers
    
  addOne: (controller) ->
    bind "change", (current, args) ->
      if controller is current
        controller.activate.apply(args)
      else
        controller.deactivate.apply(args)
    
    controller.active (args...) =>
      trigger("change", controller, args)
  
Spine.Manager.include(Spine.Events)

Spine.Controller.include
  active: (args...) ->
    if typeof args[0] is "function"
      @bind("active", args[0])
    else
      args.unshift("active")
      @trigger.apply(@, args)
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