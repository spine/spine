js = $(patsubst %.coffee,%.js,$(addprefix lib/,$(notdir $(wildcard src/*.coffee))))

.PHONY: build
build: $(js) test

lib/%.js: src/%.coffee
	@test -d $(@D) || mkdir $(@D)
	coffee --compile --print $< > $@

.PHONY: test
test: build
	$(MAKE) -C $@

.PHONY: test-run
test-run: test
	$(MAKE) -C test run

.PHONY: clean
clean:
	rm -Rf lib
	$(MAKE) -C test clean