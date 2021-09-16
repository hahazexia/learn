# webpack基础

## 什么是 webpack？

webpack 是一个用于现代 JavaScript 应用程序的 静态模块打包工具。当 webpack 处理应用程序时，它会在内部构建一个 依赖图(dependency graph)，此依赖图对应映射到项目所需的每个模块，并生成一个或多个 bundle。

它可以把浏览器不认识的 web 资源， 比如 sass、less、ts，经过编译后能够在浏览器中正常工作。

## module chunk bundle

这三个术语在 webpack 文档里经常见到，它们的含义：
* module：就是源代码中的模块，一个文件就是一个模块，例如 commonjs 的模块，es6 module 的模块
* chunk：webpack 在执行过程中根据源代码的 module 的引用关系形成的文件就是 chunk
* bundle：最终输出的文件，能够直接在浏览器里运行

## entry

entry 指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始。

```js
{
    // string方式： 单入口，打包形成一个 trunk，输出一个 buldle 文件。trunk 的名称默认是 main.js
    entry: "./src/index.js",
    // array方式：多入口，所有入口文件最终只会形成一个 trunk，输出出去只有一个 bundle 文件
    entry: ["./src/index.js", "./src/test.js"],
    // object：多入口，有几个入口文件就形成几个 trunk，输出几个 bundle 文件。此时 trunk 的名称就是对象 key 值
    entry: {
        index:"./src/index.js",
        test:"./src/test.js",
    }
}
```

## output

output 指示 webpack 打包后的资源输出到哪里，以及如何命名。

```js
    {
        output: {
            // 输出文件目录（将来所有资源输出的公共目录，包括 css 和静态文件等等）
            path: path.resolve(__dirname, "dist"), //默认
            // 文件名称
            filename: "[name].js", // 默认
            // 所有资源引入公共路径前缀，一般用于生产环境，小心使用
            publicPath: "",
            /* 
            非入口文件 chunk 的名称。所谓非入口即 import 动态导入形成的 trunk 或者 optimization 中的 splitChunks 提取的公共 trunk
            它支持和 filename 一致的内置变量
            */
            chunkFilename: "[contenthash:10].chunk.js",

            /* 当用 Webpack 去构建一个可以被其他模块导入使用的库时需要用到 library */
            library: {
                name: "[name]", // 整个库向外暴露的变量名
                type: "window" // 库暴露的方式
            }
        }
    }
```

## loader

loader 用来处理不同的文件。webpack 自身只能理解 js 和 json 文件，loader 让 webpack 能够处理其他文件。它会将其他类型的文件变成 js 模块。

```js
rules: [
    {
        // 匹配哪些文件
        test: /\.css$/,
        // 使用哪些 loader 进行处理。执行顺序，从右至左，从下至上
        use: [
            // 创建 style 标签，将 js中的样式资源（就是 css-loader 转化成的字符串）拿过来，添加到页面 head 标签生效
            "style-loader",
            // 将 css 文件变成 commonjs 一个模块加载到 js 中，里面的内容是样式字符串
            "css-loader",
            "sass-loader",
             {
                 // css 兼容处理 postcss，注意需要在 package.json 配置 browserslist
                 loader: "postcss-loader",
                 options: {
                     postcssOptions: {
                         ident: "postcss",
                         // postcss-preset-env插件：帮 postcss 找到 package.json 中的 browserslist 配置，根据配置加载指定的兼容性样式
                         plugins: [require("postcss-preset-env")()],
                     },
                 },
             },
        ],
    },
    {
        test: /\.js$/,
        // 注意需要在 package.json 配置 browserslist，否则 babel-loader 不生效
        // js 兼容处理 babel
        loader: "babel-loader", // 规则只使用一个 loader 时推荐写法
        options: {
            presets: [
                [
                    "@babel/preset-env",// 预设：指示 babel 做怎么样的兼容处理 
                    {
                        useBuiltIns: "usage", //按需加载
                        corejs: {
                            version: "3",
                        },
                        targets: "defaults",
                    }
                ]
            ]
        }
    },
    /* 
    Webpack5.0 新增资源模块(asset module)，它是一种模块类型，允许使用资源文件（字体，图标等）而无需配置额外 loader。支持以下四个配置
    asset/resource 发送一个单独的文件并导出 URL。之前通过使用 file-loader 实现。
    asset/inline 导出一个资源的 data URI。之前通过使用 url-loader 实现。
    asset/source 导出资源的源代码。之前通过使用 raw-loader 实现。
    asset 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现。
    */
    // Webpack4 使用 file-loader 实现
    {
        test: /\.(eot|svg|ttf|woff|)$/,
        type: "asset/resource",
        generator: {
            // 输出文件位置以及文件名
            filename: "fonts/[name][ext]"
        },
    },
    // Webpack4 使用 url-loader 实现
    {
        //处理图片资源
        test: /\.(jpg|png|gif|)$/,
        type: "asset",
        generator: {
            // 输出文件位置以及文件名
            filename: "images/[name][ext]"
        },
        parser: {
            dataUrlCondition: {
                maxSize: 10 * 1024 //超过 10kb 不转 base64
            }
        }
    },
],

```

