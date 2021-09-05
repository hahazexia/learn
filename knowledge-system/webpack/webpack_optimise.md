# webpack 优化

利用 webpack 进行优化分为两个部分，开发环境下的优化和生产环境的优化。

## 开发环境

### source-map

source-map 是生成的一个对象，这个对象是源代码和编译后代码的映射关系，浏览器可以通过 source-map 找到编译后代码的报错信息具体在源代码的哪个地方。

通过 devtool 选项设置。webpack 提供了二十多个值，其实是几个关键字互相组合的结果。

最普通的配置是 `devtool: 'source-map'`。这个的意思是 source-map 生成为独立的文件，然后在 bundle 中最后面加一个注释，浏览器会根据这个注释找到对应的 source-map 文件然后解析并生效。

```js
//# sourceMappingURL=bundle.js.map
```
当 devtool 的值是 false 和 none 时，不生成 source-map。

下面是关键字组合的语法：

```js
[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
```

* inline hidden eval 这三者选其一。
    * inline：source-map 的内容以 dataUrl 的形式放在最终的 bundle 中
    * hidden：会生成 source-map 为单独文件，但是 bundle 中没有那句注释，所以浏览器找不到对应的 source-map 文件
    * eval：source-map 的内容和 bundle 代码混在一起，然后作为参数被 eval() 执行
* nosources：使用这个关键字的 source-map 不包含 sourcesContent，因此只能看到文件信息和代码行数，看不到源代码
* cheap：只包含行信息，不包含列信息，源码是 loader 处理后的。也就是说只能定位到源码的哪一行，而不知道具体是第几列
* cheap-module：和 cheap 类似，只是源码是真正的源码，不是 loader 处理后的。


那么在开发中，最佳的实践是什么呢？
* 开发阶段：推荐使用 source-map 或者 cheap-module-source-map 这分别是 vue 和 react 使用的值，可以获取调试信息，方便快速开发；
* 测试阶段：推荐使用 source-map 或者 cheap-module-source-map 测试阶段我们也希望在浏览器下看到正确的错误提示；
* 发布阶段：false、缺省值（不写）。如果想在生产环境看到报错的具体源码位置，可以使用 nosources-source-map

webpack 官网都建议加上 eval 关键字，因为加上后模块构建速度会加快。

### HMR（hot module replacement 模块热替换）

devServer 启动一个代理服务器。启动过后修改代码就会自动刷新浏览器了，但这个并不是 HMR。HMR 是指替换、添加或删除模块，而无需重新加载整个页面。

当我们对代码修改并保存后，Webpack 将会对代码进行重新打包，并将新的模块发送到浏览器端，浏览器用新的模块替换掉旧的模块，以实现在不刷新浏览器的前提下更新页面。最明显的优势就是相对于刷新整个页面而言，HMR 并不会丢失应用的状态，提高开发效率。


```js
{
    // 注意：Webpack 升级到 5.0后，target 默认值值会根据 package.json 中的 browserslist 改变，导致 devServer 的自动更新失效。所以development 环境下直接配置成 web。
    target: "web",
    devServer: {
        contentBase: path.resolve(__dirname, "dist"),
        hot: true,//开启 HMR 功能
    },
    plugins: {
        HotModuleReplacementPlugin: new webpack.HotModuleReplacementPlugin()
    }
}
```

开启 HMR 后，还需要进行一些配置才能生效。

* 样式文件：style-loader 内部实现，所以只要 loader 中配置了 style-loade 就可直接使用 HMR 功能
* vue 文件：vue-loader 内部实现，同理配置 vue-loader 直接使用 HMR。
* js 文件：需要修改源代码，接收更新通知，代码如下

```js
import test from "./test.js"

if (module.hot) {
    module.hot.accept("./test.js",() => {
        console.log('Accepting the updated test module!');
    })
}
```

当 test 文件被改动时，更新事件会一层层往上传递，直到传递到入口文件中。而在传递的过程中，任何地方接收了这个更新事件，即上面的 module.hot.accept 方法，就会停止传递，执行回调。如果一直未接收，最后就会通知 Webpack 刷新整个页面。

## 生产环境

### oneOf

webpack 原本的是将每个文件都过一遍所有的 rules，比如 rules 中有 10 个 loader，第一个是处理 js 文件的 loader，当第一个 loader 处理完成后 webpack 不会自动跳出，而是会继续拿着这个 js 文件去尝试匹配剩下的 9 个 loader，相当于没有 break。而 oneOf 就相当于这个 break。

