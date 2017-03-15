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

            'jquery-ui/autocomplete':  path.join(__dirname, 'node_modules/jquery-ui/ui/widgets/autocomplete.js')
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
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!autoprefixer-loader!sass-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader!autoprefixer-loader'
            },
            {
                test: /\.woff|\.woff2|\.svg|.eot|\.png|\.jpg|\.ttf/,
                loader: 'url-loader?prefix=font/&limit=10000'
            }
        ]

    },
    devtool: 'source-map'
}
