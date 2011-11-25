(function() {
  var $, InflectionJS;
  if (typeof Spine === "undefined" || Spine === null) {
    Spine = require('spine');
  }
  $ = Spine.$;
  if (window && !window.InflectionJS) {
    window.InflectionJS = null;
  }
  InflectionJS = {
    uncountable_words: ["equipment", "information", "rice", "money", "species", "series", "fish", "sheep", "moose", "deer", "news"],
    plural_rules: [[new RegExp("(m)an$", "gi"), "$1en"], [new RegExp("(pe)rson$", "gi"), "$1ople"], [new RegExp("(child)$", "gi"), "$1ren"], [new RegExp("^(ox)$", "gi"), "$1en"], [new RegExp("(ax|test)is$", "gi"), "$1es"], [new RegExp("(octop|vir)us$", "gi"), "$1i"], [new RegExp("(alias|status)$", "gi"), "$1es"], [new RegExp("(bu)s$", "gi"), "$1ses"], [new RegExp("(buffal|tomat|potat)o$", "gi"), "$1oes"], [new RegExp("([ti])um$", "gi"), "$1a"], [new RegExp("sis$", "gi"), "ses"], [new RegExp("(?:([^f])fe|([lr])f)$", "gi"), "$1$2ves"], [new RegExp("(hive)$", "gi"), "$1s"], [new RegExp("([^aeiouy]|qu)y$", "gi"), "$1ies"], [new RegExp("(x|ch|ss|sh)$", "gi"), "$1es"], [new RegExp("(matr|vert|ind)ix|ex$", "gi"), "$1ices"], [new RegExp("([m|l])ouse$", "gi"), "$1ice"], [new RegExp("(quiz)$", "gi"), "$1zes"], [new RegExp("s$", "gi"), "s"], [new RegExp("$", "gi"), "s"]],
    singular_rules: [[new RegExp("(m)en$", "gi"), "$1an"], [new RegExp("(pe)ople$", "gi"), "$1rson"], [new RegExp("(child)ren$", "gi"), "$1"], [new RegExp("([ti])a$", "gi"), "$1um"], [new RegExp("((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$", "gi"), "$1$2sis"], [new RegExp("(hive)s$", "gi"), "$1"], [new RegExp("(tive)s$", "gi"), "$1"], [new RegExp("(curve)s$", "gi"), "$1"], [new RegExp("([lr])ves$", "gi"), "$1f"], [new RegExp("([^fo])ves$", "gi"), "$1fe"], [new RegExp("([^aeiouy]|qu)ies$", "gi"), "$1y"], [new RegExp("(s)eries$", "gi"), "$1eries"], [new RegExp("(m)ovies$", "gi"), "$1ovie"], [new RegExp("(x|ch|ss|sh)es$", "gi"), "$1"], [new RegExp("([m|l])ice$", "gi"), "$1ouse"], [new RegExp("(bus)es$", "gi"), "$1"], [new RegExp("(o)es$", "gi"), "$1"], [new RegExp("(shoe)s$", "gi"), "$1"], [new RegExp("(cris|ax|test)es$", "gi"), "$1is"], [new RegExp("(octop|vir)i$", "gi"), "$1us"], [new RegExp("(alias|status)es$", "gi"), "$1"], [new RegExp("^(ox)en", "gi"), "$1"], [new RegExp("(vert|ind)ices$", "gi"), "$1ex"], [new RegExp("(matr)ices$", "gi"), "$1ix"], [new RegExp("(quiz)zes$", "gi"), "$1"], [new RegExp("s$", "gi"), ""]],
    non_titlecased_words: ["and", "or", "nor", "a", "an", "the", "so", "but", "to", "of", "at", "by", "from", "into", "on", "onto", "off", "out", "in", "over", "with", "for"],
    id_suffix: new RegExp("(_ids|_id)$", "g"),
    underbar: new RegExp("_", "g"),
    space_or_underbar: new RegExp("[ _]", "g"),
    uppercase: new RegExp("([A-Z])", "g"),
    underbar_prefix: new RegExp("^_"),
    apply_rules: function(str, rules, skip, override) {
      var ignore, x;
      if (override) {
        str = override;
      } else {
        ignore = skip.indexOf(str.toLowerCase()) > -1;
        if (!ignore) {
          x = 0;
          while (x < rules.length) {
            if (str.match(rules[x][0])) {
              str = str.replace(rules[x][0], rules[x][1]);
              break;
            }
            x++;
          }
        }
      }
      return str;
    }
  };
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(item, fromIndex, compareFunc) {
      var i, index;
      if (!fromIndex) {
        fromIndex = -1;
      }
      index = -1;
      i = fromIndex;
      while (i < this.length) {
        if (this[i] === item || compareFunc && compareFunc(this[i], item)) {
          index = i;
          break;
        }
        i++;
      }
      return index;
    };
  }
  if (!String.prototype._uncountable_words) {
    String.prototype._uncountable_words = InflectionJS.uncountable_words;
  }
  if (!String.prototype._plural_rules) {
    String.prototype._plural_rules = InflectionJS.plural_rules;
  }
  if (!String.prototype._singular_rules) {
    String.prototype._singular_rules = InflectionJS.singular_rules;
  }
  if (!String.prototype._non_titlecased_words) {
    String.prototype._non_titlecased_words = InflectionJS.non_titlecased_words;
  }
  if (!String.prototype.pluralize) {
    String.prototype.pluralize = function(plural) {
      return InflectionJS.apply_rules(this, this._plural_rules, this._uncountable_words, plural);
    };
  }
  if (!String.prototype.singularize) {
    String.prototype.singularize = function(singular) {
      return InflectionJS.apply_rules(this, this._singular_rules, this._uncountable_words, singular);
    };
  }
  if (!String.prototype.camelize) {
    String.prototype.camelize = function(lowFirstLetter) {
      var i, initX, str, str_arr, str_path, x;
      str = this.toLowerCase();
      str_path = str.split("/");
      i = 0;
      while (i < str_path.length) {
        str_arr = str_path[i].split("_");
        initX = (lowFirstLetter && i + 1 === str_path.length ? 1. : 0.);
        x = initX;
        while (x < str_arr.length) {
          str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
          x++;
        }
        str_path[i] = str_arr.join("");
        i++;
      }
      str = str_path.join("::");
      return str;
    };
  }
  if (!String.prototype.underscore) {
    String.prototype.underscore = function() {
      var i, str, str_path;
      str = this;
      str_path = str.split("::");
      i = 0;
      while (i < str_path.length) {
        str_path[i] = str_path[i].replace(InflectionJS.uppercase, "_$1");
        str_path[i] = str_path[i].replace(InflectionJS.underbar_prefix, "");
        i++;
      }
      str = str_path.join("/").toLowerCase();
      return str;
    };
  }
  if (!String.prototype.humanize) {
    String.prototype.humanize = function(lowFirstLetter) {
      var str;
      str = this.toLowerCase();
      str = str.replace(InflectionJS.id_suffix, "");
      str = str.replace(InflectionJS.underbar, " ");
      if (!lowFirstLetter) {
        str = str.capitalize();
      }
      return str;
    };
  }
  if (!String.prototype.capitalize) {
    String.prototype.capitalize = function() {
      var str;
      str = this.toLowerCase();
      str = str.substring(0, 1).toUpperCase() + str.substring(1);
      return str;
    };
  }
  if (!String.prototype.dasherize) {
    String.prototype.dasherize = function() {
      var str;
      str = this;
      str = str.replace(InflectionJS.space_or_underbar, "-");
      return str;
    };
  }
  if (!String.prototype.titleize) {
    String.prototype.titleize = function() {
      var d, i, str, str_arr, x;
      str = this.toLowerCase();
      str = str.replace(InflectionJS.underbar, " ");
      str_arr = str.split(" ");
      x = 0;
      while (x < str_arr.length) {
        d = str_arr[x].split("-");
        i = 0;
        while (i < d.length) {
          if (this._non_titlecased_words.indexOf(d[i].toLowerCase()) < 0) {
            d[i] = d[i].capitalize();
          }
          i++;
        }
        str_arr[x] = d.join("-");
        x++;
      }
      str = str_arr.join(" ");
      str = str.substring(0, 1).toUpperCase() + str.substring(1);
      return str;
    };
  }
  if (!String.prototype.demodulize) {
    String.prototype.demodulize = function() {
      var str, str_arr;
      str = this;
      str_arr = str.split("::");
      str = str_arr[str_arr.length - 1];
      return str;
    };
  }
  if (!String.prototype.tableize) {
    String.prototype.tableize = function() {
      var str;
      str = this;
      str = str.underscore().pluralize();
      return str;
    };
  }
  if (!String.prototype.classify) {
    String.prototype.classify = function() {
      var str;
      str = this;
      str = str.camelize().singularize();
      return str;
    };
  }
  if (!String.prototype.foreign_key) {
    String.prototype.foreign_key = function(dropIdUbar) {
      var str;
      str = this;
      str = str.demodulize().underscore() + (dropIdUbar ? "" : "_") + "id";
      return str;
    };
  }
  if (!String.prototype.ordinalize) {
    String.prototype.ordinalize = function() {
      var i, ld, ltd, str, str_arr, suf, x;
      str = this;
      str_arr = str.split(" ");
      x = 0;
      while (x < str_arr.length) {
        i = parseInt(str_arr[x]);
        if (i === NaN) {
          ltd = str_arr[x].substring(str_arr[x].length - 2);
          ld = str_arr[x].substring(str_arr[x].length - 1);
          suf = "th";
          if (ltd !== "11" && ltd !== "12" && ltd !== "13") {
            if (ld === "1") {
              suf = "st";
            } else if (ld === "2") {
              suf = "nd";
            } else {
              if (ld === "3") {
                suf = "rd";
              }
            }
          }
          str_arr[x] += suf;
        }
        x++;
      }
      str = str_arr.join(" ");
      return str;
    };
  }
}).call(this);
