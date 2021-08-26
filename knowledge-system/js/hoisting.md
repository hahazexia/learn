# 变量提升

变量提升（Hoisting）被认为是， Javascript中执行上下文 （特别是创建和执行阶段）工作方式的一种认识。在 ECMAScript® 2015 Language Specification 之前的JavaScript文档中找不到变量提升（Hoisting）这个词。

例如，从概念的字面意义上说，“变量提升”意味着变量和函数的声明会在物理层面移动到代码的最前面，但这么说并不准确。实际上变量和函数声明在代码里的位置是不会动的，而是在编译阶段被放入内存中。

JavaScript 在执行任何代码段之前，将函数声明放入内存中的优点之一是，你可以在声明一个函数之前使用该函数。例如：

```js
/**
* 不推荐的方式：先调用函数，再声明函数
*/

catName("Chloe");

function catName(name) {
    console.log("我的猫名叫 " + name);
}

/*
代码执行的结果是: "我的猫名叫 Chloe"
*/
```

即使我们在定义这个函数之前调用它，函数仍然可以工作。这是因为在 JavaScript 中执行上下文的工作方式造成的。

变量提升也适用于其他数据类型和变量。变量可以在声明之前进行初始化和使用。但是如果没有初始化，就不能使用它们。

`编译阶段变量提升的时候，如果是同名的函数，JavaScript编译阶段会选择最后声明的那个。 如果变量和函数同名，那么在编译阶段，变量的声明会被忽略。`

JavaScript 只会提升声明，不会提升其初始化。如果一个变量先被使用再被声明和赋值的话，使用时的值是 undefined。

```js
console.log(num); // Returns undefined
var num;
num = 6;
```

其他几个例子

```js
// Example 1 - only y is hoisted
var x = 1;                 // 声明 + 初始化 x
console.log(x + " " + y);  // '1 undefined'
var y = 2;                 // 声明 + 初始化 y

// Example 2 - Hoists
var num1 = 3;                   // Declare and initialize num1
num2 = 4;                       // Initialize num2
console.log(num1 + " " + num2); //'3 4'
var num2;                       // Declare num2 for hoisting

// Example 3 - Hoists
a = 'Cran';              // Initialize a
b = 'berry';             // Initialize b
console.log(a + "" + b); // 'Cranberry'
var a, b;                // Declare both a & b for hoisting
```

函数表达式不会被提升：

```js
notHoisted(); // TypeError: notHoisted is not a function

var notHoisted = function() {
   console.log("bar");
};
```
## 函数形参和变量函数声明同名

函数的形参如果和函数中声明的变量重名了，那么变量声明的提升不影响函数形参：

```js
function foo(a) {
    console.log('a1', a);
    var a = 'test';
    console.log('a2', a)
}
foo(1)

// a1 1
// a2 test
```

如果函数形参和函数中声明的新函数同名，那么新函数会覆盖掉形参：

```js
function foo(a) {
    console.log('a1', a);
    function a() {}
    console.log('a2', a)
}
foo(1)

// a1 a(){}
// a2 a(){}
```

如果上面两种同时存在

```js
function foo(a) {
    console.log('a1', a);
    var a = 'test';
    function a() {}
    console.log('a2', a)
}
foo(1)

// a1 a(){}
// a2 test
```

还需要注意的是函数中重复声明和形参同名的变量，而且不赋值的话，那么之后使用这个变量的时候是形参的值。

```js
var a = 1;
function fn(a) {
    var a;
    console.log(a); // 1
}
fn(a);
```

## 题目

第一题

```js
function foo() {
    var a = b = 1;
    a++;
    return a;
}
foo()
console.log(b)
console.log(a)
```

<details>
<summary>答案</summary>

```js
function foo() {
    var a = b = 1;
    // 等价于 var a = 1; b = 1; 这样就声明了一个全局变量 b
    a++;
    return a;
}
foo()
console.log(b) // 1
console.log(a) // Uncaught ReferenceError: a is not defined
```
</details>
<br><br>

第二题

```js
console.log(a, b)
var a = 12, b = 'aaa'
function foo() {
    console.log(a, b)
    var a = b = 13
    console.log(a, b)
}
foo()
console.log(a, b)
```

