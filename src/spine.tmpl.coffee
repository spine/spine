# jQuery.tmpl.js utilities

$ = jQuery

$.fn.item = ->
  item = $(@).tmplItem().data
  item.reload?()

$.fn.forItem = ->
  @filter ->
    compare = $(@).item()
    return item.eql?(compare) or item is compare