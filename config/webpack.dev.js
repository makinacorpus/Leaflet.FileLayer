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
            
        },
        output: {
            path: path.join(__dirname, '../dist'),//输出文件路径
            filename: 'js/[name].js'//输入出文件的名称
        },
        plugins: [
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
            { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
            { test: / \.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
            { test: /\.(scss)$/, use: ['style-loader', MiniCssExtractPlugin.loader,] },
           
            /* {
                test: /\.html$/,//打包html中的图片
                loader: 'html-withimg-loader'
            }, */
            {
                test: /\.html$/,//打包html中的图片
                loader: 'html-loader',
                options: {
                    esModule: false
                }
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        // 超过指定大小的图片参与打包，否则转为base64编码，单位是字节
                        limit: 1024 * 4, // 超过6kb大小的图片参与打包
                        // 将打包的图片统一放到img目录下，名称为：图片名称+8位hash码+图片后缀
                        name: '[name].[hash:4].[ext]',
                        // url-loader默认使用的是es6模块化，html-loader采用的是commonjs模块化
                        esModule: false,// 这边关闭es6模块化，统一使用commonjs模块化
                        outputPath: 'img/'
                    }
                }]

            },

            { test: /\.(eot|svg|ttf|woff|woff2)$/, use: ['file-loader'] },//bootstrap字体
            {
                /* test: require.resolve("jquery"),
                loader: "expose-loader",
                options: {
                    exposes: ["$", "jQuery"],
                }, */

            },

                //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
            ]
        }
    }
];