<details>
<summary>答案</summary>

```js
console.log(a, b) // undefined undefined
var a = 12, b = 'aaa'
function foo() {
    console.log(a, b) // undefined 'aaa'
    var a = b = 13
    console.log(a, b) // 13 13
}
foo()
console.log(a, b) // 12 13
```
</details>
<br><br>

第三题

```js
console.log(a, b)
var a = 12, b = 'aaa'
function foo() {
    console.log(a, b)
    console.log(a, b)
}
foo()
console.log(a, b)
```

<details>
<summary>答案</summary>

```js
console.log(a, b) // undefined undefined
var a = 12, b = 'aaa'
function foo() {
    console.log(a, b) // 12 'aaa'
    console.log(a, b) // 12 'aaa'
}
foo()
console.log(a, b) // 12 'aaa'
```
</details>
<br><br>

第四题

```js
a = 0
function foo() {
    var a = 12;
    b = 'aaa'
    console.log('b' in window)
    console.log(a, b)
}

foo()
console.log(b)
console.log(a)
```

<details>
<summary>答案</summary>

```js
a = 0
function foo() {
    var a = 12;
    b = 'aaa'
    console.log('b' in window) // true
    console.log(a, b) // 12 'aaa'
}

foo()
console.log(b) // 'aaa'
console.log(a) // 0
```
</details>
<br><br>

第五题

```js
function foo() {
    console.log(a)
    a = 12;
    b = 'aaa'
    console.log('b' in window)
    console.log(a, b)
}
foo()
```

<details>
<summary>答案</summary>

```js
function foo() {
    console.log(a) // Uncaught ReferenceError: a is not defined
    a = 12;
    b = 'aaa'
    console.log('b' in window)
    console.log(a, b)
}
foo()
```
</details>
<br><br>

第六题

```js
fn();
console.log(v1);
console.log(v2);
console.log(v3);
function fn() {
    var v1 = v2 = v3 = 2019;
    console.log(v1);
    console.log(v2);
    console.log(v3);
}
```

<details>
<summary>答案</summary>

```js
fn();
console.log(v1); // Uncaught ReferenceError: v1 is not defined
console.log(v2);
console.log(v3);
function fn() {
    var v1 = v2 = v3 = 2019;
    console.log(v1); // 2019
    console.log(v2); // 2019
    console.log(v3); // 2019
}
```
</details>
<br><br>

第七题

```js
if (!("value" in window)) {
    var value = 2019; 
}
console.log(value); 
console.log('value' in window);
```

<details>
<summary>答案</summary>


```js
if (!("value" in window)) {
    var value = 2019; // 无论条件判断是否成立，变量声明都会提升到条件语句外层的最上面 
}
console.log(value); // undefined
console.log('value' in window); // true
```
</details>
<br><br>

第八题

```js
if (true) {
    console.log(print())
    function print() {
        console.log('aaa')
    }
}
console.log(print())
```

<details>
<summary>答案</summary>

```js
if (true) {
    console.log(print()) // 'aaa' undefined
    function print() {
        console.log('aaa')
    }
}
console.log(print()) // 'aaa' undefined
```
</details>
<br><br>

第九题

```js
console.log(a)
console.log(p())
if (true) {
    var a = 12
    function p() {
        console.log('aaa')
    }
}
```

<details>
<summary>答案</summary>

ES6 浏览器环境中，块级作用域中声明函数，表现类似 var 声明，变量提升只会提升函数名 f ，然后赋值 undefined。

```js
console.log(a) // undefined
console.log(p()) // Uncaught TypeError: p is not a function
if (true) {
    var a = 12
    function p() {
        console.log('aaa')
    }
}
```
</details>
<br><br>

第十题

```js
var y = 1
if (function f(){}) { 
    console.log(typeof f)
    y = y + typeof f
}
console.log(y)
```

<details>
<summary>答案</summary>

```js
var y = 1
if (function f(){}) { 
    console.log(typeof f) // undefined
    y = y + typeof f
}
console.log(y) // '1undefined'
```
</details>
<br><br>

第十一题

```js
var fn = 12
function fn() {
    console.log('aaa')
}
console.log(window.fn)
fn()
```

<details>
<summary>答案</summary>

