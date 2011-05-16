(function(Spine, $){
  
  Spine.List = Spine.Controller.create({
    events: {
      "click .item": "click"
    },
    
    proxied: ["change"],
    
    selectFirst: false,
    
    init: function(){
      this.bind("change", this.change);
    },
    
    template: function(){ return arguments[0] },
        
    change: function(item){
      if ( !item ) return;
      this.current = item;

      this.children().removeClass("active");
      this.children().forItem(this.current).addClass("active");
    },
        
    render: function(items){
      if (items) this.items = items;
      this.el.html(this.template(this.items));
      this.change(this.current);
      
      if ( this.selectFirst )
        if ( !this.children(".active").length || !this.current )
          this.children(":first").click();
    },
    
    children: function(sel){
      return this.el.children(sel);
    },
    
    click: function(e){
      var item = $(e.target).item();
      this.trigger("change", item);
    }
  });
  
})(Spine, Spine.$);