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
      leafletFile: path.join(__dirname, '../doc/index.js'),
    },
    output: {
      path: path.join(__dirname, '../dist'), 
      filename: (pathData) => {
        if (pathData.chunk.name === 'leafletFile') {
          return 'leaflet.filelayer.js';
        }
        return '[name].js';
      },
      assetModuleFilename: 'assets/images/[hash:8][ext][query]', 
    },
    externals: {
      //打包时排除以下两项
      leaflet: 'L',
      togeojson: 'toGeoJSON',
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../doc/index.html'),
        inject: 'body', //Wrap the packaged javaScript at the bottom of the body
        filename: 'index.html',
        chunks: ['leafletFile'], //Add the packaged js file to html-body-javaSript
        chunksSortMode: 'none',
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'doc/assets/images',
            to: 'assets/images/',
            force: true,
          },
        ],
      }),

      new MiniCssExtractPlugin({
        //Package the css into a single file
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

        { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
      ],
    },
  },
];
