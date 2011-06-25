$ = Spine.$

Spine.preventDefaultTouch = $.preventDefaultTouch = ->
  $('body').bind 'touchmove', (e) -> e.preventDefault()

$.support.touch = ('ontouchstart' of window)
Spine.Controller::tap = $.support.touch ? 'tap' : 'click'

Spine.setupTouch = $.setupTouch = ->
  touch = {}
  touchTimeout = null
  
  swipeDirection = (x1, x2, y1, y2) ->
    xDelta = Math.abs(x1 - x2)
    yDelta = Math.abs(y1 - y2)
    if xDelta >= yDelta
      x1 - x2 > 0 ? 'Left' : 'Right'
    else
      y1 - y2 > 0 ? 'Up' : 'Down'
  
  $('body').bind 'touchstart', (e) ->
    e = e.originalEvent
    now = Date.now()
    delta = now - (touch.last || now)
    touch.target = e.touches[0].target
    clearTimeout(touchTimeout) if touchTimeout
    touch.x1 = e.touches[0].pageX
    touch.y1 = e.touches[0].pageY
    if delta > 0 and delta <= 250
      touch.isDoubleTap = true
    touch.last = now
  .bind 'touchmove', (e) ->
    e = e.originalEvent
    touch.x2 = e.touches[0].pageX
    touch.y2 = e.touches[0].pageY
  .bind 'touchend', ->
    if touch.isDoubleTap
      $(touch.target).trigger('doubleTap')
      touch = {}
    else if touch.x2 > 0 or touch.y2 > 0
      (Math.abs(touch.x1 - touch.x2) > 40 or Math.abs(touch.y1 - touch.y2) > 40) and 
        $(touch.target).trigger('swipe') and
        $(touch.target).trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
      touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0
    else if 'last' of touch
      touchTimeout = setTimeout(->
        touchTimeout = null
        $(touch.target).trigger('tap')
        touch = {}
      , 50)
  .bind 'touchcancel', -> touch = {}

unless $.support.touch
  Spine.setupTouch = $.setupTouch = ->
    $('body').bind 'click', (e) -> $(e.target).trigger('tap')

types = ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap']
($.fn[type] = (callback) -> @bind(type, callback)) for type in types