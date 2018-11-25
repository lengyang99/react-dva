const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = (webpackConfig, env) => {
  const production = env === 'production';

  webpackConfig.plugins = webpackConfig.plugins.concat([
    new HtmlWebpackPlugin({
      template: `${__dirname}/src/index.ejs`,
      filename: production ? '../index.html' : 'index.html',
      minify: production ? {
        collapseWhitespace: true,
      } : null,
      hash: true,
      headScripts: production ? null : ['/roadhog.dll.js'],
    }),
  ]);
  return webpackConfig;
};
