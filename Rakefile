require "rdiscount"

task :generate do
  text = File.read("site/site.md")
  html = RDiscount.new(text).to_html
  File.open("index.html", "w+") do |io|
    io.write(%{
<!DOCTYPE html>
<html>
<head>
  <title>Spine</title>
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

task :compile do
  # TODO - yui-compressor
end

task :default => :generate