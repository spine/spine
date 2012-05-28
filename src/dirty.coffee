Spine ?= require('spine')

Include =
  savePrevious: ->
    @constructor.records[@id].previousAttributes = @attributes()

Spine.Model.Dirty =
  extended: ->
    @bind 'refresh', ->
      @each (record) -> record.savePrevious()

    @bind 'save', (record) ->
      if record.previousAttributes?
        for key in record.constructor.attributes when key of record
          if record[key] isnt record.previousAttributes[key]
            record.trigger('change:'+key, record[key])
      record.savePrevious()

    @include Include
