// Karma configuration
// Generated on Tue Jun 14 2016 10:36:16 GMT-0400 (EDT)
var webpackConfig = require('../../webpack.config');

// Add in the istanbul-instrumenter so we can do code coverage on the transpiled files.
webpackConfig.module.postLoaders = [
    {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'istanbul-instrumenter'
    }
]

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha-debug', 'mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      'src/**/*.js',
      'test/tests/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/tests/*.js': ['webpack'],
      'src/**/*.js': ['webpack'],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    coverageReporter: {
        dir: 'test/coverage',
        type: 'html'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    webpack: webpackConfig,
    webpackMiddleware: { noInfo: true },

    plugins: [
        require('karma-webpack'),
        require('karma-mocha'),
        require('karma-mocha-debug'),
        require('karma-chai'),
        require('karma-chrome-launcher'),
        require('karma-coverage')
    ]
  })
}
