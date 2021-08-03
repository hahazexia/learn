# 立即执行函数表达式

如果一行代码是以 `function` 开始的，那么 js 引擎就会将它解析成函数声明语句。

函数声明语句是不能立即调用的，如果在它后面写上圆括号调用，会直接报错。 

```js
function a() {}() // Uncaught SyntaxError: Unexpected token ')'
```

因为圆括号有两种使用方法，一种是写在函数名后表示调用函数，一种是在其中写表达式表示计算表达式的值。

```js
a(); // 函数调用
(1 + 2); // 计算表达式的值
```

如果作为表达式来写，圆括号里的表达式不能为空，否则会报错。

```js
() // Uncaught SyntaxError: Unexpected token ')'
```

这就是第一个例子报错的原因，写在函数声明之后的圆括号被认为是一个表达式，如果里面是空的，就会报错。

```js
function a() {}()
// 相当于如下写法
function a() {}
() // 报错
```

因此只要让 js 引擎认为前面不是函数声明，那么就可以做到函数定义后立即执行了。

```js
var a = function() {}()
+function () {}()
-function () {}()
void function () {}()

;(function() {})()
;(function() {}())
```

IIFE（Immediately Invoked Function Expression） 的好处是避免了外界访问此 IIFE 中的变量，而且又不会污染全局作用域。如果需要外界使用其中的变量，将变量返回出来即可。

```js
var result = (function () {
    var name = "Barry";
    return name;
})();
// IIFE 执行后返回的结果：
result; // "Barry"
```

js 库经常使用 IIFE 来实现模块，这样不会污染全局环境

```js
;(function (global, xxx) {
    global.xxx = xxx()
})(this, function () {/* 库的定义，返回一个对象 */})
```

括号有个缺点，那就是如果上一行代码不写分号，括号会被解释为上一行代码最末的函数调用，产生完全不符合预期，并且难以调试的行为，加号等运算符也有类似的问题。所以一些推荐不加分号的代码风格规范，会要求在括号前面加上分号。

```js
;(function(){}())
```

