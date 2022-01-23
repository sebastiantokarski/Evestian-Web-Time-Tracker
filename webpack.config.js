module.exports = options => {
  if (options.dev) {
    return require(`./webpack.config.dev.js`);
  }
  return require(`./webpack.config.prod.js`);
};
