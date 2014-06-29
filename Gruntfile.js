'use strict';

function middleware() {
  return function(connect, options) {
    var middlewares = [];
    var directory = options.directory || options.base[options.base.length - 1];

    if (!Array.isArray(options.base)) {
      options.base = [options.base];
    }

    options.base.forEach(function(base) {
      // Serve static files.
      middlewares.push(connect.static(base));
    });

    // Make directory browse-able.
    middlewares.push(connect.directory(directory));

    return middlewares;
  };
}

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    clean: {
      build: {
        files: [{
          dot: true,
          src: [
            'build/',
          ]
        }]
      },
      debug: {
        files: [{
          dot: true,
          src: [
            'debug/',
          ]
        }]
      },
      dist: {
        files: [{
          dot: true,
          src: [
            'dist/',
          ]
        }]
      },
      e2e: {
        files: [{
          dot: true,
          src: [
            'e2e/',
            'screenshots/*'
          ]
        }]
      },
    },

    concat: {},

    connect: {
      options: {
        hostname: '0.0.0.0',
      },
      dev: {
        options: {
          port: 8888,
          base: './app',
          middleware: middleware()
        }
      },
      screenshots: {
        options: {
          port: 5556,
          base: './screenshots/',
          middleware: middleware(),
          keepalive: true
        }
      },
      e2e: {
        options: {
          port: 5557,
          base: './e2e',
          middleware: middleware()
        }
      }
    },

    copy: {
      debug: {
        files: [{
          expand: true,
          cwd: 'app/',
          dest: 'debug/',
          src: [
            '**/*'
          ]
        }]
      },
      build: {
        files: [{
          expand: true,
          cwd: 'app/',
          dest: 'build/',
          src: [
            'index.html'
          ]
        }, {
          expand: true,
          cwd: 'app/lib/bootstrap/dist',
          dest: 'build/',
          src: [
            'fonts/*'
          ]
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'app/lib/bootstrap/dist',
          dest: 'dist/',
          src: [
            'fonts/*'
          ]
        }]
      },
      e2e: {
        files: [{
          expand: true,
          cwd: 'app/',
          dest: 'e2e/',
          src: [
            '**/*',
          ]
        }]
      }
    },

    cssmin: {
      dist: {
        expand: true,
        cwd: 'build/',
        src: ['*.css', '!*.min.css'],
        dest: 'dist/'
      }
    },

    html2js: {
      options: {
        base: 'app/',
        module: 'oep.templates'
      },
      build: {
        src: ['app/**/*.html'],
        dest: 'build/app-templates.js'
      },
    },

    htmlmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'build',
          src: ['*.html', 'views/**/*.html'],
          dest: 'dist'
        }]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      all: [
        'Gruntfile.js',
        'app/**/*.js',
        '!app/lib/**/*'
      ]
    },

    karma: {
      unit: {
        configFile: 'config/karma.conf.js',
        singleRun: true
      },
      autoUnit: {
        configFile: 'config/karma.conf.js',
        autoWatch: true,
        singleRun: false
      }
    },

    protractor: {
      options: {
        seleniumAddress: '0.0.0.0',
        seleniumPort: 4444,
        keepAlive: false,
        noColor: false,
      },
      chrome: {
        options: {
          // debug: true,
          configFile: 'config/e2e.chrome.conf.js',
          args: {
            specs: ['e2e/*/*.e2e.specs.js']
          }
        }
      },
      phantomjs: {
        options: {
          configFile: 'config/e2e.phantomjs.conf.js',
          args: {
            specs: ['e2e/*/*.e2e.specs.js']
          }
        }
      },
    },

    'protractor_webdriver': {
      e2e: {
        options: {
          command: './node_modules/.bin/webdriver-manager start'
        }
      }
    },

    rev: {
      dist: {
        files: {
          src: [
            'dist/**/*.js',
            'dist/**/*.css',
            'dist/fonts/*'
          ]
        }
      }
    },

    shell: {
      options: {
        stdout: true,
        stderr: true
      },
      'npm_install': {
        command: 'npm install'
      },
      'npm_post_install': {
        command: [
          './node_modules/.bin/bower install',
          './node_modules/.bin/webdriver-manager update'
        ].join(';')
      }
    },

    'string-replace': {
      build: {
        options: {
          replacements: [{
            pattern: /\.\.\/fonts\//g,
            replacement: './fonts/'
          }, {
            pattern: /\.\.\/img\//g,
            replacement: './fonts/'
          }]
        },
        files: {
          'build/vendor.css': 'build/vendor.css',
          'build/app.css': 'build/app.css',
        }
      }
    },

    targethtml: {
      debug: {
        files: {
          'debug/index.html': 'debug/index.html'
        }
      },
      build: {
        files: {
          'build/index.html': 'build/index.html'
        }
      },
      e2e: {
        files: {
          'e2e/index.html': 'e2e/index.html'
        }
      }
    },

    uglify: {
      dist: {
        expand: true,
        cwd: 'build/',
        src: ['*.js', '!*.min.js'],
        dest: 'dist/'
      }
    },

    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'build/',
        flow: {
          html: {
            steps: {
              'js': ['concat'],
              'css': ['concat']
            },
            post: {}
          }
        }
      }
    },

    usemin: {
      html: ['build/**/*.html', 'dist/**/*.html'],
      css: ['build/**/*.css', 'dist/**/*.css'],
    },

    watch: {
      app: {
        files: [
          'app/**/*',
          '!app/lib/**/*'
        ],
        tasks: ['jshint']
      },
      build: {
        files: [
          'app/**/*',
          '!app/lib/**/*'
        ],
        tasks: ['build']
      },
      e2e: {
        files: [
          'app/**/*',
          '!app/lib/**/*'
        ],
        tasks: ['e2e:assets', 'protractor:dev']
      }
    },

  });

  grunt.registerTask('debug', [
    'jshint',
    'clean:debug',
    'copy:debug',
    'targethtml:debug'
  ]);

  grunt.registerTask('e2e:assets', [
    'jshint',
    'clean:e2e',
    'copy:e2e',
    'targethtml:e2e',
  ]);

  grunt.registerTask('build:assets', [
    'jshint',
    'clean:build',
    'useminPrepare',
    'concat',
    'string-replace:build',
    'html2js:build',
    'copy:build',
    'targethtml:build',
  ]);
  grunt.registerTask('build', ['build:assets', 'rev', 'usemin']);

  grunt.registerTask('dist', [
    'build:assets',
    'clean:dist',
    'copy:dist',
    'htmlmin',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('test', ['test:unit', 'test:e2e']);
  grunt.registerTask('test:unit', ['jshint', 'karma:unit']);
  grunt.registerTask('test:e2e', [
    'e2e:assets',
    'connect:e2e',
    'protractor_webdriver:e2e',
    'protractor:phantomjs'
  ]);

  grunt.registerTask('autotest:unit', ['jshint', 'karma:autoUnit']);
  grunt.registerTask('autotest:e2e', [
    'e2e:assets',
    'connect:e2e',
    'protractor:chrome'
  ]);

  grunt.registerTask('dev', ['connect:dev', 'watch:app']);

  grunt.registerTask('default', ['test', 'build', 'server:dev']);

};