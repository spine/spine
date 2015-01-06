# Spine
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/spine/spine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://secure.travis-ci.org/spine/spine.png)](http://travis-ci.org/spine/spine)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/spine/spine/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

Spine is a lightweight MVC library for building JavaScript web applications. Spine gives you structure and then gets out of your way, allowing you to concentrate on the fun stuff: building awesome web applications.

Spine is opinionated in its approach to web application architecture and design. Spine's architecture complements patterns such as de-coupled components and CommonJS modules, markedly helping with code quality and maintainability.

The library is written in [CoffeeScript](http://jashkenas.github.com/coffee-script), and though it doesn't necessarily require CoffeeScript to develop applications - you can use whichever language you're most familiar with or prefer - the documentation and some associated tools like [Hem](https://github.com/spine/hem) and [spine.app](https://github.com/spine/spine.app) cater to those who prefer CoffeeScript's syntax.

## Learn it

Documentation is often incomplete or just lies waiting to happen. Approachable source code reduces knowledge dependencies. This is an area where Spine really excells compared to other MVC frameworks. Spine is tiny; The core library comes in at less than 700 lines of CoffeeScript code. It is written in such a way as prefer readability over terseness or clever tricks, and it is small enough that within a rather small timeframe you can understand how all the pieces work together. Expertise is acheivable within days or weeks rather than months or years. For these reasons remaining lightweight and simple is fundamental to Spine.

For documentation, usage, and examples, see: [spinejs.com](http://spinejs.com)

The test suite can also occasionsly provide additional useful examples, especially if you are looking for non-coffeescript examples.

# Contributing

## Reporting issues

To file a bug report, please visit the [GitHub issues page](https://github.com/spine/spine/issues).  It's great if you can attach code (test cases and fixes for bugs, and test cases and a proposed implementation for features), but reproducible bug reports are also welcome. 

For support or help with using spine please use the [Spine Google Group](https://groups.google.com/forum/#!forum/spinejs) and/or StackOverflow rather than opening an issue on Github. If you post in those places you are more likely to get more people to chime in, and others can benefit from it more readily.

## Cloning master and running the test suite

To get started contributing to Spine, first clone the repository and make sure you can run the test suite.  If you're not familiar with Git, visit the [Git homepage](http://git-scm.com) to download Git for your platform.

First, clone the repository:

```
$ git clone git://github.com/spine/spine.git
$ cd spine
```

Next, open `test/index.html` to run the [Jasmine](http://pivotal.github.com/jasmine/) test suite for spine core.  If you see all the tests passing, you're ready to contribute!

## Contributing to the Spine documentation

Perhaps the easiest way to get started with contributing is through the docs.  If you find typos, bugs, or omissions in the docs, please submit a pull request to fix.  The Spine website [spinejs.com](http://spinejs.com), which is the primary documentation, is a very simple rails app [spine.site](https://github.com/spine/spine.site). You don't need to know Rails or Ruby to contribute. The vast majority of it is in Markdown

## Contributing to the Spine code

This recommended contribution process is based on the [Ruby on Rails contribution guide](http://edgeguides.rubyonrails.org/contributing_to_ruby_on_rails.html#contributing-to-the-rails-code).  In general, please include tests with new features or bugfixes, work in a feature branch until you're ready to submit or discuss your code, then fork the repository, push to your fork, and issue a pull request.

### CoffeeScript

When submitting a pull request for code, please submit in CoffeeScript. Building the effected js files is required for testing sake, but submitting those js files is optional.

Start by installing local dev dependencies:

```
$ npm install .
```

Then use the provided build scripts to compile your CoffeeScript files:

```
$ cake build
$ cake watch
```

These tasks use a locally installed copy of CoffeeScript to ensure all contributors use the same version of the compiler.

### Git

Let's say I'm going to submit a patch to add someFeatureFix:

```
$ git checkout dev
```

Feature branches should start from `dev` **not** `master`. If you branch off of, or do builds on the master branch you will get CoffeeScript source map files, which are cool, but tend to ruin automatic merges with git.

```
$ git checkout -b someFeatureFix
$ vim test/...
  # (...add tests...)
$ cake watch
  # (...this should recompile and changes you make in your CoffeeScript...)

-- figure out what spine module your changes belong in
$ vim src/spine.coffee
or
$ vim src/[otherSpineComponent].coffee
  # (...add the feature/fix...)
$ open test/index.html
  # (...make sure tests run for each component that was changed...)
  # (...test in other browsers with various jquery versions if you feel like there is risk... )
$ git commit -m "Add Some Feature Fix"
```

Then, [fork the Spine repository](https://github.com/spine/spine/fork), and push your branch to your fork:

```
$ git remote add <your user name> git@github.com:<your user name>/spine.git
$ git push <your user name> someFeatureFix
```

Finally, issue a pull request from inside the GitHub interface to the `dev` branch of spine, and your contribution is ready for consideration, discussion, and (hopefully) merging in!
