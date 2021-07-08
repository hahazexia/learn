# 原型链

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
缺点： 只能继承父类实例的属性方法，不能继承父类原型的属性方法

* 原型继承：子类的原型等于一个父类实例

```js
Sub.prototype = new Super();
Sub.prototype.constructor = Sub;
```
缺点：如果父类的实例有引用类型的属性，例如数组或对象，则会被所有子类实例共享。还有一个缺点，实例化时不能向父类构造函数传参。

* 组合继承：组合了构造继承和原型继承

```js
function Sub(value) {
    Super.all(this);
    this.prop = value
}

Sub.prototype = new Super();
Sub.prototype.constructor = Sub;
```
缺点：调用了两次父类构造函数


* 寄生组合继承：子类的原型指向父类的原型，这样子类就可以继承父类原型

```js
function Sub(value) {
    Super.all(this);
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


```
