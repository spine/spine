Spine ?= require('spine')
$      = Spine.$

class Spine.List extends Spine.Controller
  events:
    'click .item': 'click'
    
  selectFirst: false
    
  constructor: ->
    super
    @bind 'change', @change
    
  template: -> arguments[0]
  
  change: (item) =>
    return unless item
    @current = item
    @children().removeClass('active')
    @children().forItem(@current).addClass('active')
  
  render: (items) ->
    @items = items if items
    @html @template(@items)
    @change @current
    if @selectFirst
      unless @children('.active').length
        @children(':first').click()
        
  children: (sel) ->
    @el.children(sel)
    
  click: (e) ->
    item = $(e.currentTarget).item()
    @trigger('change', item)
    false
    
module?.exports = Spine.List