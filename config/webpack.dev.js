//npm run dev运行这个命令会执行如下：
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
//const MiniCssExtractPlugin = require("mini-css-extract-plugin").default;
const htmlIndexPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, '../src/index.html'),
    inject: 'body',//将打包的javaScript打包到body底部
    filename: 'index.html'
})
module.exports = [
    {
        entry: {
            index: path.join(__dirname, '../src/index.js'),
            leafletFile: path.join(__dirname, '../src/leaflet.filelayer.js'),

        },
        output: {
            path: path.join(__dirname, '../dist'),//输出文件路径
            filename: 'js/[name].js'//输入出文件的名称
        },
        plugins: [
            new CleanWebpackPlugin(),//清除旧的文件
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"

            }),
            htmlIndexPlugin,

            new MiniCssExtractPlugin({//将css打包成为一个单独文件
                filename: "css/[name].css"
            }),

        ],
        mode: 'development',//development production
        module: {
            rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
            { test: / \.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
            { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
            { test: /\.(scss)$/, use: ['style-loader', MiniCssExtractPlugin.loader,] },
            {
                test: /\.html$/,//打包html中的图片
                loader: 'html-loader',
                options: {
                    esModule: false
                }
            },
            {
                test: /\.svg$/,
                loader: 'svg-sprite-loader',
                options: {
                    runtimeCompat: true
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            name: "[name].[hash:6].[ext]",
                            outputPath: "img",
                            limit: 1 * 1024,
                            esModule: false,
                        }
                    }
                ],
                type: 'javascript/auto'
            },
            {
                test: /\.(eot|svglwoff|woff2|ttf|mp3|mp4|avi)$/,//处理其他资源
                loader: 'file-loader',
                options: {
                    outputPath: 'media', name: '[hash:8]. [ext]'
                },
                type: 'javascript/auto'
            }


                //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
            ]
        }
    }
];