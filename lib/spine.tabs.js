// Usage:

// <ul class="tabs">
//  <li data-name="users">Users</li>
//  <li data-name="groups">Groups</li>
// </ul>
// 

// var users = Users.init();
// var groups = Groups.init();
// Manager.init(users, groups);
//
// var tabs = Spine.Tabs.init({el: $(".tabs")});
// tabs.connect("users", users);
// tabs.connect("groups", groups);
//
// // Select first tab.
// tabs.render();

(function(Spine, $){
  
  Spine.Tabs = Spine.Controller.create({
    events: {
      "click [data-name]": "click"
    },
    
    proxied: ["change"],
    
    init: function(){
      this.bind("change", this.change);
    },
            
    change: function(name){
      if ( !name ) return;
      this.current = name;

      this.children().removeClass("active");
      this.children("[data-name='" + this.current + "']").addClass("active");
    },
        
    render: function(){
      this.change(this.current);
      if ( !this.children(".active").length || !this.current )
        this.children(":first").click();
    },
    
    children: function(sel){
      return this.el.children(sel);
    },
    
    click: function(e){
      var name = $(e.target).attr("data-name");
      this.trigger("change", name);
    },
    
    connect: function(tabName, controller) {
      this.bind("change", function(name){
        if (name == tabName)
          controller.active();
      });
    }
  });
  
})(Spine, Spine.$);