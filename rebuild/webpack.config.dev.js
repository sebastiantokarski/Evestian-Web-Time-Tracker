const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const SRC_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'dev');

module.exports = {
    entry: {
        'background/background': path.resolve(__dirname, 'src/background/background.js'),
        'popup/popup': path.resolve(__dirname, 'src/popup/popup.js')
    },
    output: {
        filename: '[name].js',
        path: BUILD_DIR
    },
    watch: true,
    mode: "development", 
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["env", {
                            targets: {
                                browsers: ['> 1%']
                            }
                        }]]
                    }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin([{
            from: 'manifest.json'
        }, {
            from: 'src/assets/',
            to: 'assets'
        }, {
            from: '_locales/',
            to: '_locales'
        }])
    ],
}