## plugins

插件用于执行 loader 之外的其他功能。例如 打包优化和压缩，定义环境变量等。

```js
// CleanWebpackPlugin 帮助你在打包时自动清除 dist 文件，学习时使用比较方便
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// HtmlWebpackPlugin 帮助你创建 html 文件，并自动引入打包输出的 bundles 文件。支持 html 压缩。
const HtmlWebpackPlugin = require("html-webpack-plugin");

// 该插件将 CSS 提取到单独的文件中。它会为每个 trunk 创造一个 css 文件。需配合 loader 一起使用
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// 该插件将在 webpack 构建过程中搜索 CSS 资源，并优化\最小化 CSS
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");

// vue-loader V15 版本以上，需要引入 VueLoaderPlugin 插件，它的作用是将你定义过的 js、css 等规则应用到 vue 文件中去。
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.css$/,
                use: [
                    // MiniCssExtractPlugin.loader的 作用就是把 css-loader 处理好的样式资源（js文件内），单独提取出来成为 css 样式文件
                    MiniCssExtractPlugin.loader, //生产环境下使用，开发环境还是推荐使用 style-loader
                    "css-loader",
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template:"index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "css/built.css",
        }),
        new OptimizeCssAssetsWebpackPlugin(),
        new VueLoaderPlugin(),
    ]
}

```

## mode

指示 webpack 使用相应模式的配置。默认为 production。


|   选项   |  描述  |
|   ----   |  ----  |
|  development  | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 development。为模块和 chunk 启用有效的名。  |
|  production  | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 production。为模块和 chunk 启用确定性的混淆名称，FlagDependencyUsagePlugin，FlagIncludedChunksPlugin，ModuleConcatenationPlugin，NoEmitOnErrorsPlugin 和 TerserPlugin 。  |
|   none   |  不使用任何默认优化选项  |


* DefinePlugin：用于定义全局变量 process.env.NODE_ENV，区分程序运行状态。
* FlagDependencyUsagePlugin：标记没有用到的依赖。
* FlagIncludedChunksPlugin：标记 chunks，防止 chunks 多次加载。
* ModuleConcatenationPlugin：作用域提升(scope hosting)，预编译功能，提升或者预编译所有模块到一个闭包中，提升代码在浏览器中的执行速度。
* NoEmitOnErrorsPlugin：防止程序报错，就算有错误也继续编译。
* TerserPlugin：压缩 js 代码。

## resolve

配置模块如何被解析。

```js
    // 解析模块的规则：
    resolve: {
        // 配置 解析模块路径别名：可简写路径。
        alias: {
            "@": path.resolve(__dirname, "src")
        },
        // 配置省略文件路径的后缀名。默认省略 js 和 json。也是 webpack 默认认识的两种文件类型
        extensions: [".js", ".json", ".css"], // 新加 css 文件
        // 告诉 webpack 解析模块是去找哪个目录
        // 该配置明确告诉 webpack，直接去上一层找 node_modules。
        modules: [path.resolve(__dirname, "../node_modules")],
    },
```

## devServer

