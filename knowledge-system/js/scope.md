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

