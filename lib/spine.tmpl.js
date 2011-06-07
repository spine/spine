// jQuery.tmpl.js utilities

(function($){

$.fn.item = function(){
  var item = $(this).tmplItem().data;
  return($.isFunction(item.reload) ? item.reload() : null);
};

$.fn.forItem = function(item){
  return this.filter(function(){
    var compare = $(this).item();
    if (item.eql && item.eql(compare) || item === compare)
      return true;
  });
};

})(jQuery);