const path = require('path');
const ReplacePlugin = require('webpack-plugin-replace');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

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
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]',
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-url-loader',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanAfterEveryBuildPatterns: ['!*/**/*', '!manifest.json'],
    }),
    new ESLintPlugin({
      emitWarning: true,
      overrideConfigFile: './eslintrc.json',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.dev.json', to: 'manifest.json' },
        { from: 'assets/', to: 'assets' },
        { from: '_locales/', to: '_locales' },
        { from: 'src/popup/index.html', to: 'popup' },
      ],
    }),
    new ReplacePlugin({
      include: ['manifest.dev.json', 'manifest.prod.json', 'package.json'],
      values: {
        __VERSION__: '123',
      },
    }),
  ],
};
