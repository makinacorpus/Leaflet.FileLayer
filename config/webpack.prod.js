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
      //Exclude the following two items when packing
      leaflet: 'L',
      togeojson: 'toGeoJSON',
    },
    plugins: [
      //Clear the contents of the none folder
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../doc/index.html'),
        //Whether to add a unique hash value to the path of static resources such as js,css, etc. introduced into the file each time
        inject: 'body',
        filename: 'index.html',
        //Add the packaged js file to html-body-javaSript
        chunks: ['leafletFile'],
        chunksSortMode: 'none',
        //Automatically set whether to compress html files based on the value of webpackr mode
        minify: 'flash',
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
        //Package your css into a single file
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
    optimization: {
      // Compress CSS files and js files
      minimizer: [`...`, new CssMinimizerPlugin()],
      //Compress only CSS files
      //minimizer: [new CssMinimizerPlugin()],
    },
  },
];
