/*
使用dll技术，对某些库（第三方库: jquery、react、vue.. .)进行单独打包
*/
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
  entry: {
    togeojson: ['@tmcw/togeojson'],
  },
  output: {
    filename: '[name].js ',
    path: path.join(__dirname, '../dll'), //输出文件路径
    library: '[name]', //打包的库里面向外暴露出去的内容叫什么
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(__dirname, '../dll/manifest.json'),
    }),
  ],
  mode: 'production',
};
