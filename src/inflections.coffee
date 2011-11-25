window.InflectionJS = null  if window and not window.InflectionJS
InflectionJS =
  uncountable_words: [ "equipment", "information", "rice", "money", "species", "series", "fish", "sheep", "moose", "deer", "news" ]
  plural_rules: [ [ new RegExp("(m)an$", "gi"), "$1en" ], [ new RegExp("(pe)rson$", "gi"), "$1ople" ], [ new RegExp("(child)$", "gi"), "$1ren" ], [ new RegExp("^(ox)$", "gi"), "$1en" ], [ new RegExp("(ax|test)is$", "gi"), "$1es" ], [ new RegExp("(octop|vir)us$", "gi"), "$1i" ], [ new RegExp("(alias|status)$", "gi"), "$1es" ], [ new RegExp("(bu)s$", "gi"), "$1ses" ], [ new RegExp("(buffal|tomat|potat)o$", "gi"), "$1oes" ], [ new RegExp("([ti])um$", "gi"), "$1a" ], [ new RegExp("sis$", "gi"), "ses" ], [ new RegExp("(?:([^f])fe|([lr])f)$", "gi"), "$1$2ves" ], [ new RegExp("(hive)$", "gi"), "$1s" ], [ new RegExp("([^aeiouy]|qu)y$", "gi"), "$1ies" ], [ new RegExp("(x|ch|ss|sh)$", "gi"), "$1es" ], [ new RegExp("(matr|vert|ind)ix|ex$", "gi"), "$1ices" ], [ new RegExp("([m|l])ouse$", "gi"), "$1ice" ], [ new RegExp("(quiz)$", "gi"), "$1zes" ], [ new RegExp("s$", "gi"), "s" ], [ new RegExp("$", "gi"), "s" ] ]
  singular_rules: [ [ new RegExp("(m)en$", "gi"), "$1an" ], [ new RegExp("(pe)ople$", "gi"), "$1rson" ], [ new RegExp("(child)ren$", "gi"), "$1" ], [ new RegExp("([ti])a$", "gi"), "$1um" ], [ new RegExp("((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$", "gi"), "$1$2sis" ], [ new RegExp("(hive)s$", "gi"), "$1" ], [ new RegExp("(tive)s$", "gi"), "$1" ], [ new RegExp("(curve)s$", "gi"), "$1" ], [ new RegExp("([lr])ves$", "gi"), "$1f" ], [ new RegExp("([^fo])ves$", "gi"), "$1fe" ], [ new RegExp("([^aeiouy]|qu)ies$", "gi"), "$1y" ], [ new RegExp("(s)eries$", "gi"), "$1eries" ], [ new RegExp("(m)ovies$", "gi"), "$1ovie" ], [ new RegExp("(x|ch|ss|sh)es$", "gi"), "$1" ], [ new RegExp("([m|l])ice$", "gi"), "$1ouse" ], [ new RegExp("(bus)es$", "gi"), "$1" ], [ new RegExp("(o)es$", "gi"), "$1" ], [ new RegExp("(shoe)s$", "gi"), "$1" ], [ new RegExp("(cris|ax|test)es$", "gi"), "$1is" ], [ new RegExp("(octop|vir)i$", "gi"), "$1us" ], [ new RegExp("(alias|status)es$", "gi"), "$1" ], [ new RegExp("^(ox)en", "gi"), "$1" ], [ new RegExp("(vert|ind)ices$", "gi"), "$1ex" ], [ new RegExp("(matr)ices$", "gi"), "$1ix" ], [ new RegExp("(quiz)zes$", "gi"), "$1" ], [ new RegExp("s$", "gi"), "" ] ]
  non_titlecased_words: [ "and", "or", "nor", "a", "an", "the", "so", "but", "to", "of", "at", "by", "from", "into", "on", "onto", "off", "out", "in", "over", "with", "for" ]
  id_suffix: new RegExp("(_ids|_id)$", "g")
  underbar: new RegExp("_", "g")
  space_or_underbar: new RegExp("[ _]", "g")
  uppercase: new RegExp("([A-Z])", "g")
  underbar_prefix: new RegExp("^_")
  apply_rules: (str, rules, skip, override) ->
    if override
      str = override
    else
      ignore = (skip.indexOf(str.toLowerCase()) > -1)
      unless ignore
        x = 0

        while x < rules.length
          if str.match(rules[x][0])
            str = str.replace(rules[x][0], rules[x][1])
            break
          x++
    str

