Spine ?= require('spine')

Spine.Model.Session =
  extended: ->
    @change @saveSession
    @fetch @loadSession
    
  saveSession: ->
    result = JSON.stringify(@)
    sessionStorage[@className] = result

  loadSession: ->
    result = sessionStorage[@className]
    @refresh(result or [], clear: true)
    
module?.exports = Spine.Model.Session