```js
rules:[
    {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
    },
    {
        //  以下 loader 一种文件只会匹配一个 
        oneOf: [
            // 不能有两个配置处理同一种类型文件，如果有，另外一个规则要放到外面。
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
        ],
    },
]

```

### cache-loader 缓存

在编译打包时可对文件做缓存，有两种方式，一种是解析文件的 loader 自身带有缓存功能（如 babel-loader, vue-loader），第二种就是使用专门的 loader（cache-loader）。
开启缓存后，对于未改动的文件，webpack 直接从缓存中读取而不用再次编译，大大加快构建速度。


```js
{
    test: /\.js$/,
    use: [ // 使用 cache-loader，放在 babel-loader 前可对 babel 编译后的 js  文件做缓存。
        "cache-loader",
        {
            loader: "babel-loader",
            options: {
                presets: [
                    [
                        "@babel/preset-env",// 预设：指示babel做怎么样的兼容处理 
                    ]
                ],
                // 开启 babel 缓存，第二次构建时，会读取之前的缓存。
                cacheDirectory: true,
            }
        }
    ]
}
```

@vue/cli-service 也依赖了 cache-loader

### 多进程打包 thread-loader

```js
// thread-loader 放在 babel-loader 前，就会在 babel-loader 工作时进行多进程工作。
{
    loader: "thread-loader",
    options: {
        workers: 2, // 启动进程个数，默认是电脑 cpu 核数 -1
    },
},
{
    loader: "babel-loader",
    options: {
        presets: [
            [
                "@babel/preset-env",
            ],
        ],
    },
},

```

### externals

externals 用来告诉 Webpack 要构建的代码中使用了哪些不用被打包的模块，这些模块可能是通过外部环境（如 CDN）引入的。

```js
module.export = {
  externals: {
    // 把导入语句里的 jquery 替换成运行环境里的全局变量 jQuery
    jquery: 'jQuery'
  }
}

// 源代码
 import $ from "jquery"

```

配置了 externals 后，即使你代码中引入了这个库，Webpack 也不会将库打包进 bundle，而是直接使用全局变量。

### dll

dll（动态链接库）：使用dll技术对公共库进行提前打包，可大大提升构建速度。公共库一般情况下是不会有改动的，所以这些模块只需要编译一次就可以了，并且可以提前打包好。在主程序后续构建时如果检测到该公共库已经通过 dll 打包了，就不再对其编译而是直接从动态链接库中获取。

实现 dll 打包需要以下三步：

* 抽取公共库，打包到一个或多个动态链接库中。
* 将打包好的动态链接库在页面中引入。
* 主程序使用了动态链接库中的公共库时，不能被打包入 bundle，应该直接去动态链接库中获取。

针对这个步骤的代码

1. 新建一个 webpack.dll.js 用来提前打包动态链接库

```js
// webpack.dll.js
module.exports = {
    // JS 执行入口文件
    entry: {
        // 把 vue 相关模块的放到一个单独的动态链接库
        vendor: ['vue', 'axios'],
        // 其他模块放到另一个动态链接库
        other: ['jquery', 'lodash'],
    },
    output: {
        // 输出的动态链接库的文件名称，[name] 代表当前动态链接库的名称（"vendor" 和 "other"）
        filename: '[name].dll.js',
        // 输出的文件都放到 dist 目录下的 dll文件夹中
        path: path.resolve(__dirname, 'dist', "dll"),
        // 存放动态链接库的向外暴露的变量名，例如对应 vendor 来说就是 _dll_vendor
        library: '_dll_[name]',
    },
    plugins: [
        //  打包生成一个 mainfest.json 文件。告诉 webpack 哪些库不参与后续的打包，已经通过 dll 事先打包好了。
        new webpack.DllPlugin({
            // 动态链接库的库名，需要和 output.library 中保持一致
            // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
            // 例如 vendor.manifest.json 中就有 "name": "_dll_vendor"
            name: '_dll_[name]',
            // 描述动态链接库的 manifest.json 文件输出时的文件名称
            path: path.join(__dirname, 'dist', "dll", '[name].manifest.json'),
        }),
    ],
};

```

2. 在模板页 index.html 中引入打包好的动态链接库

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webpack</title>
    <script src="./dll/vendor.dll.js"></script>
    <script src="./dll/other.dll.js"></script>
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

3. 在主程序的 Webpack 配置中使用 webpack.DllReferencePlugin 插件，读取 webpack.DllPlugin 生成的manifest.json 文件，从中获取依赖关系。

