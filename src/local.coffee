Spine  = do -> @Spine ? require('spine')
localStorage = do -> @localStorage

Spine.Model.Local =
  extended: ->
    @change @saveLocal
    @fetch @loadLocal

  saveLocal: ->
    result = JSON.stringify(@)
    localStorage[@className] = result

  loadLocal: ->
    result = localStorage[@className]
    @refresh(result or [], clear: true)

module?.exports = Spine.Model.Local