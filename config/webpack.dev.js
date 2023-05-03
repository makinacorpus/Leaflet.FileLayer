/*  */
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');

module.exports = [
  {
    entry: {
      leafletFile: path.join(__dirname, '../src/leaflet.filelayer.js'),
      index: path.join(__dirname, '../src/index.js'),
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
      togeojson: 'toGeoJSON'
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../src/index.html'),
        inject: 'body', //将打包的javaScript打包到body底部
        filename: 'index.html',
        chunks: ['leafletFile', 'index'], //将打包好的js文件加入html-body-javaSript
        chunksSortMode: 'none',
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

    mode: 'development', // development production none
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
          //只检查src 下的js文件
          include: path.join(__dirname, '../src'),
          //单个loader用
          //loader: 'eslint-loader'
        },

        //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
      ],
    },
  },
];
