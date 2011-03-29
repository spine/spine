(function(){

var Manager = Spine.Controller.Manager = Spine.Klass.create();
Manager.include(Spine.Events);

Manager.include({
  addAll: function(){
    var args = Array.prototype.slice.call(arguments, 0);
    for (var i=0; i < args.length; i++) this.add(args[i]);
  },
  
  add: function(controller){
    if ( !controller ) throw("Controller required");
    
    this.bind("change", function(e, current){
      if (controller == current)
        controller.activate();
      else
        controller.deactivate();
    });
    
    controller.active(this.proxy(function(e){
      this.trigger("change", controller);
    }));
  }  
});

Spine.Controller.include({
  active: function(callback){
    callback ? this.bind("active", callback) : this.trigger("active");
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

})();