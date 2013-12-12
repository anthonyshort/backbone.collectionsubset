module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    coffee:
      compile:
        files:
          "<%= pkg.name %>.js": "src/<%= pkg.name %>.coffee"

    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"yyyy-mm-dd\") %> */\n"

      build:
        src: "<%= pkg.name %>.js"
        dest: "<%= pkg.name %>.min.js"

    mochaTest:
      test:
        options:
          reporter: 'spec'
        src: ['test/**/*.js']

  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-mocha-test"
 

  grunt.registerTask "default", ["coffee", "mochaTest"]
  grunt.registerTask "test", ["mochaTest"]
  grunt.registerTask "build", ["coffee", "uglify"]

  