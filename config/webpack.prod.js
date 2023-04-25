/*  */
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const AddSssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const webpack = require('webpack');
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
        inject: 'body', //将打包的javaScript打包到body底部
        filename: 'index.html',
        chunks: ['leafletFile', 'index'], //将打包好的js文件加入html-body-javaSript
        chunksSortMode: 'none',
        minify: 'flash', //根据webpackr mode的值自动设置是否压缩html文件
      }),
      /* new webpack.DllReferencePlugin({
        //告诉webpack哪些库不参与打包，同时使用时的名称也得变~
        manifest: path.join(__dirname, '../dll/manifest.json'),
      }),
      new AddSssetHtmlWebpackPlugin({
        //Html自动引入第三方js插件此处引入的是webpack.dll.config.js中打包的文件
        filepath: path.join(__dirname, '../dll/togeojson.js '),
        // dll 引用路径
        publicPath: './vendor',
        // dll最终输出的目录
        outputPath: './vendor',
      }), */

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
        filename: 'css/[name].css',
      }),
    ],
    mode: 'production', //development production none
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.less$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader'],
        },
        {
          test: /\.(scss)$/,
          use: ['style-loader', MiniCssExtractPlugin.loader],
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
        {
          test: /\.js$/,
          exclude: /node_modules/,
          include: path.join(__dirname, '../src'),
        },

        //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
      ],
    },
    optimization: {
      // 压缩CSS文件与js文件
      // minimizer: [`...`, new CssMinimizerPlugin()],
      minimizer: [new CssMinimizerPlugin()],
    },
  },
];
