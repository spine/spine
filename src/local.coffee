Spine ?= require('spine')

Spine.Model.Local =
  extended: ->
    this.change(this.saveLocal)
    this.fetch(this.loadLocal)
    
  saveLocal: ->
    result = JSON.stringify(this)
    localStorage[@className] = result

  loadLocal: ->
    result = localStorage[@className]
    this.refresh(result or [], clear: true)
    
module?.exports = Spine.Model.Local