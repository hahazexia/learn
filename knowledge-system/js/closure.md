# 闭包

## 定义

理论的定义：
* 一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）。也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域。在 JavaScript 中，每当创建一个函数，闭包就会在函数创建的同时被创建出来。（闭包其实是绑定了执行环境的函数）

实践的定义：
* 一个函数即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）

综上：闭包是指有权访问另一个函数作用域中变量的函数 

```js
function f1() {
  var n = 999;
  function f2() {
    console.log(n);
  }
  return f2;
}

var result = f1();
result(); // 999
```

由于在 JavaScript 语言中，只有函数内部的子函数才能读取内部变量，因此可以把闭包简单理解成“定义在一个函数内部的函数”。闭包最大的特点，就是它可以“记住”诞生的环境，比如f2记住了它诞生的环境f1，所以从f2可以得到f1的内部变量。在本质上，闭包就是将函数内部和函数外部连接起来的一座桥梁。


## 题目

第一题

```js
var n = 10
function fn() {
    var n = 20
    function f() {
       n++;
       console.log(n)
    }
    f()
    return f
}

var x = fn()
x()
x()
console.log(n)
```

<details>
<summary>答案</summary>

```js
var n = 10
function fn() {
    var n = 20
    function f() {
       n++;
       console.log(n)
    }
    f()
    return f
}

var x = fn() // 打印 21 然后 x 被赋值为 f()
x() // 22
x() // 23
console.log(n) // 10
```
</details>
<br><br>

第二题

```js
var a = 'aaa'
function foo() {
    var a = 'foo'
    function fo() {
        console.log(a)
    }
    return fo
}

function f(p) {
    var a = 'f'
    p()
}
f(foo())
```

<details>
<summary>答案</summary>

```js
var a = 'aaa'
function foo() {
    var a = 'foo'
    function fo() {
        console.log(a) // 打印 'foo'
    }
    return fo
}

function f(p) {
    var a = 'f'
    p()
}
f(foo())
```
</details>
<br><br>

第三题

```js
var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i);
  };
}

data[0]();
data[1]();
data[2]()
```

<details>
<summary>答案</summary>

```js
var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i);
  };
}

data[0](); // 3
data[1](); // 3
data[2]() // 3
```

使用 IIFE 形成闭包解决上面的问题

```js
var data = [];

for (var i = 0; i < 3; i++) {
    (function(j){
      data[j] = function () {
        console.log(j);
      }
    })(i)
}

data[0]();
data[1]();
data[2]()
```

或者使用 let 块级作用域

```js
var data = [];

for (let i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i);
  };
}

data[0]();
data[1]();
data[2]()
```
</details>
<br><br>

第四题

```js
var ary = [1, 2, 3, 4]

function fn(i) {
    return function(n) {
      console.log(n + (i++))
    }
}

var f = fn(10);
f(20);
fn(20)(40);
fn(30)(40);
f(30);
console.log(i)
```

<details>
<summary>答案</summary>

```js
var ary = [1, 2, 3, 4]

function fn(i) {
    return function(n) {
      console.log(n + (i++))
    }
}

var f = fn(10);
f(20); // 20 + 10 = 30
fn(20)(40); // 40 + 20 = 60
fn(30)(40); // 40 + 30 = 70
f(30); // 30 + 11 = 41
console.log(i) // Uncaught ReferenceError: i is not defined
```
</details>
<br><br>

第五题

以下的代码要实现5个 input 按钮循环绑定 click 点击事件，绑定完成后点击1、2、3、4、5五个按钮分别输出0、1、2、3、4五个字符。问下面的代码能否实现？不能实现，下面的输出效果是怎么样的？怎么修改才能达到想要的效果，说明理由

```html
<div id="btnBox">
  <input type="button" value="button_1" />
  <input type="button" value="button_2" />
  <input type="button" value="button_3" />
  <input type="button" value="button_4" />
  <input type="button" value="button_5" />
</div>
<script type="text/javascript">
  var btnBox = document.getElementById('btnBox'), input = btnBox.getElementsByTagName('input')
  var l = input.length
  for (var i = 0; i < l; i++) {
    input[i].onclick = function(){
      alter(i);
    }
  }
</script>
```

<details>
<summary>答案</summary>

* 不能实现。点击所有按钮都会 alert 弹出数字 5。

```js
  var btnBox = document.getElementById('btnBox'), input = btnBox.getElementsByTagName('input')
  var l = input.length
  for (var i = 0; i < l; i++) {
    (function (j) {
      input[j].onclick = function(){
        alter(j);
      }
    })(i)
  }
```
</details>
<br><br>


```js
var num = 10 
var obj = {
    num: 20
}

obj.fn = (function (num) {
  this.num = num * 3
  num++
  return function(n) {
      this.num += n
      num++
      console.log(num)
  }
})(obj.num)

var fn = obj.fn

fn(5)
obj.fn(10)
console.log(num, obj.num)
```


<details>
<summary>答案</summary>

```js
  var num = 10 // 60 => 65
  var obj = {
      num: 20 // 30
  }

  obj.fn = (function (num) { // 21 => 22 => 23
    this.num = num * 3
    num++
    return function(n) {
        this.num += n
        num++
        console.log(num)
    }
  })(obj.num)

  var fn = obj.fn

  fn(5) // 22
  obj.fn(10) // 23
  console.log(num, obj.num) // 65 30
```
</details>
<br><br>