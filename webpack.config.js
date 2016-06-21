var webpack = require('webpack');
var path    = require('path');

module.exports = {
    resolve: {
        root: [
            __dirname, path.join(__dirname, 'src/'),
            __dirname, path.join(__dirname, 'test/')
        ],
        alias: {
            // scalejs
            'scalejs.core': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.core.js'),
            'scalejs.sandbox': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.sandbox.js')        
        }
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: [
                    path.join(__dirname, 'src/'),
                    path.join(__dirname, 'test/')
                ],
                exclude: /\.html?$/,
                query: {
                    presets: 'es2015'
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
        ]
    }
}
