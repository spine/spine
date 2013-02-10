fs      = require 'fs'
path    = require 'path'
{print} = require 'util'
{spawn} = require 'child_process'

testCodes  = []
basejQuery = '1.8'

task 'build', 'Build lib/ from src/', ->
  build()

task 'watch', 'Watch src/ for changes', ->
  coffee = spawn 'coffee', ['-w', '-c', '-o', 'lib', 'src']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()

task 'test', 'Run Jasmine specs using PhantomJS', ->
  build -> jQuery basejQuery, test

task 'test:all', 'Run tests using all jQuery versions', ->
  try
    build -> jQuery '1.8', test -> jQuery '1.7', test -> jQuery '1.6', test -> jQuery basejQuery
  catch error
    jQuery basejQuery

task 'test:jquery18', 'Run tests using jQuery 1.8', ->
  build -> jQuery '1.8', test -> jQuery basejQuery

task 'test:jquery17', 'Run tests using jQuery 1.7', ->
  build -> jQuery '1.7', test -> jQuery basejQuery

task 'test:jquery16', 'Run tests using jQuery 1.6', ->
  build -> jQuery '1.6', test -> jQuery basejQuery

build = (callback) ->
  coffee = spawn 'coffee', ['-c', '-o', 'lib', 'src']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()
  coffee.on 'exit', (code) ->
    callback?() if code is 0

test = (callback) ->
  testDir = './test'
  testFiles = (file for file in fs.readdirSync testDir when /.*\.html$/.test(file))
  remaining = testFiles.length
  for file in testFiles
    filePath = fs.realpathSync "#{testDir}/#{file}"
    phantomjs = spawn 'phantomjs', ['test/lib/run-jasmine.phantom.js', "file://#{filePath}"]
    phantomjs.stdout.on 'data', (data) -> 
      print data.toString()
    phantomjs.on 'exit', (code) ->
      testCodes.push code
      callback?() if --remaining is 0
  exitWithTestsCode()

jQuery = (version, callback) ->
  console.log "Using jQuery #{version}..."
  process.chdir 'test/lib'
  fs.unlinkSync 'jquery.js'
  fs.symlinkSync "jquery-#{version}.js", 'jquery.js'
  process.chdir '../..'
  callback?()

exitWithTestsCode = ->
  process.once 'exit', ->
    passed = testCodes.every (code) -> code is 0
    process.exit if passed then 0 else 1  
  exitWithTestsCode = ->

