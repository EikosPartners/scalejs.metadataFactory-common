var webpack = require('webpack');
var path = require('path');
var webpackConfig = require('./webpack.config');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

webpackConfig.entry = [
    path.resolve(__dirname, 'src/scalejs.metadataFactory-common.js')
];

webpackConfig.module.loaders =  webpackConfig.module.loaders.concat([
    {
        test: [
            path.join(__dirname, 'node_modules/scalejs'),
            path.join(__dirname, 'node_modules/datatables-epresponsive')
        ],
        loader: 'source-map-loader'
    }
]).map(function (loader) {
    if (typeof loader.loader === 'string' && loader.loader.indexOf('style-loader!') === 0) {
        loader.loader = ExtractTextPlugin.extract('style-loader', loader.loader.replace('style-loader!', ''));
    }
    return loader;
});

webpackConfig.output = {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/build/',
    filename: 'bundle.js'
};

webpackConfig.plugins = (webpackConfig.plugins || []).concat([
    new ExtractTextPlugin('main.css'),
    new webpack.ProvidePlugin({
       $: "jquery",
       jQuery: "jquery"
   })
]);

webpackConfig.devtool = 'source-map';

module.exports = webpackConfig;
