module.exports = function(grunt) {
  "use strict";

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title %> v<%= pkg.version %>\n' +
            ' *  Copyright\n' +
            ' *  (c) 2010, Brandon Aaron (http://brandonaaron.net)\n'+
            ' *  (c) 2012 - 2013, Alexander Zaytsev (http://hazzik.ru/en)\n' +
            ' *  (c) 2013, Frank Förster (http://frankfoerster.com)\n' +
            ' * Dual licensed under the MIT (MIT_LICENSE.txt)\n'+
            ' * and GPL Version 2 (GPL_LICENSE.txt) licenses.\n' +
            ' */\n',

    concat: {
      options: {
        banner: '<%= banner %>',
        separator: ';'
      },
      build: {
        src: ['src/**/*.js'],
        dest: 'build/jquery.<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: true,
        wrap: false
      },
      build: {
        files: {
          'build/jquery.<%= pkg.name %>.min.js': ['<%= concat.build.dest %>']
        }
      }
    },

    watch: {
      default: {
        files: ['src/**/*.js'],
        tasks: ['concat', 'uglify']
      }
    }

  });

  grunt.registerTask('default', ['concat', 'uglify']);

};
