var system = require('system');

//
// Wait until the test condition is true or a timeout occurs.
//
// If timeout but condition still falsy: exit(1)
//

var waitFor = (function () {

    function getTime() {
        return (new Date).getTime();
    }

    return function (test, doIt, duration) {
        duration || (duration = 3000);

        var start = getTime(),
            finish = start + duration,
            int;

        function looop() {
            var time = getTime(),
                timeout = (time >= finish),
                condition = test();

            // No more time or condition fulfilled
            if (condition) {
                doIt(time - start);
                clearInterval(int);
            }

            // THEN, no moretime but condition unfulfilled
            if (timeout && !condition) {
                console.log("ERROR - Timeout for page condition.")
                phantom.exit(1);
            }
        }

        int = setInterval(looop, 1000 / 60);
    };
}());

if (system.args.length < 2 || system.args.length > 3) {
    console.log('Usage: run-jasmine.phantom.js URL [formatter]');
    phantom.exit(1);
}

var page = require('webpage').create();

// print console.log output from the webpage
page.onConsoleMessage = function(msg, lineNum, sourceId) {
    //console.log(msg);
};

// page callback, kind of a hackish way to only allow our phantom 
// script to make use of console.log so we only see test results.
page.onCallback = function(msg) {
    console.log(msg);
}

page.open(system.args[1], function (status) {
    if (status !== "success") {
        console.log("Cannot open URL");
        phantom.exit(1);
    }

    waitFor(function () {
        return page.evaluate(function () {
            return document.body.querySelector(".duration");
        });
    }, function (t) {
        var passed;
        passed = page.evaluate(function (formatter) {

            var formatColors = (function () {
                function indent(level) {
                    var ret = '';
                    for (var i = 0; i < level; i += 1) {
                        ret = ret + '  ';
                    }
                    return ret;
                }

                function tick(el) {
                    return $(el).is('.passed') ? '\033[32m✓\033[0m' : '\033[31m✖';
                }

                function desc(el, strong) {
                    strong || (strong = false);

                    var ret;
                    ret = $(el).find('> .description').text();
                    if (strong) {
                        ret = '\033[1m' + ret;
                    }

                    return ret;
                }

                return function (el, level, strong) {
                    if (typeof el == 'number') {
                        var results= "-------------------------------------\n";
                        results += "\033[32m✓\033[0m\033[1m Passed: \033[0m" + el;
                        if (level > 0) {
                          results += "\n\033[31m✖ \033[0m\033[1mFailed: \033[0m" + level;
                        }
                        return results
                    } else {
                      return '\033[1m' + indent(level) + tick(el) + ' ' + desc(el, strong);
                    }
                };
            }());

            var errorsOnly = (function () {
                function indent(level) {
                    var ret = '';
                    for (var i = 0; i < level; i += 1) {
                        ret = ret + '  ';
                    }
                    return ret;
                }

                function desc(el) {
                    return $(el).find('> .description').text();
                }

                function tick(el) {
                    return $(el).is('.passed') ? '✓ ' : '✖ ';
                }


                return function (el, level, strong) {
                    if (typeof el == 'number') {
                      return "Passed: " + el + ", Failed: " + level;
                    } else {
                      if (!$(el).is(".passed")) {
                        return indent(level) + tick(el) + desc(el);
                      } else {
                        return ""
                      }
                    }
                };
            }());

            // ability to request different type of outputs, default to formatColors
            try {
              format = eval(formatter || "formatColors")
            } catch(ex) {
              format = formatColors
            }

            function printSuites(root, level) {
                level || (level = 0);
                $(root).find('div.suite').each(function (i, el) {
                    var output = "\n" + format(el, level, true)
                    if (output && $(el).parents('div.suite').length == level) {
                      window.callPhantom(output);
                      printSpecs(el, level + 1);
                    }
                    printSuites(el, level + 1);
                });
            }

            function printSpecs(root, level) {
                level || (level = 0);
                $(root).find('> .specSummary').each(function (i, el) {
                    var output = format(el, level);
                    if (output) {
                      window.callPhantom(output);
                    }
                });
            }

            printSuites($('div.jasmine_reporter'));

            // handle fails
            var fails  = document.body.querySelectorAll('div.jasmine_reporter div.specSummary.failed');
            var passed = document.body.querySelectorAll('div.jasmine_reporter div.specSummary.passed');
            window.callPhantom(format(passed.length, fails.length));
            return fails.length === 0;
        }, system.args.length === 3 ? system.args[2] : undefined);

        phantom.exit(passed ? 0 : 1);
    });
});
