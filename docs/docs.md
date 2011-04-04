#Introduction

##Differences with Backbone

Spine is, in many ways, very similar to Backbone, so what was the motivation for writing it?

First off, I want to emphasize the fact that I think Backbone is a great library, 

all the following gripes are purely my personal opinion, there isn't necessarily any right or wrong. Many of them are rather petty. With that said:

#initialize

Why the hell use `initialize` as an instantiation callback, rather than the shorter `init`. Pretty much every class is going to have an instantiation callback, so why give it such a long and easy to miss-spell name. 

This is a gripe I have with Ruby too. It's too late to change Ruby, but we still have a chance change the convention with JavaScript. 

#Inheritance

Backbone copies properties when inheriting classes.
This is not an issue limited to Backbone, but effects a lot of class implementations, such as Prototype and Super.js. 

There are some issues with this:

a) Results in overhead when your library is initially loaded
b) Fakes inheritance, i.e. subsequent changes to parent classes wont be propagated to their children.
c) There's a much more elegant alternative: `Object.create()`

It's not possible to inherit class properties when using constructor functions, without a lot of copying. 

Spine has an approach to inheritance that uses JavaScript's native prototypal inheritance. The one caveat to this is that you can use the `new` keyword, as object aren't constructor functions. See `Klass`

#Collections

To be honest, I don't understand the point of collections. If you need separate collections of models, why not just subclass the model. Having mandatory collections results in a lot more code. 

#Terminology 

Views should be HTML. Backbone's views should be called controllers. Granted, as gripes go, this is fairly petty - but it can be confusing for beginners who are familiar with other MVC frameworks. 

#Size

Backbone could be a lot smaller. Spine is half the size, with similar functionality, and that's before you include Underscore.js. 

#ID generation

This is my biggest gripe, and probably the most controversial. imo, you should assume the server is going to respond with a success when creating/updating/destroying records. In other words all ID generation is done client side, and you let users manipulate records without caring about server responses. A server sending a response other than a 200 is an exceptional circumstance, and you should deal with it that way. Another way to put this, is that all communication to the server is asynchronous - the client is never waiting for a server response. This also makes offline use much easier to implement. 

#Setup

execute all after page load

#Key architecture

#Classes

instantiation
including/extending

##Inheritance

Creating a new class.

    Spine.Klass.create([instanceProperties, classProperties]);

    var User = Spine.Klass.create({
      name: "Caroline"
    });

Instantiating a class.
    
    var user = User.inst();
    user.name //=> "Caroline"
    
    user.name = "Trish";
    user.name //=> "Trish"
    
Initializer function.
    
    var User = Spine.Klass.create({
      init: function(name){
        this.name = name;
      }
    });
    
    User.inst("Martina");
    
Inheritance.
    
    var Friend = User.create();
    
Adding instance and class properties.
    
    Friend.include({
      // Instance properties
    });
    
    Friend.extend({
      // Class properties
    });
    
##Scope

Context changes with callback, so this won't work:

    var Controller = Spine.Klass.create({
      init: function(){
        $("#destroy").click(this.destroy);
      }
    });
    
Use `proxy()` to keep local context.
    
    var Controller = Spine.Klass.create({
      init: function(){
        $("#destroy").click(this.proxy(this.destroy));
      }
    });
    
Or use `proxyAll()` to force a function's execution context.
    
    var Controller = Spine.Klass.create({
      init: function(){
        this.proxyAll("destroy")
        $("#destroy").click(this.destroy);
      }
    });

#Events

Adding events to a class.

    var Controller = Spine.Klass.create();
    Controller.include(Spine.Events);
    
    var users = Controller.inst();
    
Binding events. Separate multiple events with spaces. Callbacks are invoked with an event object, and any passed arguments.
    
    users.bind("change", function(e, item){
      console.log(item.name)
    });
    
Trigger takes a event name and data.
        
    users.trigger("change", {name: "Foo"});

#Models

Models take their name, and an array of attributes.

    // Create the Task model.
    var Task = Spine.Model.setup("Task", ["name", "done"]);
    
Adding class properties with `extend()`

    Task.extend({  
      // Return all done tasks.
      done: function(){
        return(this.select(function(item){ return !!item.done; }));    
      },
  
      // Clear all done tasks.
      destroyDone: function(){
        this.done().forEach(function(rec){ rec.destroy() });
      }
    });
    
Add instance properties with `include()`.
    
    Task.include({
      validate: function(){
        if ( !this.name ) return("Name required");
      },
      
      toggle: function(){
        this.done = !this.done;
        this.save();
      }
    });
    
