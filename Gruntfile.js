module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['lib/<%= pkg.name %>.umd.js'],
        dest: '<%= pkg.name %>.js',
      }
    },
    uglify: {
      dist: {
        options: {
          preserveComments: true,
        },
        files: [{
          // expand: true,
          src: '<%= pkg.name %>.js',
          dest: '<%= pkg.name %>.min.js'
        }]
      }
    },
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: ['grunt.js', 'src/**/*.coffee', 'test/**/*.coffee'],
      tasks: 'coffee test'
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
      app: {
        expand: true,
        cwd: 'src',
        src: ['*.coffee'],
        dest: 'lib/',
        ext: '.js',
        extDot: 'last',
        options: {
          bare: false
        }
      },
      test: {
        expand: true,
        cwd: 'test',
        src: ['*.coffee'],
        dest: 'test/',
        ext: '.js',
        extDot: 'last',
        options: {
          bare: true
        }
      }
    },
    umd: {
        dist: {
            options: {
                src: ['lib/<%= pkg.name %>.js'],
                dest: 'lib/<%= pkg.name %>.umd.js',
                template: 'umd',
                deps: { // optional, `default` is used as a fallback for rest!
                    'default': ['backbone', 'underscore']
                }
            }
        }
    },
    mocha: {
      index: ['test/index.html']
    }
  });

  // Default task.
  grunt.registerTask('default', ['coffee', 'umd', 'concat', 'uglify', 'mocha']);
  grunt.registerTask('test', ['coffee', 'mocha']);
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-umd');
  grunt.loadNpmTasks('grunt-mocha');

};
