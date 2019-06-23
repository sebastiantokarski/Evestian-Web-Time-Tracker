const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const SRC_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'dev');

module.exports = {
  entry: {
    contentscript: path.resolve(__dirname, 'src/contentscript/contentscript.js'),
    background: path.resolve(__dirname, 'src/background/background.js'),
    popup: path.resolve(__dirname, 'src/popup/popup.js'),
  },
  output: {
    filename: '[name]/[name].js',
    path: BUILD_DIR,
  },
  watch: true,
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
      options: {
        emitWarning: true,
        configFile: './eslintrc.json',
      }
    }, {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
          ]
        }
      }
    }, {
      test: /\.scss$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        },
      }]
    }, {
      test: /\.css$/,
      include: /node_modules/,
      loaders: ['style-loader', 'css-loader'],
    }]
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanAfterEveryBuildPatterns: [
        '!*/**/*',
        '!manifest.json',
      ],
    }),
    new CopyWebpackPlugin([{
      from: 'manifest.json',
    }, {
      from: 'assets/',
      to: 'assets',
    }, {
      from: '_locales/',
      to: '_locales',
    }, {
      from: 'src/popup/popup.html',
      to: 'popup',
    }])
  ],
}
