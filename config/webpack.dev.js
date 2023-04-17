/*  */
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
//const webpack = require('webpack');
module.exports = [
  {
    entry: {
      leafletFile: path.join(__dirname, '../src/leaflet.filelayer.js'),
      index: path.join(__dirname, '../src/index.js'),
    },
    output: {
      path: path.join(__dirname, '../dist'), //输出文件路径
      filename: '[name].js', //输入出文件的名称
      assetModuleFilename: 'assets/images/[hash:8][ext][query]', //assetModuleFilename仅适用于asset和asset/resource模块类型。
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../src/index.html'),
        //hash: true, //是否每次为文件中引入的静态资源如js,css等路径后面加上唯一的hash值
        inject: 'body', //将打包的javaScript打包到body底部
        filename: 'index.html',
        chunks: ['leafletFile', 'index'], //将打包好的js文件加入html-body-javaSript
        chunksSortMode: 'none',
        //js: ["https://unpkg.com/react@17.0.1/umd/react.production.min.js"], //从外部导入js
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'src/assets/images',
            to: 'assets/images/',
            force: true,
          },
        ],
      }),
      new MiniCssExtractPlugin({
        //将css打包成为一个单独文件
        filename: 'css/[name][hash:8].css',
      }),
    ],

    mode: 'development', //development production none
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: / \.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.less$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
        },
        {
          test: /\.(scss)$/,
          use: ['style-loader', MiniCssExtractPlugin.loader],
        },
        {
          test: /\.html$/, //打包html中
          loader: 'html-loader',
          options: {
            esModule: false,
          },
        },
        {
          test: /\.svg$/i,
          type: 'asset/inline',
          generator: {
            dataUrl: (content) => {
              content = content.toString();
              return svgToMiniDataURI(content);
            },
          },
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 1 * 1024, // 4kb
            },
          },
          generator: {
            filename: 'assets/images/[hash:8][ext][query]',
          },
        },
        {
          test: /\.(eot|ttf|woff2?)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/font/[hash:8][ext][query]',
          },
        },

        //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
      ],
    },
  },
];
