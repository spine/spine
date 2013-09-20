Spine = @Spine or require('spine')

Spine.Model.Local =
  extended: ->
    @change @saveLocal
    @fetch @loadLocal

  saveLocal: ->
    result = JSON.stringify(@)
    localStorage["#{@className}_timestamp"] = Date.now()
    localStorage[@className] = @compress(result)

  loadLocal: ->
    result = @decompress(localStorage[@className])
    @refresh(result or [], clear: true)

  compress: (s) ->
    out = ""
    s += ' ' if (s.length % 2 != 0)
    for i in [0..s.length] by 2
      out += String.fromCharCode((s.charCodeAt(i)*256) + s.charCodeAt(i+1))

    # Add a snowman prefix to mark the resulting string as encoded
    return String.fromCharCode(9731)+out

  decompress: (s) ->
    out = ''
    # If not prefixed with a snowman, just return the (already uncompressed) string
    return s if (s.charCodeAt(0) != 9731)

    for i in [1..s.length]
      n = s.charCodeAt(i)
      m = Math.floor(n/256)
      out += String.fromCharCode(m, n%256)
    
    return out


module?.exports = Spine.Model.Local