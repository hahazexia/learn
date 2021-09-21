# 原型链

## new 调用的时候发生了什么

1. 以函数的 prototype 为原型创建一个对象。
2. 将这个对象赋值给函数内部的this关键字。
3. 开始执行构造函数内部的代码。
4. 如果函数返回值是对象，则返回这个对象，否则返回第一步创建的对象

下面是 `new` 命令简化的内部流程：

```js
function _new(/* 构造函数 */ constructor, /* 构造函数参数 */ params) {
  // 将 arguments 对象转为数组
  var args = [].slice.call(arguments);
  // 取出构造函数
  var constructor = args.shift();
  // 创建一个空对象，继承构造函数的 prototype 属性
  var context = Object.create(constructor.prototype);
  // 执行构造函数
  var result = constructor.apply(context, args);
  // 如果返回结果是对象，就直接返回，否则返回 context 对象
  return (typeof result === 'object' && result != null) ? result : context;
}

// 实例
var actor = _new(Person, '张三', 28);
```


## 什么是原型链

* 每个构造函数都有一个原型对象 `prototype`，例如：`Object.prototype`
* 原型对象都包含一个指向构造函数本身的指针 `constructor`，例如：`Object === Object.prototype.constructor`
* 实例都包含一个指向原型对象的内部指针 `__proto__`，例如：`obj.__proto__ === Object.prototype`
* 当一个构造函数的原型对象 `prototype` 是另外一个原型对象的实例的时候，内部指针 `__proto__` 会将这些原型对象串联起来，这就是 `原型链`。

```js
String.prototype.__proto__ === Object.prototype
// String 类型的原型对象的内部指针 __proto__ 指向了 Object 类型的原型对象
```
如下图所示：

```js
                 .prototype             ┌───────────────────┐      .__proto__
            ┌───────────────────────────►  Array.prototype  ├─────────────────────┐    .__proto__    ┌────────┐
            │                           └──┬────────────────┘                     │ ┌───────────────►│ null   │
            │        .constructor          │                                      │ │                └────────┘
       ┌────┼──────────────────────────────┘                                      │ │
       │    │                                                                     │ │
       │    │                                                                     │ │
       │    │                                                                     │ │
┌──────▼──┐ │                                                                   ┌─▼─┴──────────────────┐
│  Array  ├─┘                                                             ┌─────┤  Object.prototype    ◄───────────┐
└─────────┘                                                               │     └──────────────────────┘           │
                                                                          │                                        │
                                                                          │                                        │
                                                                          │                                        │
                                                                          │ .constructor                           │
                                                                          └───────────────────┐                    │
                                                                                              │                    │
                                                                                              │                    │
                                                                                              │                    │
                                                                                              │                    │
                                                                                 ┌────────────▼──┐ .prototype      │
                                                                                 │  Object       ├─────────────────┘
                                                                                 └───────────────┘
```

但是所有构造函数都是 Function 类型的对象，拥有 Function 类型的属性和方法，构造函数和 Function.prototype 是什么关系呢？<br>

其实，所有构造函数都有一个内部指针 `__proto__` 指向了 `Function.prototype`，如下图所示：

```js
                 .prototype             ┌───────────────────┐      .__proto__
            ┌───────────────────────────►  Array.prototype  ├─────────────────────┐    .__proto__    ┌────────┐
            │                           └──┬────────────────┘                     │ ┌───────────────►│ null   │
            │        .constructor          │                                      │ │                └────────┘
       ┌────┼──────────────────────────────┘                                      │ │
       │    │                                                                     │ │
       │    │                                                                     │ │
       │    │                                                                     │ │
┌──────▼──┐ │                                                                   ┌─▼─┴──────────────────┐
│  Array  ├─┘                                                             ┌─────┤  Object.prototype    ◄───────────┐
└───┬─────┘                                                               │     └────▲─────────────────┘           │
    │                                                                     │          │                             │
    │          .__proto__                                  .__proto__     │          │                             │
    └───────────────────────────┐             ┌───────────────────────────┼──────────┘                             │
                                │             │                           │                                        │
                                │             │                           │ .constructor                           │
                                │             │                           └───────────────────┐                    │
                                │             │                                               │                    │
                                │             │                                               │                    │
                                │             │                                               │                    │
                                │             │                                               │                    │
┌──────────┐  .prototype    ┌───▼─────────────┴──┐         .__proto__            ┌────────────▼──┐ .prototype      │
│ Function ├────────────────► Function.prototype ◄───────────────────────────────┤  Object       ├─────────────────┘
└─┬───▲────┘                └──────────────┬──▲──┘                               └───────────────┘
  │   │        .constructor                │  │
  │   └────────────────────────────────────┘  │
  │                                           │
  │              .__proto__                   │
  └───────────────────────────────────────────┘
```

