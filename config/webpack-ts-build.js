/* Package the contents of the src-ts folder as a js file */
var path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack');

module.exports = {
  entry: {
    leafletFile: path.join(__dirname, '../ts/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../src'),
    filename: 'leaflet.filelayer.js',
    //library: 'L',
    /* libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this", */
    //libraryTarget: 'amd',
    //umdNamedDefine: false,
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DtsBundleWebpack({
      name: 'leaflet.filelayer',
      main: path.join(__dirname, '../dts/index.d.ts'),
      out: path.join(__dirname, '../src/leaflet.filelayer.d.ts'),
      removeSource: false,
      outputAsModuleFolder: false,
    }),
  ],
  externals: {
    leaflet: 'L',
    togeojson: 'toGeoJSON',
  },
  resolve: {
    extensions: ['.ts'],
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
};