如果变量和函数同名，那么在编译阶段，变量的声明会被忽略。

```js
var fn = 12
function fn() {
    console.log('aaa')
}
console.log(window.fn) // 12
fn() // Uncaught TypeError: fn is not a function
```
</details>
<br><br>

第十二题

```js
console.log('1', fn())
function fn() {
    console.log(1)
}

console.log('2', fn())
function fn() {
    console.log(2)
}

console.log('3', fn())
var fn = 'aaa'

console.log('4', fn())
function fn() {
    console.log(3)
}
```

<details>
<summary>答案</summary>


```js
console.log('1', fn()) // 3 '1' undefined
function fn() {
    console.log(1)
}

console.log('2', fn()) // 3 '2' undefined
function fn() {
    console.log(2)
}

console.log('3', fn()) // 3 '3' undefined
var fn = 'aaa'

console.log('4', fn()) // Uncaught TypeError: fn is not a function
function fn() {
    console.log(3)
}
```
</details>
<br><br>

第十三题

```js
var a = 2;
function a() {
    console.log(3);
}
console.log(typeof a);
```

<details>
<summary>答案</summary>

```js
var a = 2;
function a() {
    console.log(3);
}
console.log(typeof a); // number
```
</details>
<br><br>

第十四题

```js
console.log(fn);
var fn = 2019;
console.log(fn);
function fn(){}
```
<details>
<summary>答案</summary>

```js
console.log(fn); // fn() {}
var fn = 2019;
console.log(fn); // 2019
function fn(){}
```
</details>
<br><br>

第十五题

```js
let a = 0, b = 0;
function fn(a) {
  fn = function fn2(b) {
    console.log(a, b)
    console.log(++a + b)
  }
  console.log('a', a++)
}
fn(1);
fn(2);
```

<details>
<summary>答案</summary>

```js
let a = 0, b = 0;
function fn(a) {
  fn = function fn2(b) {
    console.log(a, b)
    console.log(++a + b)
  }
  console.log('a', a++)
}
fn(1); // 'a' 1
fn(2);
// 2 2
// 5
```
</details>
<br><br>

第十六题

```js
var foo = 'aaa';

(function(f) {
    console.log(foo);
    var foo = f || 'hello';
    console.log(foo)
})(foo);

console.log(foo)
```

<details>
<summary>答案</summary>

```js
var foo = 'aaa';

(function(f) {
    console.log(foo); // undefined
    var foo = f || 'hello';
    console.log(foo) // 'aaa'
})(foo);

console.log(foo) // 'aaa'
```
</details>
<br><br>

第十七题

```js
var foo = 'aaa';

(function(foo) {
    console.log(foo);
    var foo = foo || 'world';
    console.log(foo)
})(foo);

console.log(foo)
```

<details>
<summary>答案</summary>

```js
var foo = 'aaa';

(function(foo) {
    console.log(foo); // 'aaa'
    var foo = foo || 'world';
    console.log(foo) // 'aaa'
})(foo);

console.log(foo) // 'aaa'
```
</details>
<br><br>

第十八题

```js
var foo = 'aaa'

function a(foo) {
    console.log(foo);
    var foo = 1
    console.log(foo)
}

a(foo)
```

<details>
<summary>答案</summary>

```js
var foo = 'aaa'

function a(foo) {
    console.log(foo); // 'aaa'
    var foo = 1
    console.log(foo) // 1
}

a(foo)
```
</details>
<br><br>

第十九题

```js
var foo = 'aaa'

function a() {
    console.log(foo);
    var foo = 1
    console.log(foo)
}

a()
```

<details>
<summary>答案</summary>

```js
var foo = 'aaa'

function a() {
    console.log(foo); // undefined
    var foo = 1
    console.log(foo) // 1
}

a()
```
</details>
<br><br>

第二十题

```js
var foo = 'aaa';

function a(foo) {
    console.log(foo)
    function foo () {}
    var foo = 1
    console.log(foo)
}

a(foo)
```

<details>
<summary>答案</summary>

```js
var foo = 'aaa';

function a(foo) {
    console.log(foo) // function foo() {}
    function foo () {}
    var foo = 1
    console.log(foo) // 1
}

a(foo)
```
</details>
<br><br>