# 作用域

## 定义

作用域是指在程序中定义变量的区域，该位置决定了变量的生命周期。通俗地理解，作用域就是变量与函数的可访问范围，即作用域控制着变量和函数的可见性和生命周期。

有三种作用域：

* 全局作用域
* 函数作用域
* 块级作用域（ES6）

## 全局作用域

全局作用域中的对象在代码中的任何地方都能访问，其生命周期伴随着页面的生命周期。

## 函数作用域

函数作用域就是在函数内部定义的变量或者函数，并且定义的变量或者函数只能在函数内部被访问。函数执行结束之后，函数内部定义的变量会被销毁。

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

## ES6 如何同时实现块级作用域和变量提升

```js

function foo() {
    var a = 1
    let b = 2
    {
      let b = 3
      var c = 4
      let d = 5
      console.log(a)
      console.log(b)
    }
    console.log(b) 
    console.log(c)
    console.log(d)
}

foo()
```

1. foo 函数被调用，编译并创建 foo 函数的执行上下文。其中包含变量环境和词法环境。
  * 变量环境中：a = undefined  c = undefined
  * 词法环境：b = undefined
2. 执行代码。变量环境中的 a 被赋值为 1，词法环境中的 b 被赋值为 2
3. 进入块级作用域，词法环境中的栈压入块级作用域的新变量 b = undefined 和 d = undefined。然后执行块作用域中的代码，b 赋值为 3，d 赋值为 5。变量环境中的 c 赋值为 4。然后执行打印操作，打印的是变量环境中的 a = 1 和 词法环境中栈顶的块作用域的 b = 3。
4. 块作用域代码执行完毕，词法环境中栈顶的块作用域变量从栈中弹出。
5. 接着执行函数作用域中剩余代码


注意：

* 在词法环境内部，维护了一个小型栈结构，栈底是函数最外层的变量，进入一个块作用域后，就会把该块作用域内部的变量压到栈顶；当作用域执行完成之后，该作用域的信息就会从栈顶弹出，这就是词法环境的结构。
* 执行块作用域中代码需要查找变量时，具体查找方式是：沿着词法环境的栈顶向下查询，如果在词法环境中的某个块中查找到了，就直接返回给 JavaScript 引擎，如果没有查找到，那么继续在变量环境中查找。

## 作用域链

* 每个执行上下文的变量环境中，都包含了一个外部引用，用来指向外部的执行上下文，我们把这个外部引用称为 outer。
* 查找变量时，如果在当前的变量环境中没有查找到，那么 JavaScript 引擎会继续在 outer 所指向的执行上下文中查找
* 这个查找的链条就称为作用域链

## 词法作用域

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

* 词法作用域就是指作用域是由代码中函数声明的位置来决定的，所以词法作用域是静态的作用域，通过它就能够预测代码在执行过程中如何查找标识符。
* 词法作用域是代码编译阶段就决定好的，和函数是怎么调用的没有关系。

## 块级作用域中的变量查找

```js

function bar() {
    var myName = "bar name"
    let test1 = 100
    if (1) {
        let myName = "bar inner name"
        console.log(test)
    }
}
function foo() {
    var myName = "foo name"
    let test = 2
    {
        let test = 3
        bar()
    }
}
var myName = "global name"
let myAge = 10
let test = 1
foo()
```

当代码执行到 bar 中打印时，调用栈如下（从栈顶到栈底）：

- bar 执行上下文
  + 变量环境
    * myName = "bar name"
    * outer 外部引用指向全局执行上下文
  + 词法环境
    * myName = "bar inner name"
    * test1 = 100
- foo 执行上下文
  + 变量环境
    * myName = "foo name"
    * outer 外部引用指向全局执行上下文
  + 词法环境
    * test = 3
    * test = 2
- 全局执行上下文
  + 变量环境
    * myName = "global name"
  + 词法环境
    * myAge = 10  test = 1

注意词法环境自己也是栈结构。


bar 函数中打印 test 变量的时候，查找变量的顺序如下：

- bar 执行上下文
  + 变量环境 ------------------------------------- 3
    * myName = "bar name"
    * outer 外部引用指向全局执行上下文
  + 词法环境 
    * myName = "bar inner name" ------------------------------------- 1
    * test1 = 100 ------------------------------------- 2
- foo 执行上下文
  + 变量环境
    * myName = "foo name"
    * outer 外部引用指向全局执行上下文
  + 词法环境
    * test = 3
    * test = 2
- 全局执行上下文
  + 变量环境
    * myName = "global name" ------------------------------------- 5
  + 词法环境
    * myAge = 10  test = 1 ------------------------------------- 4