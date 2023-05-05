const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve('./build'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve('./index.js'),
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: './style.css',
            ignoreOrder: true,
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve('./src/index.html'),
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: './src/data', to: 'data' }],
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'build'),
        },
        compress: true,
        port: 9001,
        watchFiles: ['build/data/**/*'],
    },
};
