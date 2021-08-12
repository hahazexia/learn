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

