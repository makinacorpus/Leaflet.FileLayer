/*  */
var path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = [
  {
    entry: {
      leafletFile: path.join(__dirname, '../src-ts/index.ts'),

    },
   
    output: {
      path: path.join(__dirname, '../src-ts/js'),
      filename: 'leaflet.filelayer.js',
      //module: true // Enable ES2015 modules
    },
    plugins: [
      new CleanWebpackPlugin(),
      
    ],
    externals: {
      //打包时排除以下两项
      leaflet: 'L',
      togeojson: 'toGeoJSON',
    },
    resolve: {
      extensions: ['.ts']
    },    
    devtool: false,
    mode: 'development', //development production none
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'ts-loader'],
          
        },
      ],
    },
  },
];
