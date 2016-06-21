// Karma configuration
var baseConfig = require('./karma.config.base.js');

module.exports = function(config) {
    baseConfig.frameworks = ['mocha', 'chai'];
    baseConfig.reporters = ['dots'];
    baseConfig.logLevel = config.LOG_DEBUG;
    baseConfig.browsers = ['PhantomJS'];
    baseConfig.singleRun = true;
    baseConfig.plugins.push(require('karma-phantomjs-launcher'));

    config.set(baseConfig);
}
