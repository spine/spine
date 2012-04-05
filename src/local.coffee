Spine ?= require('spine')

Spine.Model.Local =
  extended: ->
    @change @saveLocal
    @fetch @loadLocal

  saveLocal: ->
    result = JSON.stringify(
      records  : @
      idCounter: @idCounter
    )
    localStorage[@className] = result

  loadLocal: ->
    result = localStorage[@className]
    {records, idCounter} = JSON.parse(result) or {}
    @refresh(records or [], clear: true)
    @idCounter = idCounter or 0

module?.exports = Spine.Model.Local