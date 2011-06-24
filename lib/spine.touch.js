(function() {
  var $, _ref;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  $ = Spine.$;
  Spine.preventDefaultTouch = $.preventDefaultTouch = function() {
    return $("body").bind("touchmove", function(e) {
      return e.preventDefault();
    });
  };
  $.support.touch = (__indexOf.call(window, 'ontouchstart') >= 0);
  Spine.Controller.prototype.tap = (_ref = $.support.touch) != null ? _ref : {
    "tap": "click"
  };
}).call(this);
