////
// A Manager is basically a state machine that controls a set of controller's 'active' state.
// In other words, you feed a manager controllers, and it'll make sure that only controller has an 'active' state at any one time. 
// This is useful whenever you're implementing tabs or separate views inside an application. 
//
// By default, whenever a controller is activated, it's element receives a 'active' class. 
// You can use this class to show/hide views and tabs via CSS.
// For example:
//
//  var users = Users.init();
//  var groups = Groups.init();
//  Manager.init(users, groups);
//  
//  users.active();
//  assert( users.isActive() );
//  assert( users.el.hasClass("active") );
//  assert( ! groups.el.hasClass("active") );
//  
//  groups.active();
//  assert( groups.el.hasClass("active") );
//  assert( ! users.el.hasClass("active") );

(function(Spine, $){

var Manager = Spine.Manager = Spine.Class.create();
Manager.include(Spine.Events);

Manager.include({
  init: function(){
    this.add.apply(this, arguments);
  },
  
  add: function(controller){
    if (arguments.length > 1) {
      var args = Spine.makeArray(arguments);
      for (var i=0; i < args.length; i++) this.add(args[i]);
      return;      
    }
    
    if ( !controller ) throw("Controller required");
    
    this.bind("change", function(current){
      if (controller === current)
        controller.activate();
      else
        controller.deactivate();
    });
    
    controller.active(this.proxy(function(){
      this.trigger("change", controller);
    }));
  } 
});

Spine.Controller.include({
  active: function(callback){
    if (typeof callback === "function") 
      this.bind("active", callback) 
    else {
      var args = Spine.makeArray(arguments);
      args.unshift("active");
      this.trigger.apply(this, args);
    }
    return this;
  },
  
  isActive: function(){
    return this.el.hasClass("active");
  },
  
  activate: function(){
    this.el.addClass("active");
    return this;
  },
  
  deactivate: function(){
    this.el.removeClass("active");
    return this;
  }
});

})(Spine, Spine.$);