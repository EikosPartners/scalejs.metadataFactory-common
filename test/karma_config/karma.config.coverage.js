// Karma configuration
var baseConfig = require('./karma.config.base.js');

// Add in the istanbul-instrumenter so we can do code coverage on the transpiled files.
baseConfig.webpack.module.postLoaders = [
    {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'istanbul-instrumenter'
    }
]

module.exports = function(config) {
    baseConfig.logLevel = config.LOG_INFO;
    baseConfig.singleRun = true;

    baseConfig.reporters.push('coverage');
    baseConfig.coverageReporter = {
        dir: 'test/coverage',
        type: 'html'
    };
    baseConfig.plugins.push(require('karma-coverage'));
    config.set(baseConfig);
}
