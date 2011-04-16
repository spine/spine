#Spine

__Spine is a lightwork framework for building JavaScript web applications.__ Spine gives your apps a MVC structure, and gets out of your way, allowing you to concentrate on the fun stuff, building awesome web applications. 

__Latest version:__ [0.0.2](TODO)

#Overview

Hello there

MVC
    
* Proper class library
* Full ORM

Backbone mention

#Setup

Using Spine is very straightforward, simply include the library in the page.

    <script src="spine.js" type="text/javascript" charset="utf-8"></script>
    
Spine has no prerequisites, but is optimized to work with [jQuery](http://jquery.com) or [Zepto](http://zeptojs.com).
Certain extensions to Spine, such as the Ajax and Local Storage model persistence, require additional files located inside the [lib](TODO) folder.
    
#Classes

Spine's class implementation is one of its features that makes it stand out from the crowd. Rather than copying properties to emulate inheritance, as most libraries, Spine uses JavaScript's native prototypal inheritance. This is how inheritance should be done, and means its dynamic, properties are resolved at runtime.

Classes are created like so:

    var Task = Spine.Class.create();

`create()` takes optional arguments of instance properties, and class properties.

    Spine.Class.create([instanceProperties, classProperties]);

    var User = Spine.Class.create({
      name: "Carolin"
    });
    
Alternative you can add instance properties using `include()`, and class properties with `extend()`.

    var User = Spine.Class.create();
    
    User.extend({
      find: function(){ /* ... */ }
    });
    
    User.include({
      name: "Tonje"
    });

Since Spine doesn't use constructor functions, due to limitations with prototypal inheritance, classes are instantiated with `inst()`.

    var User = Spine.Class.create({
      name: "Tonje"
    });
    
    var user = User.inst();
    
    assertEqual( user.name, "Tonje" );
    user.name = "Trish";
    assertEqual( user.name, "Trish" );

Any arguments passed to `inst()` will be forwarded to `init()`, the classes' instantiation callback.

    var User = Spine.Class.create({
      init: function(name){
        this.name = name;
      }
    });

    User.inst("Martina");
    assertEqual( user.name, "Martina" );

Sub-classes are created the same way base classes are, with `create()`.

    var Friend = User.create();
    
All of the subclass's parent properties are inherited.

    var friend = Friend.inst("Tim");
    
    assertEqual( friend.name, "Tim" );
    
Because we're using real prototypal inheritance, properties are resolved dynamically at runtime. This means that you can change the properties of a parent class, and all its sub-classes with reflect those changes immediately. 

    var User   = Super.Class.create();
    var Friend = User.create();
    
    User.include({defaultName: "(empty)"});

    assertEqual( Friend.inst().defaultName, "(empty)" );

##Context

Context changes constantly in JavaScript, and it's very important your code is executing in the correct one. The most common cause of this is with event listeners, where callbacks will be invoked in the context of `window` or the element, rather than than their original context. To resolve this, Spine's classes provides a few helper functions for maintaing context.

You can pass a function to `proxy()` to guarantee that it will be invoked in the current context.

    var Tasks = Spine.Class.create({
      init: function(){
        $("#destroy").click(this.proxy(this.destroy));
      },
      
      destroy: function(){ /* ... */ }
    });

Or pass multiple function names to `proxyAll()` in order to re-write them permanently, so they're always called with the classes' local content. 

    var Tasks = Spine.Class.create({
      init: function(){
        this.proxyAll("destroy")
        $("#destroy").click(this.destroy);
      },
      
      destroy: function(){ /* ... */ }
    });

#Events

`Spine.Events` is the module Spine uses for adding event support to classes. To use it, just include/extend a class with the module. 

    var Tasks = Spine.Class.create();
    Tasks.extend(Spine.Events);
    
`Spine.Events` gives you three functions, `bind()`, `trigger()`, and `unbind()`. All three have a very similar API to jQuery's event handling one, if you're familiar with that. `bind(name, callback)` takes a event name and callback. `trigger(name, [*data])` takes an event name and optional data to be passed to handlers. `unbind(name, [callback])` takes a event name and optional callback.
    
    Tasks.bind("create", function(){ /* ... */ });
    Tasks.trigger("create", ["some", "data"]);

You can bind to multiple events by separating them with spaces. Callbacks are invoked in the context the event is associated with. 

    Tasks.bind("create update destroy", function(){ this.trigger("change") });
    
You can pass optional data arguments to `trigger()` that will be passed onto event callbacks. Unlike jQuery, an event object will not be passed to callbacks.

    Tasks.bind("create", function(name){
      alert(name);
    });
    
    Tasks.trigger("create", "Take out the rubbish");
    
Although you may never use `Spine.Events` in your own classes, you will use it with Spine's models and controllers. We're going to cover those next.
    
#Models

Models are the core to Spine, and absolutely critical to your applications. Models are where your application's data is stored, and where any logic associated with that data is kept. Models should be de-coupled from the rest of your application, and completely independent. The data associated with models is stored in memory under `Model.records`.

Creating models is slightly different from creating classes, since the `create()` function is already reserved by models. Models are created with the `setup()` function, passing in the model name and an array of attributes.

    var Contact = Spine.Model.setup("Contact", ["first_name", "last_name"]);
    
Models are Spine classes, so you can treat them as such, extending and including properties.
    
    Contact.include({
      fullName: function(){
        return(this.first_name + " " + this.last_name);
      }
    });
    
Model instances are created with `inst()`, passing in an optional set of attributes.
    
    var contact = Contact.inst({first_name: "Alex", last_name: "MacCaw"});
    assertEqual( contact.fullName(), "Alex MacCaw" );
    
##Saving/Retrieving Records

Once an instance is created it can be saved in memory by calling `save()`.

    var Contact = Spine.Model.setup("Contact", ["first_name", "last_name"]);
    
    var contact = Contact.inst({first_name: "Joe"});
    contact.save();
    
When a record is saved, Spine automatically creates an ID if it doesn't already exist.

    assertEqual( contact.id, "AD9408B3-1229-4150-A6CC-B507DFDF8E90" );
    
You can use this ID to retrieve the saved record using `find()`.

    var identicalContact = Contact.find( contact.id );
    assert( contact.eql( identicalContact ) );
    
If `find()` fails to retrieve a record, an exception will be thrown. You can check for the existence of records without fear of an exception by calling `exists()`.

    assert( Contact.exists( contact.id ) );
    
Once you've changed any of a record's attributes, you can update it in-memory by re-calling `save()`.

    var contact = Contact.create({first_name: "Polo"});
    contact.save();
    contact.first_name = "Marko";
    contact.save();
    
You can also use `first()`, `last()` on the model to retrieve the first and last records.

    var firstContact = Contact.first();
    
To retrieve every contact, use `all()`.

    var contacts = Contact.all();
    for (var i=0; i < contacts.length; i++) {
      console.log( contact.first_name );

You can pass a function that'll be called with every record with `each()`.

    Contact.each(function(con){
      console.log( con.first_name );
    });
    
Or select a subset of records with `select()`.

    Contact.select(function(con){
      if (con.first_name) return true;
    });
    
##Validation

Validating models is dirt simple, simply override the `validate()` function with your own custom one.

    Contact.extend({
      validate: function(){
        if (!this.first_name)
          return "First name is required";
      }
    });
    
If `validate()` returns anything, the validation will fail and an *error* event will be fired on the model.
    
    Contact.bind("error", function(rec, msg){
      alert("Contact failed to save - " + msg);
    });

##Serialization

Spine's models include special support for JSON serialization. To serialize a record, call `JSON.stringify()` passing the record, or to serialize every record, pass the model.

    JSON.stringify(Contact);
    JSON.stringify(Contact.first());
    
Alternative, you can retrieve a instances attributes and implement your own serialization by calling `attributes()`.

    var contact = Contact.inst({first_name: "Leo"});
    assertEqual( contact.attributes(), {first_name: "Leo"} );
    
    Contact.include({
      toXML: function(){
        return serializeToXML(this.attributes());
      }
    });

##Persistence

While storing records in memory is useful for quick retrieval, persisting them in one sort of another is often required. Spine includes a number of pre-existing storage modules, such as Ajax and HTML5 Local Storage, which you can use for persistence. Alternatively you can roll your own custom one, take a look at `spine.model.ajax.js` for inspiration. 

To persist a model using HTML5 Local Storage, simply extend it with `Spine.Model.Local`.

    Contact.extend(Spine.Model.Local);

When a record is changed, the Local Storage database will be updated to reflect that. In order to fetch the records from Local Storage in the first place, you need to use `fetch()`. 

    Contact.fetch();
    
Typically this is called once, when your application is first initialized. 

###Local

    Contact.extend(Spine.Model.Local)

###Ajax

    Contact.extend(Spine.Model.Ajax);
    
    Spine.Model.ajaxPrefix = true;

##Events

* *save* - record was saved (either created/updated)
* *update* - record was updated
* *create* - record was created
* *destroy* - record was destroyed
* *change* - any of the above, record was created/updated/destroyed
* *refresh* - all records invalidated and replaced
* *error* - validation failed

#Controllers

    var Tasks = Spine.Controller.create({
      init: function(){
        
      }
    });

##Proxying

    var Tasks = Spine.Controller.create({
      proxied: ["render"],
      
      init: function(){
        Task.change(this.render);
      }
    });


##Elements

    var Tasks = Spine.Controller.create({
      elements: {".items": "items"},
      
      init: function(){
        
      }
    });

##Events

    var Tasks = Spine.Controller.create({
      events: {"click .item", "click"},
      
      init: function(){
        
      }
    });
    
Custom events.

    var ToggleView = Spine.Controller.create({
      proxied: ["toggle"],
      
      init: function(){
        this.el.click(this.toggle);
      },
      
      toggle: function(){
        this.trigger("toggle");
      }
    });
    
    
Global events.

    var ToggleView = Spine.Controller.create({
      proxied: ["toggle"],
      
      init: function(){
        this.el.click(this.toggle);
      },
      
      toggle: function(){
        this.App.trigger("toggle");
      }
    });

#Render Pattern
#The Element Pattern
    
#Examples

#Resources

#Change Log

<script type="text/javascript" charset="utf-8">
  $("code").addClass("javascript");
</script>