specs = $(patsubst %.coffee,%.js,$(addprefix specs/,$(notdir $(wildcard specs/src/*.coffee))))
html = $(wildcard *.html)

.PHONY: build
build: $(specs)

specs/%.js: specs/src/%.coffee
	coffee --compile --print $< > $@

.PHONY: run
run: build $(html)

%.html: FORCE
	phantomjs lib/run-jasmine.phantom.js file://$(CURDIR)/$@

.PHONY: clean
clean:
	rm -Rf specs/*.js

FORCE: