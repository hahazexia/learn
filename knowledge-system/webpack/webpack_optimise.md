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