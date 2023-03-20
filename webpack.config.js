const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        // move bundle.js to a folder instead the root
        path: path.resolve('./build'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve('./index.js'),
                loader: 'babel-loader',
                exclude: /node_modules/,
            }
        ]
    },
    plugins: [
        // New plugin
        new HtmlWebpackPlugin({
            // injects bundle.js to our new index.html
            inject: true,
            // copys the content of the existing index.html to the new /build index.html
            template:  path.resolve('./src/index.html'),
        }),

    ]
}