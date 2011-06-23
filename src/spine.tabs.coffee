# 
# Usage:
# 
# <ul class="tabs">
#  <li data-name="users">Users</li>
#  <li data-name="groups">Groups</li>
# </ul>
# 
# 
# var users = Users.init();
# var groups = Groups.init();
# Manager.init(users, groups);
# 
# var tabs = Spine.Tabs.init({el: $(".tabs")});
# tabs.connect("users", users);
# tabs.connect("groups", groups);
# 
## Select first tab.
# tabs.render();

Spine or= require("spine")
$     = Spine.$

class Spine.Tabs extends Spine.Controller
  events: 
    "click [data-name]": "click"
    
  constructor: ->
    super
    @bind("change", @change)
  
  
  change: (name) => 
    return unless name
    @current = name
    @children().removeClass("active")
    @children("[data-name='" + @current + "']").addClass("active")
  
  render: ->
    @change @current
    unless @children(".active").length or @current
      @children(":first").click()

  children: (sel) ->
    @el.children(sel)

  click: (e) ->
    name = $(e.target).attr("data-name")
    @trigger("change", name)

  connect: (tabName, controller) ->
    @bind "change", (name) ->
      controller.active() if name == tabName
      
module?.exports = Spine.Tabs