这样就解决了构造函数拥有 `Function.prototype` 上的属性和方法的问题。[查看](https://asciiflow.com/#/share/eJztV0tqwzAQvYqZdQi0UGi866bbXkBgXKNFiisFVYaYEOiiRyjOPbIMPU1OUsdOan0d2ZbTQCtmYQXNmzfjp5l4BSR%2BxRCSLE0nkMY5ZhDCCsESQTi7u5kgyMun29l9%2BcTxkpcbBIG6pgtGOeX5Aks%2F7z%2B%2FhtgRO4oq9ChCiHhEN1uxC4IHxuJcTMkLtJzL%2BQT0bLWye660jtkdt9gd3A5yqhHsWUwTSt44yxJOmWuaOrtuhWjYjCKejgW25SSx7FSUP4NvEZ9QcD8xdeB%2BVlM%2BthZBfT7IqUp7en7BCZdb8n7z4U7Th5TbSBvJF9vBN6uRnkJTHCEssC25OSt09Y05t4aAg707mL32AyXZ2xxLcOZU67799C%2BENw%2BrS4X3%2FbbGoOmC8B%2F%2BWsK7KUeZIVK7HqRFY6t1Vro45tUvj5%2F0gseMJHxOSa8LVH4GnPyFCPW%2F21HtNL47lkQz8zvWhqxBHb3KtbUiDg9Q3ZYaWcBv68jVMc3zwqYycF1WL%2FOl0b2uwRCsYf0NiW0upw%3D%3D)) <br>

读取对象的某个属性时，JavaScript 引擎先寻找对象本身的属性，如果找不到，就到它的原型去找，如果还是找不到，就到原型的原型去找。如果直到最顶层的Object.prototype还是找不到，则返回undefined。如果对象自身和它的原型，都定义了一个同名属性，那么优先读取对象自身的属性，这叫做“覆盖”（overriding）。

## 继承

* 构造继承：在子类的构造函数中，调用父类的构造函数

```js
function Sub(value) {
  Super.call(this);
  this.prop = value;
}
```
缺点： 只能继承父类实例的属性方法，不能继承父类原型的属性方法（直接给 prototype 设置的属性方法）

* 原型继承：子类的原型等于一个父类实例

```js
Sub.prototype = new Super();
Sub.prototype.constructor = Sub;
```
缺点：如果父类的实例有引用类型的属性，例如数组或对象，则会被所有子类实例共享。还有一个缺点，实例化时不能向父类构造函数传参。

* 组合继承：组合了构造继承和原型继承

```js
function Sub(value) {
    Super.call(this);
    this.prop = value
}

Sub.prototype = new Super();
Sub.prototype.constructor = Sub;
```
缺点：调用了两次父类构造函数


* 寄生组合继承：子类的原型指向父类的原型，这样子类就可以继承父类原型

```js
function Sub(value) {
    Super.call(this);
    this.prop = value
}

Sub.prototype = Object.create(Super.prototype);
Sub.prototype.constructor = Sub;

// 或者如下：

function Sub (value) {
    Super.call(this);
    this.prop = value;
}

const F = function () {};
F.prototype = Super.prototype;
Sub.prototype = new F();
Sub.prototype.constructor = Sub;

```

## constructor

在实现继承之后什么时候需要将子类型的 constructor 重新分配为 Sub 呢？

下面这种情况需要重新设置：

```js
function Parent() {};
function CreatedConstructor() {}

CreatedConstructor.prototype = Object.create(Parent.prototype);

CreatedConstructor.prototype.create = function create() {
  return new this.constructor();
}

new CreatedConstructor().create().create(); // error undefined is not a function since constructor === Parent
```

而下面这种情况就不需要了：

```js
function ParentWithStatic() {}

ParentWithStatic.startPosition = { x: 0, y:0 };
ParentWithStatic.getStartPosition = function getStartPosition() {
  return this.startPosition;
}

function Child(x, y) {
  this.position = {
    x: x,
    y: y
  };
}

Child.prototype = Object.create(ParentWithStatic.prototype);
Child.prototype.constructor = Child;

Child.prototype.getOffsetByInitialPosition = function getOffsetByInitialPosition() {
  var position = this.position;
  var startPosition = this.constructor.getStartPosition(); // error undefined is not a function, since the constructor is Child

  return {
    offsetX: startPosition.x - position.x,
    offsetY: startPosition.y - position.y
  }
};
```

总结一下就是如果使用了 constructor 属性并且希望获取到的是子类型那么就需要重新设置，否则就不需要。

## 题目

第一题

```js
function fun() {
  this.a = 0
  this.b = function() {
    alert(this.a)
  }
}

fun.prototype = {
    b: function() {
      this.a = 20
      alert(this.a)
    },
    c: function () {
      this.a = 30
      alert(this.a)
    }
}

var my_fun = new fun()

my_fun.b()
my_fun.c()
```

<details>
<summary>答案</summary>

```js
function fun() {
  this.a = 0
  this.b = function() {
    alert(this.a)
  }
}

fun.prototype = {
    b: function() {
      this.a = 20
      alert(this.a)
    },
    c: function () {
      this.a = 30
      alert(this.a)
    }
}

var my_fun = new fun()

my_fun.b() // alert 弹出 0
my_fun.c() // alert 弹出 30
```
</details>
<br><br>

第二题

```js
function Fn() {
  var n = 10
  this.m = 20
  this.aa = function() {
    console.log(this.m)
  }
}

Fn.prototype.bb = function () {
  console.log(this.n)
}

var f1 = new Fn
Fn.prototype = {
  aa: function() {
    console.log(this.m + 10)
  }
}

var f2 = new Fn
console.log(f1.constructor)
console.log(f2.constructor)
f1.bb()
f1.aa()
f2.aa()
f2.__proto__.aa()
f2.bb()
```

<details>
<summary>答案</summary>

```js
function Fn() {
  var n = 10
  this.m = 20
  this.aa = function() {
    console.log(this.m)
  }
}

Fn.prototype.bb = function () {
  console.log(this.n)
}

var f1 = new Fn
Fn.prototype = {
  aa: function() {
    console.log(this.m + 10)
  }
}

var f2 = new Fn
console.log(f1.constructor) // Fn() {}
console.log(f2.constructor) // Object() {}
f1.bb() // undefined
f1.aa() // 20
f2.aa() // 20
f2.__proto__.aa() // NaN
f2.bb() // Uncaught TypeError: f2.bb is not a function
```
</details>
<br><br>

第三题

```js
function Foo() {
  getName = function () {
    console.log(1)
  }
  return this
}

Foo.getName = function () {
  console.log(2)
}

Foo.prototype.getName = function(){
  console.log(3)
}

var getName = function (){
  console.log(4)
}

function getName() {
  console.log(5)
}

Foo.getName()
getName()
Foo().getName();
getName();
new Foo.getName()
new Foo().getName()
new new Foo().getName()
```

<details>
<summary>答案</summary>

```js
function Foo() {
  getName = function () {
    console.log(1)
  }
  return this
}

Foo.getName = function () {
  console.log(2)
}

Foo.prototype.getName = function(){
  console.log(3)
}

var getName = function (){
  console.log(4)
}

function getName() {
  console.log(5)
}

Foo.getName() // 2
getName() // 4
Foo().getName(); // 1
getName(); // 1
new Foo.getName()  // 2
new Foo().getName() // 3
new new Foo().getName() // 3
```
</details>
<br><br>

第四题

```js
function Fn() {
  var a = 12
  this.getName = function() {
    console.log('private getName')
  }
}

Fn.prototype.getName = function () {
  console.log('public getName')
}

var fn = new Fn()
var fn1 = new Fn()
console.log(fn.a)
console.log(fn.getName())
console.log(fn.getName === fn1.getName)
console.log(fn.__proto__.getName === fn1.__proto__.getName)
console.log(fn.__proto__.getName === Fn.prototype.getName)
console.log(fn.hasOwnProperty === Object.prototype.hasOwnProperty)
console.log(fn.constructor === Fn)
```

<details>
<summary>答案</summary>

```js
function Fn() {
  var a = 12
  this.getName = function() {
    console.log('private getName')
  }
}

Fn.prototype.getName = function () {
  console.log('public getName')
}

var fn = new Fn()
var fn1 = new Fn()
console.log(fn.a) // undefined
console.log(fn.getName()) // 'private getName'
console.log(fn.getName === fn1.getName) // false
console.log(fn.__proto__.getName === fn1.__proto__.getName) // true
console.log(fn.__proto__.getName === Fn.prototype.getName) // true
console.log(fn.hasOwnProperty === Object.prototype.hasOwnProperty) // true
console.log(fn.constructor === Fn) // true
```
</details>
<br><br>

第五题

```js
Function.prototype.a = () => alert(1);
Object.prototype.b = () => alert(2);
function A() {}
var a = new A();
a.b();
a.a();
```

<details>
<summary>答案</summary>

先 alert 2 然后报错，a.a is not a function。
</details>
<br><br>