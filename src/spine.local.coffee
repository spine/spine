Spine or= require("spine")

Spine.Model.Local =
  extended: ->
    this.change(this.proxy(this.saveLocal))
    this.fetch(this.proxy(this.loadLocal))
    
  saveLocal: ->
    result = JSON.stringify(this)
    localStorage[@className] = result

  loadLocal: ->
    result = localStorage[@className]
    return unless result
    result = JSON.parse(result)
    this.refresh(result, clear: true)
    
module?.exports = Spine.Model.Local