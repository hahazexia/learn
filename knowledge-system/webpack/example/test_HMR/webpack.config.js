const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'main.js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, "./src"),
        hot: true,
        open: true,
        host: 'localhost',
        compress: false,
        port: 8100,
    },
    target: 'web',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin()
    ]
}