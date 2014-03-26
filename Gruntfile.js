module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n\n'
    },
    concat: {
      dist: {
        files: {
          'backbone.collectionsubset.js': ['lib/backbone.collectionsubset.js'],
          'backbone.collectionsubset.amd.js': ['lib/backbone.collectionsubset.amd.js']
        },
        options: {
          banner: '<%= meta.banner %>'
        }
      }
    },
    preprocess: {
      amd: {
        files: {
          'lib/backbone.collectionsubset.amd.js': 'amd.js'
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'backbone.collectionsubset.min.js': ['lib/backbone.collectionsubset.js'],
          'backbone.collectionsubset.amd.min.js': ['lib/backbone.collectionsubset.amd.js']
        },
        options: {
          banner: '<%= meta.banner %>'
        }
      }
    },
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: ['Gruntfile.js', 'src/**/*.coffee', 'test/**/*.coffee'],
      tasks: ['coffee', 'test']
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {
        exports: true,
        module: false
      }
    },
    coffee: {
      dist: {
        options: {
          bare: false
        },
        files: {
          'lib/backbone.collectionsubset.js': ['src/**/*.coffee']
        }
      },
      test: {
        options: {
          bare: false
        },
        expand: true,
        flatten: true,

        src: ['test/**/*.coffee'],
        dest: 'test',

        ext: '.js',
        extDot: 'last'
      }
    },
    mocha: {
      index: ['test/index.html']
    }
  });

  // Default task.
  grunt.registerTask('default', ['coffee', 'preprocess', 'concat', 'uglify', 'mocha']);
  grunt.registerTask('test', ['coffee', 'mocha']);

  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-mocha');
};
