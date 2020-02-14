const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './js/main.js',
    output: {
        path: path.resolve( __dirname, 'build' ),
        filename: './bundle.js',
        library: 'cymine',
        libraryTarget: 'var'
    },
    mode: 'development',
    devtool: 'inline-sourcemap',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: (/node_modules/, /bower_components/),
                use: [
                    {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                      }
                    },
                    {
                        loader: 'shebang-loader'
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [ 
                    "style-loader",
                    "css-loader",
                    "less-loader",
                ]
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            }
        ],
        },
    plugins: [ 
        new MiniCssExtractPlugin({
            filename: "/build/style.css"
        }),
    ],
    watch: true
  }
