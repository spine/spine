$ = Spine.$

Spine.preventDefaultTouch = $.preventDefaultTouch = ->
  $("body").bind "touchmove", (e) -> e.preventDefault()

$.support.touch = ("ontouchstart" in window)
Spine.Controller::tap = $.support.touch ? "tap" : "click"