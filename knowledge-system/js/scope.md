# 作用域

## 定义

作用域是指变量存在的范围。

有三种作用域：

* 全局作用域
* 函数作用域
* 块级作用域（ES6）

## 全局作用域

全局作用域声明的变量就是全局变量。

## 函数作用域

函数作用域需要注意的一点是它的作用域是声明时所在的作用域，而不是运行时的。

```js
var a = 1;
var x = function () {
  console.log(a);
};

function f() {
  var a = 2;
  x();
}

f() // 1
```

## 块级作用域

let 和 const 为 js 增加了块级作用域。

```js
function f1() {
  let n = 5;
  if (true) {
    let n = 10;
  }
  console.log(n); // 5
}
```

## 块级作用域中的函数声明

```js
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    function f() { console.log('I am inside!'); }
  }

  f();
}());
```

上面的代码在 es5 环境中会打印 'I am inside!'，因为变量提升将内部的 f 函数提升到了函数内部最上面。

```js
// ES5 环境
function f() { console.log('I am outside!'); }

(function () {
  function f() { console.log('I am inside!'); }
  if (false) {
  }
  f();
}());

```

而在 ES6 浏览器环境中表现不一样了，变量提升只会提升函数名 f ，然后赋值 undefined。

```js
// 浏览器的 ES6 环境
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```

等价于下面的代码

```js
// 浏览器的 ES6 环境
function f() { console.log('I am outside!'); }
(function () {
  var f = undefined;
  if (false) {
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```