The `validate()` function is called on save. If it returns anything, the validation fails.
    
    // Validation fails, throws error
    Task.create({name: ""});
    
    // Instantiate new task
    var task = Task.inst({name: "Complete shopping"});
    
    // Retrieve task's current attributes
    task.attributes(); //=> {name: "Complete shopping"}
    
    // Save task to memory
    task.save();
    
    // Toggle done state, then save
    task.toggle(); 
    
    Task.count(); //=> 1
    Task.first(); //=> Object
    Task.all();   //=> [Object]
    Task.done();  //=> [Object]

    // Find a task by ID
    Task.find(task.id); //=> Object

    // Iterate through tasks
    Task.each(function(task){ /* ... */ });
    
    // Filter tasks with a selector function
    var pending = Task.select(function(task){
      return !task.done;
    });
    
    JSON.stringify(task); //=> "{'name': 'Complete shopping'}";
    JSON.stringify(Task); //=> "[{'name': 'Complete shopping'}]";
    
    
    // Bind events to a task
    task.bind("save", function(e){ });
    
    // Bind events to a model
    Task.bind("save", function(e, task){ });
    
    // Destroy a tak
    task.destroy();

##Persistence

    // Save with local storage
    Task.extend(Spine.Model.Local);
    
    // Save to server
    Task.extend(Spine.Model.Ajax);
    
    // Add a custom URL
    Task.extend({
      url: "/tasks"
    });
    
    // Fetch new tasks from the server
    Task.fetch();
    
    // POST new tasks to the server
    Task.create({name: "Saved to server"});
    
##Events

* save
* update
* create
* destroy
* refresh
* change

#Controllers

    el, tag, id
    
    initialize args

    // Specify a custom tag
    var Tasks = Spine.Controller.create({
      tag: "li"
    });
    
    // Equivalent to using proxyAll
    var Tasks = Spine.Controller.create({
      scoped: ["render", "addAll"]
    });
    
    // The `input` instance variable
    var Tasks = Spine.Controller.create({
      elements: {
        "form input[type=text]": "input"
      }
    });
    
    var Tasks = Spine.Controller.create({
      events: {
        "keydown form input[type=text]": "keydown"
      },
      
      keydown: function(e){ /* ... */ }
    });
    
    var Tasks = Spine.Controller.create({
      scoped: ["change"],
      
      init: function(){
        this.App.bind("change", this.change);
      },
      
      change: function(){
        
      }
    });

#Logging

#Building a Todo application

    <div id="views">
      <div id="tasks">
        <h1>Todos</h1>

        <form>
          <input type="text" placeholder="What needs to be done?">
        </form>

        <div class="items"></div>
      </div>
    </div>

##Task Model

    // Create the Task model.
    var Task = Spine.Model.setup("Task", ["name", "done"]);

    // Persist model between page reloads.
    Task.extend(Spine.Model.Local);
    
##Todos Controller

    jQuery(function($){
      // ...
    });
    
    window.Tasks = Spine.Controller.create({
      tag: "li",

      scoped: ["render", "remove"],

      events: {
        "change   input[type=checkbox]": "toggle",
        "click    .destroy":             "destroy",
        "dblclick .view":                "edit",
        "keypress input[type=text]":     "blurOnEnter",
        "blur     input[type=text]":     "close"
      },

      elements: {
        "input[type=text]": "input",
        ".item": "wrapper"
      },

      init: function(){
        this.item.bind("update",  this.render);
        this.item.bind("destroy", this.remove);
      },

      render: function(){
        var elements = $("#taskTemplate").tmpl(this.item);
        this.el.html(elements);
        this.refreshElements();
        return this;
      },

      toggle: function(){
        this.item.done = !this.item.done;
        this.item.save();      
      },

      destroy: function(){
        this.item.destroy();
      },

      edit: function(){
        this.wrapper.addClass("editing");
        this.input.focus();
      },

      blurOnEnter: function(e) {
        if (e.keyCode == 13) e.target.blur();
      },

      close: function(e){
        this.wrapper.removeClass("editing");
        this.item.updateAttributes({name: this.input.val()});
      },

      remove: function(){
        this.el.remove();
      }
    });
    
    
##Todos Template

    <script type="text/x-jquery-tmpl" id="taskTemplate">
      <div class="item {{if done}}done{{/if}}">
        <div class="view" title="Double click to edit...">
          <input type="checkbox" {{if done}}checked="checked"{{/if}}> 
          <span>${name}</span> <a class="destroy"></a>
        </div>

        <div class="edit">
          <input type="text" value="${name}">
        </div>
      </div>
    </script>
    
##App Controller

    window.TaskApp = Spine.Controller.create({
      el: $("#tasks"),

      scoped: ["addOne", "addAll"],

      events: {
        "submit form": "create",
      },

      elements: {
        ".items":     "items",
        "form input": "input"
      },

      init: function(){
        Task.bind("create",  this.addOne);
        Task.bind("refresh", this.addAll);
        Task.fetch();
      },

      addOne: function(e, task) {
        var view = Tasks.inst({item: task || e});
        this.items.append(view.render().el);
      },

      addAll: function() {
        Task.each(this.addOne);
      },

      create: function(e){
        Task.create({name: this.input.val()});
        this.input.val("");
        return false;
      }
    });

    window.App = TaskApp.inst();
