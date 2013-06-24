module.exports = ->
  # Configuration
  @initConfig
    # Lint
    coffeelint:
      source: 'src/**/*.coffee'
      grunt: 'Gruntfile.coffee'

    # Coffee Compiler
    coffee:
      compile:
        files: [
          expand: true
          cwd: 'src'
          src: '**/*.coffee'
          dest: 'lib'
          ext: '.js'
        ]

    # Watch
    watch:
      coffee:
        files: ['src/**/*.coffee']
        tasks: ['coffee:compile']

  # Load grunt task plugins
  @loadNpmTasks 'grunt-coffeelint'
  @loadNpmTasks 'grunt-contrib-watch'
  @loadNpmTasks 'grunt-contrib-coffee'

  # tasks
  @registerTask 'lint', ['coffeelint']
  @registerTask 'build', ['coffee']
  @registerTask 'default', ['lint:source', 'build']