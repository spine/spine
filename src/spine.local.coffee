Spine or= require("spine")

Spine.Model.Local =
  extended: ->
    this.sync(this.proxy(this.saveLocal))
    this.fetch(this.proxy(this.loadLocal))
    
  saveLocal: ->
    result = JSON.stringify(this)
    localStorage[@name] = result

  loadLocal: ->
    result = localStorage[@name]
    return unless result
    result = JSON.parse(result)
    this.refresh(result, clear: true)
    
module?.exports = Spine.Model.Local