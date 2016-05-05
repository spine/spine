# Karma configuration
# Generated on Wed Mar 09 2016 17:12:47 GMT-0800 (PST)
DEFAULT_JQUERY_VERSION = '2.2.3'
JQUERY_VERSION = process.env.JQUERY_VERSION or DEFAULT_JQUERY_VERSION
JUNIT_DIR = process.env.CIRCLE_TEST_REPORTS or '.junit'

module.exports = (config) ->
  console.log ""
  console.log "Running Spine.js unit tests against jQuery v#{ JQUERY_VERSION }..."
  console.log ""

  config.set

    # base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: ''


    # frameworks to use
    # available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'jasmine-ajax'
      'jasmine'
    ]


    # list of files / patterns to load in the browser
    files: [
      "http://code.jquery.com/jquery-#{ JQUERY_VERSION }.min.js"
      'src/spine.coffee'
      'src/route.coffee'
      'src/relation.coffee'
      'src/manager.coffee'
      'src/local.coffee'
      'src/list.coffee'
      'src/bindings.coffee'
      'src/ajax.coffee'
      'test/*.js'
    ]


    # list of files to exclude
    exclude: [
    ]


    # preprocess matching files before serving them to the browser
    # available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors:
      '**/*.coffee': ['coffee']

    coffeePreprocessor:
      options:
        bare: false
        sourceMap: false


    # test results reporter to use
    # possible values: 'dots', 'progress'
    # available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'junit']

    junitReporter:
      outputDir: "#{ JUNIT_DIR }/jquery-v#{ JQUERY_VERSION }"


    # web server port
    port: 9876


    # enable / disable colors in the output (reporters and logs)
    colors: true


    # level of logging
    # possible values:
    # - config.LOG_DISABLE
    # - config.LOG_ERROR
    # - config.LOG_WARN
    # - config.LOG_INFO
    # - config.LOG_DEBUG
    logLevel: config.LOG_INFO


    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: true


    # start these browsers
    # available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'PhantomJS'
      'Chrome'
      'Firefox'
    ]


    # Continuous Integration mode
    # if true, Karma captures browsers, runs the tests and exits
    singleRun: false

    # Concurrency level
    # how many browser should be started simultaneous
    concurrency: Infinity
