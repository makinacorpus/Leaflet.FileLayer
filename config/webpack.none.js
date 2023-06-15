/* run the following code with the 'npm run none' command, see 'package.json' for details */
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const DtsBundleWebpack = require('dts-bundle-webpack');
module.exports = [
  {
    entry: {
      leafletFile: path.join(__dirname, '../doc/index.js'),
    },
    output: {
      path: path.join(__dirname, '../none'),
      //filename: '[name][hash:8].js',
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
    
   /*  */
    plugins: [
      //Clear the contents of the none folder
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../doc/index.html'),
        //Whether to add a unique hash value to the path of static resources such as js,css, etc. introduced into the file each time
        hash: false,
        inject: 'body',
        filename: 'index.html',
        //Add the packaged js file to html-body-javaSript
        chunks: ['leafletFile'],
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
        filename: 'css/[name].css',
      }),
    ],
    
    devtool: false,
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
