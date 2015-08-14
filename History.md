## 1.6.0
* CoffeeScript 1.9.3
* Collection ajax calls can now accept done or fail callbacks #591
* Unsuccessful ajax POST calls automatically delete the local model #591
* Unsuccessful ajax DELETE calls automatically restore the local model #591
* Fix a bug with stopListening #596

## 1.5.0
* CoffeeScript 1.9.2
* Add ability to insert record at index #586
* Remove Spine.isArray polyfill #589
* Remove Spine.isBlank util #589
* The relation module utilizes underscore instead of dot #446

## 1.4.2
* CoffeeScript 1.9.1
* Fixes for coffeescript change #578
* LocalStorage module checks for functioning localStorage #584

## 1.4.1
* Use beforeFromJSON before passing json to ajaxSuccess
* The ajaxSuccess event again passes item as first arg

## 1.4.0
* CoffeeScript 1.8.0
* Refactored model event dispatching #558
* Replaced exists() with find() in relation module
* Fixed Route unbind #551
* Remove controllers @$el as broken alias for @el #552
* Migrate to jasmine 2.1.3 for tests

## 1.3.2
* Fixes and minor improvements to route and relations modules #535, #551, #533
* Add Model.findAll() #538
* code cleanup #537, #536
* jasmine test pass in IE9 #549
* CoffeeScript 1.7.1

## 1.3.1
* Fixes and improvements to route and manager modules #513
* Ajax methods configuable #523
* Fix for orphaned model instances #527

## 1.3
* Minor updates for CoffeeScript 1.7
* Change Model.find() to not throw error and accept fallback function
* Model.exists() will now return simply true or false
* Optional customizable UUID for model records #451
* Improvements to some triggers #508
* Improve ajax route and scope customizability #510
* Expiremental bindings module #491

## 1.2.2
* Add Model.slice() and improve .last() and .first()

## 1.2.1
* Fix a few bugs
* Add a license header

## 1.2.0
* Much improved fromForm method
* Fix controller.replace()
* Trigger can pass options
* Code cleanup for listen methods
* Improve manager module handling of activate deactivate events
* Accept url override for methods that would delegate to ajax- `Asset.save {url:'/some/other/url'}` (#467)
* Simpler mechanism for maintaining model order
* Unmatched route redirect options
* Better handle race conditions in the ajaxQueue

## 1.1.0
* Test suite improvements including core now being tested against Zepto.js
* Persistent ordering of model instances in Chrome 
* Numerous improvements to relations module
* ListenTo and stopListening methods to help keep Spine's pub/sub implementation tidy
* Improve unbind method on model instances
* Better enable nesting and extending controllers
* Ajax module supports options for scoping the url

## v1.0.9

* Tested against newer jQuery versions
* On and off aliases for bind and unbind
* Routes can accept option to use history.replaceState()
* More descriptive 'unknown record' errors
* Better cloning so records don't diverge
* Throw errors if naming conflicts in stack manager
* Fix some edge case bugs with routing

## v1.0.8

A bug-fix release.

* ???
* ???
* ???

## v1.0.7

A bug-fix release.

* Fix named globs in routes
* Deprecate Model.prototype.init()
* Make cids simplier
* Controller event callbacks always return true, so you don't accidentally cancel the event
* `release` is now just a method you can override, not an event
* Fixed `findAllByAttribute` in `relations.coffee`
* Try/catch round `Ajax.disable` do Ajax is always enabled again
* Model Ajax requests can be cancelled with `save(ajax: false)`

## v1.0.6

##Features

Main two new features are:

Ajax options on save, for example:

```coffeescript
user.save(success: -> alert('saved!'))
user.save(ajax: false) # Disable Ajax
user.save(ajax: ajaxOptions)
```

And cids:

```coffeescript
project = Project.create()
@navigate '/projects', project.cid

Project.find(project.cid) #=> Project
```

##Abstract

* Fixed double Ajax disabling issue
* Can now pass request options to Ajax on save
* url() now takes multiple arguments
* Fix association id comparison issue
* Now have internal CIDs for use in comparison and in URLs
* Add 'attributes' option to controllers

And much more...

## v1.0.5

###Abstract

Mostly a bunch of fixes, with some new features:

* Fix issues with routing order
* Allow regexes in routes
* Include spine.app as a dependency
* Add [Stacks](http://spinejs.com/docs/stacks)
* Add fromForm to models (see [API](http://spinejs.com/api/models))
* Fix cross-domain ajax
* create()/save() now return clones

## v1.0.3

###Abstract:

Version 1.0.3 was mostly about Ajax, and integrating Spine with Rails.

###New features:

* Model's *refresh* event now includes the new resources
* Pass an 'id' option to fetch, in order to fetch a single record via ajax
* Bind to an event once, with the 'one()' function
* Allow namespaced events in the controller
* Model#attributes() & Model#load() now works for functions. In other words, you can use a functions instead of basic datatypes for attributes on models.

###Refactors:

* Ajax refactor, including easier integration with Ajax callbacks
* Refactor the way instance events get triggered on records
* Removed deprecated Spine.App - which also enables Node.js compatibility
 
