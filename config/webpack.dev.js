//npm run dev运行这个命令会执行如下：
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const svgToMiniDataURI = require('mini-svg-data-uri');
const webpack = require('webpack');
module.exports = [
    {
        entry: {
            leaflet: path.join(__dirname, '../node_modules/leaflet/dist/leaflet.js'),
            togeojson: path.join(__dirname, '../node_modules/togeojson/togeojson.js'),
            leafletFile: path.join(__dirname, '../src/leaflet.filelayer.js'),
            index: path.join(__dirname, '../src/index.js'),
        },
        output: {
            path: path.join(__dirname, '../dist'),//输出文件路径
            filename: '[name].js',//输入出文件的名称
            assetModuleFilename: 'assets/images/[hash:8][ext][query]',//assetModuleFilename仅适用于asset和asset/resource模块类型。
            //自动清空上次打包的内容
            clean: true,
        },
        devtool: "source-map",//源代码映射
        plugins: [
            new HtmlWebpackPlugin({
                template: path.join(__dirname, '../src/index.html'),
                //hash: true,//是否每次为文件中引入的静态资源如js,css等路径后面加上唯一的hash值
                inject: 'body',//将打包的javaScript打包到body底部
                filename: 'index.html',
                chunks: ['leaflet','togeojson','leafletFile', 'index'],//将打包好的js文件加入html-body-javaSript
                chunksSortMode: 'none',
                //js: ["https://unpkg.com/react@17.0.1/umd/react.production.min.js"], //从外部导入js
    
            }),
            /*  new webpack.ProvidePlugin({
                 $: "jquery",
                 jQuery: "jquery"
 
             }), */
            new CopyPlugin({
                patterns: [
                    {
                        from: "src/assets/images",
                        to: "assets/images/",
                        force: true,
                    },
                ],
            }),
            //热更新
            new webpack.HotModuleReplacementPlugin(),
            new MiniCssExtractPlugin({//将css打包成为一个单独文件
                filename: "css/[name].css"
            }),

        ],
        devServer: {
            //启用热更新
            //hot: true,
            //热替换但不更新
            hotOnly: true
        },
        mode: 'development',//development production
        module: {
            rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
            { test: / \.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
            { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
            { test: /\.(scss)$/, use: ['style-loader', MiniCssExtractPlugin.loader,] },
            {
                test: /\.html$/,//打包html中
                loader: 'html-loader',
                options: {
                    esModule: false
                }
            },
            {
                test: /\.svg$/i,
                type: 'asset/inline',
                generator: {
                    dataUrl: content => {
                        content = content.toString();
                        return svgToMiniDataURI(content);
                    }
                }
            },
            {
    
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 1 * 1024 // 4kb
                    }
                },
                generator: {
                    filename: "assets/images/[hash:8][ext][query]",
                }
            },
                 {
                     test: /\.(eot|svg|ttf|woff2?)$/i,
                     type: 'asset/resource',
                     filename:'assets//[name].[hash:8].[ext]'
                 }
    
                //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
            ]
        }
    }
];