配置  webpack-dev-server，在开发环境下启动一个服务提供实时加载改动后的页面，也可以设置代理，将所有请求都转发到另外一个服务，解决开发中跨域问题

```js
    devServer: {
        // 运行代码的目录
        contentBase: path.resolve(__dirname, "build"),
        // 为每个静态文件开启 gzip 压缩
        compress: true,
        host: "localhost",
        port: 5000,
        open: true, // 自动打开浏览器
        hot: true, //开启HMR功能
        // 设置代理
        proxy: {
            // 一旦 devServer (5000端口)接收到 /api/xxx 的请求，就会用 devServer 起的服务把请求转发到另外一个服务器（3000）
            // 以此来解决开发中的跨域问题
            api: {
                target: "htttp://localhost:3000",
                // 发送请求时，请求路径重写：将/api/xxx  --> /xxx （去掉/api）
                pathRewrite: {
                    "^api": "",
                },
            },
        },
    },
```

## optimization

webpack 会根据不同 mode 执行不同的优化，这些预设的优化可以通过 optimization 选项来手动配置和重写。

```js
// optimization（生产环境下配置）
    optimization: {
        // 提取公共代码
        splitChunks: {
            chunks: "all",
        },
        minimizer: [
            // 配置生产环境的压缩方案：js 和 css
            new TerserWebpackPlugin({
                // 多进程打包
                parallel: true,
                terserOptions: {
                    // 启动 source-map
                    sourceMap: true,
                },
            }),
        ],
    }
```

## devtool

配置如何生成 source map。source-map 是一种提供源代码到构建后代码映射的技术，如果构建后代码出错了，通过映射可以追踪源代码错误，优化代码调试。

* 下面几个值不会生成 source-map
    * false：不使用 source-map，也就是没有任何和 source-map 相关的内容。
    * none：production 模式下的默认值，不生成 source-map。
    * eval：development 模式下的默认值，不生成单独的 source-map 文件，但是它会在eval执行的代码中，添加 //# sourceURL=；它会被浏览器在执行时解析，并且在调试面板中生成对应的一些文件目录，方便我们调试代码；

* source-map：生成一个独立的 source-map 文件，并且在 bundle 文件中有一个注释，指向 source-map 文件；bundle 文件中有如下的注释：开发工具会根据这个注释找到 source-map 文件，并且解析；

```js
//# sourceMappingURL=bundle.js.map
```

* eval-source-map：会生成 sourcemap，但是 source-map 是以 DataUrl 添加到 eval 函数的后面
* inline-source-map：会生成 sourcemap，但是 source-map 是以 DataUrl 添加到 bundle 文件的后面
* cheap-source-map：会生成 sourcemap，但是会更加高效一些（cheap低开销），因为它没有生成列映射（Column Mapping）因为在开发中，我们只需要行信息通常就可以定位到错误了。
* hidden-source-map：会生成 sourcemap，但是不会对 source-map 文件进行引用；相当于删除了打包文件中对 sourcemap 的引用注释；如果我们手动添加进来，那么 sourcemap 就会生效了
* nosources-source-map：会生成 sourcemap，但是生成的 sourcemap 只有错误信息的提示，不会生成源代码文件；
* cheap-module-source-map：会生成 sourcemap，类似于 cheap-source-map，但是对源自 loader 的 sourcemap 处理会更好。这里有一个很模糊的概念：对源自 loader 的 sourcemap 处理会更好，官方也没有给出很好的解释。其实是如果 loader 对我们的源码进行了特殊的处理，比如 babel；



* 事实上，webpack 提供给我们的 26 个值，是可以进行多组合的。
    * inline-|hidden-|eval：三个值时三选一；
    * nosources：可选值；
    * cheap 可选值，并且可以跟随 module 的值；

```
[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
```

* 那么在开发中，最佳的实践是什么呢？
    * 开发阶段：推荐使用 source-map 或者 cheap-module-source-map 这分别是 vue 和 react 使用的值，可以获取调试信息，方便快速开发；
    * 测试阶段：推荐使用 source-map 或者 cheap-module-source-map 测试阶段我们也希望在浏览器下看到正确的错误提示；
    * 发布阶段：false、缺省值（不写）

