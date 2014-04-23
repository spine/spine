Spine = @Spine or require('spine')

Spine.Model.Local =
  extended: ->
    @change @saveLocal
    @fetch @loadLocal

  saveLocal: ->
    result = JSON.stringify(@)
    localStorage[@className] = result

  loadLocal: (params, options = {})->
    options.clear = true unless options.hasOwnProperty('clear')
    json = localStorage[@className]
    results = @refresh(json or [], options)
    options.resolve?(results)

module?.exports = Spine.Model.Local