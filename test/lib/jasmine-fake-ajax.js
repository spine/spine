(function($, jasmine) {
  function _initContext(options) {
    this.urls = options.urls
    this.recordedSession = new RecordedSession()
  }

  function _loadTestData(selector, url) {
    var fixture
    jasmine.FakeAjax.realAjax({
      url: url,
      async: false,
      success: function(data) {
        fixture = data
      },
      error: function() {
        logAndThrow("Failed loading test data by url '" + url + "'.")
      }
    })
    var testDataContainer = $(fixture).find(selector)
    if (testDataContainer.length > 0) {
      return testDataContainer.html()
    } else {
      logAndThrow("Failed loading test data by selector '" + selector + "' from url '" + url + "'. Whole fixture: " + fixture)
      return null // to get rid of IDE warning, this line is unreachable
    }
  }

  function _latestAjax() {
    var ajaxCalls = jasmine.FakeAjax.recordedSession.ajaxCalls
    if (ajaxCalls.length === 0) {
      logAndThrow("Ajax hasn't yet been called in spec '" + jasmine.getEnv().currentSpec.description + "'.")
      return null // to get rid of IDE warning, this line is unreachable
    } else {
      return lastWithUrlDecoded(ajaxCalls)
    }
  }

  function _latestAjaxWithUrlMatching(partialUrl) {
    var matchingAjaxCalls = $(jasmine.FakeAjax.recordedSession.ajaxCalls).filter(function(index, ajaxOptions) {
      return ajaxOptions.url.match(partialUrl)
    })
    if (matchingAjaxCalls.length === 0) {
      logAndThrow("Matching url was not found by partial url '" + partialUrl + "' in spec '" + jasmine.getEnv().currentSpec.description + "'.")
      return null // to get rid of IDE warning, this line is unreachable
    } else {
      return lastWithUrlDecoded(matchingAjaxCalls)
    }
  }

  function lastWithUrlDecoded(ajaxOptions) {
    var last = ajaxOptions[ajaxOptions.length - 1]
    last.url = $.URLDecode(last.url)
    return last
  }

  function logAndThrow(errorMessage) {
    jasmine.FakeAjax.log.error(errorMessage)
    throw errorMessage
  }

  function RecordedSession() {
    this.ajaxCalls = []

    this.addAjaxCall = function(ajaxOptions) {
      this.ajaxCalls.push(ajaxOptions)
    }
  }

  function Logger() {
    this.error = function(message) {
      withFirebugConsole(function(c) {
        c.error(message)
        debugger
      })
    }

    this.warn = function(message) {
      withFirebugConsole(function(c) {
        c.warn(message)
      })
    }

    function withFirebugConsole(callback) {
      if (window.console) {
        callback(window.console)
      }
    }
  }

  jasmine.FakeAjax = {
    realAjax: $.ajax,
    initContext: _initContext,
    loadTestData: _loadTestData,
    latestAjax: _latestAjax,
    latestAjaxWithUrlMatching: _latestAjaxWithUrlMatching,
    log: new Logger()
  }

  $.ajax = function(options) {
    var context = options.context
    jasmine.FakeAjax.recordedSession.addAjaxCall(options)
    if (options.beforeSend) {
      options.beforeSend()
    }
    var urls = jasmine.FakeAjax.urls
    if (!urls) {
      jasmine.FakeAjax.log.warn("There are no ajax url mappings defined. Actual ajax url was '" + options.url + "'.")
    } else if (!urls[options.url]) {
      jasmine.FakeAjax.log.warn("Applying default success data for url '" + options.url + "' in spec '" + jasmine.getEnv().currentSpec.description + "'.")
      if (!options.success) {
        logAndThrow("Ajax success handler is not defined in system under test for url '" + options.url + "'. See firebug script stack for more info.")
      } else {
        options.success.call(context, "default success data")
      }
    } else if (urls[options.url].successData) {
      options.success.call(context, urls[options.url].successData)
    } else if (urls[options.url].errorMessage) {
      options.error.call(context, {responseText: urls[options.url].errorMessage})
    } else {
      logAndThrow("Unknown mapping value for url '" + options.url + "'. Expected either successData or errorMessage. Actual was '" + urls[options.url] + "'")
    }
    if (options.complete) {
      options.complete.call(context)
    }
  }
})(jQuery, jasmine)

function fakeAjax(options) { jasmine.FakeAjax.initContext(options) }
function clearContext() { fakeAjax({}) }
function loadTestData(selector, url) { return jasmine.FakeAjax.loadTestData(selector, url) }
function latestAjax() { return jasmine.FakeAjax.latestAjax() }
function latestAjaxWithUrlMatching(partialUrl) { return jasmine.FakeAjax.latestAjaxWithUrlMatching(partialUrl) }

beforeEach(clearContext)
