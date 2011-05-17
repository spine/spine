require "rdiscount"

task :generate do
  text = File.read("site/site.md")
  html = RDiscount.new(text).to_html
  File.open("index.html", "w+") do |io|
    io.write(%{
<!DOCTYPE html>
<html>
<head>
  <meta charset=utf-8>
  <title>Spine</title>
  <meta name="description" content="Spine is a lightweight MVC framework for building JavaScript applications.">
  <meta name="keywords" content="spine,javascript,mvc,framework,backbone,node,web,app">
  <link rel="stylesheet" href="site/site.css" type="text/css" charset="utf-8">
  <link rel="stylesheet" href="site/highlight.css" type="text/css" charset="utf-8">
  <script src="site/jquery.js" type="text/javascript" charset="utf-8"></script>      
  <script src="spine.js" type="text/javascript" charset="utf-8"></script>      
  <script src="site/highlight.js" type="text/javascript" charset="utf-8"></script>
  <script type="text/javascript" charset="utf-8">
    hljs.initHighlightingOnLoad();
  </script>
</head>
<body>
<div id="container">#{html}</div>
</body>
</html>
    })
  end
end

task :build do
  require "yui/compressor"
  require "fileutils"
  
  compressor = YUI::JavaScriptCompressor.new(:munge => true)
  File.open("spine.min.js", "w+") do |output|
    File.open("spine.js", "r") do |input|
      compressor.compress(input) do |compressed|
        while buffer = compressed.read(4096)
          output.write(buffer)
        end
      end
    end
  end
end

task :default => :generate