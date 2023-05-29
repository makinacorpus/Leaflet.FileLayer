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
      //leafletFile: path.join(__dirname, '../src/leaflet.filelayer.js'),
      //index: path.join(__dirname, '../src/index.js'),
      leafletFile: path.join(__dirname, '../src/index.js'),
    },
    output: {
      path: path.join(__dirname, '../none'), //输出文件路径
      //filename: '[name].js',
      filename: (pathData) => {
        if (pathData.chunk.name === 'leafletFile') {
          return 'leaflet.filelayer.js';
        }
        return '[name].js';
      },
      assetModuleFilename: 'assets/images/[hash:8][ext][query]', //assetModuleFilename仅适用于asset和asset/resource模块类型。
    },

    externals: {
      //打包时排除以下两项
      leaflet: 'L',
      togeojson: 'toGeoJSON',
      //'./leaflet.filelayer': 'filelayer', // 将leaflet.filelayer.js标记为外部依赖
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../src/index.html'),
        hash: false, //是否每次为文件中引入的静态资源如js,css等路径后面加上唯一的hash值
        inject: 'body', //将打包的javaScript打包到body底部
        filename: 'index.html',
        //chunks: ['leafletFile', 'index'], //将打包好的js文件加入html-body-javaSript
        chunks: ['leafletFile'], //将打包好的js文件加入html-body-javaSript
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
        filename: 'css/[name].css',
      }),
    ],

    mode: 'none', //development production none
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            'postcss-loader',
          ],
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
              maxSize: 4 * 1024, // 4kb
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

        { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
      ],
    },
  },
];
