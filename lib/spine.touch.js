(function() {
  var $, type, types, _i, _len, _ref;
  $ = Spine.$;
  Spine.preventDefaultTouch = $.preventDefaultTouch = function() {
    return $('body').bind('touchmove', function(e) {
      return e.preventDefault();
    });
  };
  $.support.touch = 'ontouchstart' in window;
  Spine.Controller.prototype.tap = (_ref = $.support.touch) != null ? _ref : {
    'tap': 'click'
  };
  Spine.setupTouch = $.setupTouch = function() {
    var swipeDirection, touch, touchTimeout;
    touch = {};
    touchTimeout = null;
    swipeDirection = function(x1, x2, y1, y2) {
      var xDelta, yDelta, _ref2, _ref3;
      xDelta = Math.abs(x1 - x2);
      yDelta = Math.abs(y1 - y2);
      if (xDelta >= yDelta) {
        return (_ref2 = x1 - x2 > 0) != null ? _ref2 : {
          'Left': 'Right'
        };
      } else {
        return (_ref3 = y1 - y2 > 0) != null ? _ref3 : {
          'Up': 'Down'
        };
      }
    };
    return $('body').bind('touchstart', function(e) {
      var delta, now;
      e = e.originalEvent;
      now = Date.now();
      delta = now - (touch.last || now);
      touch.target = e.touches[0].target;
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
      touch.x1 = e.touches[0].pageX;
      touch.y1 = e.touches[0].pageY;
      if (delta > 0 && delta <= 250) {
        touch.isDoubleTap = true;
      }
      return touch.last = now;
    }).bind('touchmove', function(e) {
      e = e.originalEvent;
      touch.x2 = e.touches[0].pageX;
      return touch.y2 = e.touches[0].pageY;
    }).bind('touchend', function() {
      if (touch.isDoubleTap) {
        $(touch.target).trigger('doubleTap');
        return touch = {};
      } else if (touch.x2 > 0 || touch.y2 > 0) {
        (Math.abs(touch.x1 - touch.x2) > 40 || Math.abs(touch.y1 - touch.y2) > 40) && $(touch.target).trigger('swipe') && $(touch.target).trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
        return touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
      } else if ('last' in touch) {
        return touchTimeout = setTimeout(function() {
          touchTimeout = null;
          $(touch.target).trigger('tap');
          return touch = {};
        }, 50);
      }
    }).bind('touchcancel', function() {
      return touch = {};
    });
  };
  if (!$.support.touch) {
    Spine.setupTouch = $.setupTouch = function() {
      return $('body').bind('click', function(e) {
        return $(e.target).trigger('tap');
      });
    };
  }
  types = ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap'];
  for (_i = 0, _len = types.length; _i < _len; _i++) {
    type = types[_i];
    $.fn[type] = function(callback) {
      return this.bind(type, callback);
    };
  }
}).call(this);