```js
// webpack.config.js
module.exports = {
    mode: "production",
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html"
        }),
        // 告诉 Webpack 使用了哪些动态链接库
        new webpack.DllReferencePlugin({
            // manifest 文件告诉 webpack 哪些库已经通过 dll 事先打包好了，后续构建直接去动态链接库里获取。
            manifest: path.resolve(__dirname, "dist", "./dll/vendor.manifest.json"),
        }),
        new webpack.DllReferencePlugin({
            manifest: path.resolve(__dirname, "dist", "./dll/other.manifest.json"),
        }),
    ],
}

```

### Tree Shaking

移除 JavaScript 上下文中的未引用代码。将整个应用程序想象成一棵树，绿色的树叶表示实际用到的，灰色的树叶则表示未被使用的代码，是枯萎的树叶。为了除去这些死去的无用的树叶，你需要摇动这棵树使其落下。这就是 Tree Shaking的名称由来。

```js
// 入口文件 index.js
import test from "./test.js"
console.log(test.add(2, 3));

// 测试文件 test.js
const add = (x, y) => x + y
const print = (msg) => {
    console.log(msg);
}
export default { add, print }

// 最终打包输出的 bundle：main.js 文件
!function(){"use strict";console.log(2+3)}();

```

从上面示例可以看出，index.js 中虽然引入了 test 文件，但是因为 test 文件暴露的 print 方法没有被使用，所以在最终打包中被去除。
这一点在 Webpack4 中还做不到，Webpack4 中只会去除从未被使用的模块。带入上面的例子，如果 test 在 index.js文件中没有被用到，才会被 Tree Shaking。之所以这样，是因为 Webpack4 默认认为所有文件的代码都是有副作用的。如何告知 Webpack 你的代码是否有副作用，可通过 package.json 中的 sideEffects 字段。

```js
// 所有文件都有副作用
{
 "sideEffects": true
}
// 所有文件都没有副作用
{
 "sideEffects": false
}
// 只有这些文件有副作用，所有其他文件都可以 Tree Shaking，但会保留这些文件
{
 "sideEffects": [
  "./src/file1.js",
  "./src/file2.js"
 ]
}

```

Webpack5 默认设置中认为样式文件是有副作用的，所以引入样式文件虽然没有被使用（样式文件肯定是不使用的）也不会被去除，但是如果设置了 sideEffects：false，就会进行 Tree Shaking 将代码去除。

其实不用特别配置，只要将 mode 设置为 "production"，Webpack 就自动启用 Tree Shaking 了。有两点说明下：

* 源代码必须使用 静态的 ES6 模块化语法。原因是 Webpack 在构建时通过静态分析，分析出代码之间的依赖关系。而动态导入如 require 语法只有在执行时才知道导入了哪个模块，所以无法做 Tree Shaking。
* 三方库无法做 Tree Shaking。原因猜测是 Webpack 无法保证三方库导入是否会直接对程序产生影响。

### Code Split 代码分割

Webpack 默认会将所有依赖的文件打包输出到一个 bundle.js 中（单入口时），当应用程序逐渐复杂，这个 bundle.js 文件也会越来越大，浏览器加载的速度也会越来越慢，所以就需要使用代码分割来将不同代码单独打包成不同 trunk 输出。主要有两种方法：

1. 通过 optimization 将公共代码单独打包成 trunk

```js
optimization: {
    splitChunks: {
        // 选择哪些 chunk 进行优化，默认async，即只对动态导入形成的trunk进行优化。
        chunks: 'all', 
        // 提取chunk最小体积
        minSize: 20000,
        // 要提取的chunk最少被引用次数
        minChunks: 1,
        // 对要提取的trunk进行分组
        cacheGroups: {
            // 匹配node_modules中的三方库，将其打包成一个trunk
            defaultVendors: {
                test: /[\\/]node_modules[\\/]/,
                // trunk名称
                name: 'vendors',
                priority: -10,
            },
            default: {
                // 将至少被两个 trunk引 入的模块提取出来打包成单独trunk
                minChunks: 2,
                name: 'default',
                priority: -20,
            },
        },
    },
},

```

2. import 动态导入

当想要根据业务拆分 bundle 时推荐用这种方式。import 动态导入的模块 Webpack 会将其作为单独的 trunk 打包。

```js
import( /* webpackChunkName: 'test' */ './test.js').then((result) => {
    console.log(result);
}).catch(() => {
    console.log('加载失败！');
});

```