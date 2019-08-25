const path = require('path');
const ReplacePlugin = require('webpack-plugin-replace');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'dev');

module.exports = {
  entry: {
    contentscript: path.resolve(__dirname, 'src/contentscript/index.js'),
    background: path.resolve(__dirname, 'src/background/index.js'),
    hotReload: path.resolve(__dirname, 'src/background/hot-reload.js'),
    popup: path.resolve(__dirname, 'src/popup/app.js'),
  },
  output: {
    filename: (chunkData) => {
      switch (chunkData.chunk.name) {
        case 'hotReload':
          return 'background/hot-reload.js';
        case 'popup':
            return '[name]/app.js';
        default:
          return '[name]/index.js';
      }
    },
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
    }, {
      test: /\.svg$/,
      use: {
        loader: 'svg-url-loader'
      }
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
      from: 'manifest.dev.json',
      to: 'manifest.json',
    }, {
      from: 'assets/',
      to: 'assets',
    }, {
      from: '_locales/',
      to: '_locales',
    }, {
      from: 'src/popup/index.html',
      to: 'popup',
    }]),
    new ReplacePlugin({
      include: [
        'manifest.dev.json',
        'manifest.prod.json',
        'package.json'
      ],
      values: {
        __VERSION__: '123'
      }
    })
  ],
}
