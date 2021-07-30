# 编译器

1. Vue.prototype.$mount `/src/platforms/web/entry-runtime-with-compiler.js`

```js
Vue.prototype.$mount = function () {
    if (!options.render) {
        if (template) {

            // 编译模版，得到 动态渲染函数和静态渲染函数
            const { render, staticRenderFns } = compileToFunctions(template, {
                // 在非生产环境下，编译时记录标签属性在模版字符串中开始和结束的位置索引
                outputSourceRange: process.env.NODE_ENV !== 'production',
                shouldDecodeNewlines,
                shouldDecodeNewlinesForHref,
                // 界定符，默认 {{}}
                delimiters: options.delimiters,
                // 是否保留注释
                comments: options.comments
            }, this)
            // 将两个渲染函数放到 this.$options 上
            options.render = render
            options.staticRenderFns = staticRenderFns

        }
    }
}
```

Vue.prototype.$mount 中会先判断组件有没有 render 函数，如果没有就根据处理好的 template 去生成 render 函数。

2. compileToFunctions 方法是由一系列方法生成的。

* `src\compiler\index.js` baseCompile 基础编译器，编译阶段最重要的代码就在其中，编译核心主要做三件事：
    1. 将 html 模版解析成 ast
    2. 对 ast 树进行静态标记，做优化
    3. 将 ast 生成字符串形式的渲染函数代码
* `src\compiler\create-compiler.js` createCompilerCreator 将 baseCompile 基础编译器包装后返回。包装多做了两件事：
    1. 调用 baseCompile 之前将 options 和 baseOptions 合并
    2. 调用 baseCompile 之后将 error 和 tip 信息挂在编译结果上
* `src\compiler\to-function.js` createCompileToFunctionFn 将之前包装的编译器再次包装后返回。这次包装多做了三件事：
    1. 将之前的 error 和 tip 信息打印到控制台
    2. 将编译结果返回的 code 通过 new Function() 生成 render 函数
    3. 将最终结果缓存

现在可以知道 Vue.prototype.$mount 中调用的 compileToFunctions 就是 createCompileToFunctionFn 包装后的那个函数

3. 