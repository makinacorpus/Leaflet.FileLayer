/*  */
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
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
      new webpack.DllReferencePlugin({
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
      }),
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
        filename: 'css/[name].css',
      }),
    ],

    mode: 'production', //development production none
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
        {
          test: /\.js$/,
          //排除node_modules下的js文件
          exclude: /node_modules/,
          //只检查src 下的js文件
          include: path.join(__dirname, '../src'),
          // 优先执行
          // enforce: 'pre ',
          //延后执行
          // enforce: 'post', 
          //单个loader用
          //loader: 'eslint-loader'
        },
        //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
      ],
    },
  },
];
