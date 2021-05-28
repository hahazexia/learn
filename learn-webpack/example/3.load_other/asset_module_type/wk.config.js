const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin } = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "js/bundle.js",
    // 必须是一个绝对路径
    path: path.resolve(__dirname, "./build"),
    // assetModuleFilename: 'img/[name].[hash][ext]',
  },
  module: {
    rules: [
      {
        // 规则使用正则表达式
        test: /\.css$/, // 匹配资源
        use: [
          // { loader: "css-loader" },
          // 注意: 编写顺序(从下往上, 从右往做, 从后往前)
          "style-loader", 
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          },
          "postcss-loader"
        ],
        // loader: "css-loader"
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2
            }
          },
          "postcss-loader",
          "less-loader"
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        // use: [
        //   {
        //     loader: 'url-loader',
        //     options: {
        //       name: "img/[name].[hash:6].[ext]",
        //       limit: 100 * 1024
        //     }
        //   }
        // ]
        // type: 'asset/resource', // file-loader 效果
        // type: 'asset/inline', // url-loader 效果
        type: 'asset',
        generator: {
          filename: 'img/[name].[hash:6][ext]'
        },
        parser: {
          dataUrlCondition: {
            maxSize: 100 * 1024
          }
        }
      },
      {
        test: /\.(eot|ttf|woff\d?)/i,
        type: 'asset/resource',
        generator: {
          filename: 'font/[name].[hash:6][ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'coderwhy webpack',
      template: './public/index.html'
    }),
    new DefinePlugin({
      BASE_URL: '"./"'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          globOptions: {
            ignore: [
              '**/index.html',
              '**/.DS_Store'
            ]
          }
        }
      ]
    })
  ]
}
