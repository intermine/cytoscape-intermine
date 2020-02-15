const path = require('path');

module.exports = {
    watch: true,
    entry: {
        main: './js/main.js',
    },
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
                test: /\.js$/i,
                exclude: (/node_modules/, /bower_components/),
                use: {loader: 'shebang-loader'}
                
            },
            {
                test: /\.less$/i,
                exclude: /node_modules/,
                use: [ 
                    'style-loader',
                    'css-loader', 
                    'less-loader'
                ],
                
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            }
        ],
        },
    plugins: [],
  }