unless Array::indexOf
  Array::indexOf = (item, fromIndex, compareFunc) ->
    fromIndex = -1  unless fromIndex
    index = -1
    i = fromIndex

    while i < @length
      if this[i] is item or compareFunc and compareFunc(this[i], item)
        index = i
        break
      i++
    index
String::_uncountable_words = InflectionJS.uncountable_words  unless String::_uncountable_words
String::_plural_rules = InflectionJS.plural_rules  unless String::_plural_rules
String::_singular_rules = InflectionJS.singular_rules  unless String::_singular_rules
String::_non_titlecased_words = InflectionJS.non_titlecased_words  unless String::_non_titlecased_words
unless String::pluralize
  String::pluralize = (plural) ->
    InflectionJS.apply_rules this, @_plural_rules, @_uncountable_words, plural
unless String::singularize
  String::singularize = (singular) ->
    InflectionJS.apply_rules this, @_singular_rules, @_uncountable_words, singular
unless String::camelize
  String::camelize = (lowFirstLetter) ->
    str = @toLowerCase()
    str_path = str.split("/")
    i = 0

    while i < str_path.length
      str_arr = str_path[i].split("_")
      initX = (if (lowFirstLetter and i + 1 is str_path.length) then (1) else (0))
      x = initX

      while x < str_arr.length
        str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1)
        x++
      str_path[i] = str_arr.join("")
      i++
    str = str_path.join("::")
    str
unless String::underscore
  String::underscore = ->
    str = this
    str_path = str.split("::")
    i = 0

    while i < str_path.length
      str_path[i] = str_path[i].replace(InflectionJS.uppercase, "_$1")
      str_path[i] = str_path[i].replace(InflectionJS.underbar_prefix, "")
      i++
    str = str_path.join("/").toLowerCase()
    str
unless String::humanize
  String::humanize = (lowFirstLetter) ->
    str = @toLowerCase()
    str = str.replace(InflectionJS.id_suffix, "")
    str = str.replace(InflectionJS.underbar, " ")
    str = str.capitalize()  unless lowFirstLetter
    str
unless String::capitalize
  String::capitalize = ->
    str = @toLowerCase()
    str = str.substring(0, 1).toUpperCase() + str.substring(1)
    str
unless String::dasherize
  String::dasherize = ->
    str = this
    str = str.replace(InflectionJS.space_or_underbar, "-")
    str
unless String::titleize
  String::titleize = ->
    str = @toLowerCase()
    str = str.replace(InflectionJS.underbar, " ")
    str_arr = str.split(" ")
    x = 0

    while x < str_arr.length
      d = str_arr[x].split("-")
      i = 0

      while i < d.length
        d[i] = d[i].capitalize()  if @_non_titlecased_words.indexOf(d[i].toLowerCase()) < 0
        i++
      str_arr[x] = d.join("-")
      x++
    str = str_arr.join(" ")
    str = str.substring(0, 1).toUpperCase() + str.substring(1)
    str
unless String::demodulize
  String::demodulize = ->
    str = this
    str_arr = str.split("::")
    str = str_arr[str_arr.length - 1]
    str
unless String::tableize
  String::tableize = ->
    str = this
    str = str.underscore().pluralize()
    str
unless String::classify
  String::classify = ->
    str = this
    str = str.camelize().singularize()
    str
unless String::foreign_key
  String::foreign_key = (dropIdUbar) ->
    str = this
    str = str.demodulize().underscore() + (if (dropIdUbar) then ("") else ("_")) + "id"
    str
unless String::ordinalize
  String::ordinalize = ->
    str = this
    str_arr = str.split(" ")
    x = 0

    while x < str_arr.length
      i = parseInt(str_arr[x])
      if i is NaN
        ltd = str_arr[x].substring(str_arr[x].length - 2)
        ld = str_arr[x].substring(str_arr[x].length - 1)
        suf = "th"
        if ltd isnt "11" and ltd isnt "12" and ltd isnt "13"
          if ld is "1"
            suf = "st"
          else if ld is "2"
            suf = "nd"
          else suf = "rd"  if ld is "3"
        str_arr[x] += suf
      x++
    str = str_arr.join(" ")
    str