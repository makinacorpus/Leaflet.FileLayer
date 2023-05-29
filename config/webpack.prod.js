/*  */
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
module.exports = [
  {
    entry: {
      //leaflet:['leaflet'],
      // leafletFile: path.join(__dirname, '../src/leaflet.filelayer.js'),
      // index: path.join(__dirname, '../src/index.js'),
      leafletFile: path.join(__dirname, '../src/index.js'),
    },
    output: {
      path: path.join(__dirname, '../dist'), //输出文件路径
      filename: (pathData) => {
        if (pathData.chunk.name === 'leafletFile') {
          return 'leaflet.filelayer.js';
        }
        return '[name].js';
      },
      assetModuleFilename: 'assets/images/[hash:8][ext][query]', //assetModuleFilename仅适用于asset和asset/resource模块类型。
    },
    externals: {//打包时排除以下两项
      leaflet: 'L',
      togeojson: 'toGeoJSON',
     
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../src/index.html'),
        inject: 'body', //将打包的javaScript打包到body底部
        filename: 'index.html',
        //chunks: ['leaflet', 'leafletFile', 'index'], //将打包好的js文件加入html-body-javaSript
        chunks: ['leafletFile'], //将打包好的js文件加入html-body-javaSript
        chunksSortMode: 'none',
        minify: 'flash', //根据webpackr mode的值自动设置是否压缩html文件
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
      //minimizer: [`...`, new CssMinimizerPlugin()],
      minimizer: [new CssMinimizerPlugin()],
    },
  },
];
