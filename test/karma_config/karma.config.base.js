// Base karma configuration to share between configs.
var webpackConfig = require('../../webpack.config');
webpackConfig.devtool = 'inline-source-map';
webpackConfig.entry = {};

module.exports = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha-debug', 'mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
        //'src/**/*.js',
        'src/**/*.html',
        'test/tests/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'test/tests/*.js': ['webpack', 'sourcemap'],
        'src/**/*.js': ['webpack', 'sourcemap']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,

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
        require('karma-sourcemap-loader')
    ]
}
