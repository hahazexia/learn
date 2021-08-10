# 类型判断

## 数据类型

七种基本类型:

* 数字（Number），整数或浮点数，例如： 42 或者 3.14159。
* 字符串（String），字符串是一串表示文本值的字符序列，例如："Howdy" 。
* 布尔值（Boolean），有2个值分别是：true 和 false.
* null ， 一个表明 null 值的特殊关键字。 JavaScript 是大小写敏感的，因此 null 与 Null、NULL或变体完全不同。
* undefined ，和 null 一样是一个特殊的关键字，undefined 表示变量未赋值时的属性。
* 任意精度的整数 (BigInt) ，可以安全地存储和操作大整数，甚至可以超过数字的安全整数限制。
* Symbol ( 在 ECMAScript 6 中新添加的类型)。是唯一且不可改变的数据类型。

一种引用类型：

* 对象（Object）。函数 Function 是一种特殊的对象。


## typeof

* 数值返回 "number"
* 字符串返回 "string"
* 布尔值返回 "boolean"
* Symbol 值返回 "symbol"
* BigInt 值返回 "bigint"
* undefined 返回 "undefined"
* null 返回 "object"
* NaN 返回 "number"
* 函数返回 "function"
* 其它返回 "object"

```js
typeof 123 //"number"
typeof '123' //"string"
typeof false //"boolean"
typeof Symbol() //"symbol"
typeof BigInt(1) //"bigint"
typeof undefined //"undefined"
typeof null // "object"

function f () {}
typeof f //"function"
typeof NaN //"number"

typeof {} //"object"
typeof [] //"object"
typeof null //"object"
typeof new Set() //"object"
typeof new Map() //"object"
typeof new Date() //"object"
typeof new RegExp() //"object"

```

## instanceof

instanceof 用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。

instanceof 左边是实例对象（必须是对象类型，不能是简单值，否则一直返回 false），右边是构造函数。

```js
new Number(1) instanceof Number // true
new Number(1) instanceof Object // true

1 instanceof Number // false
'aaa' instanceof String // false
true instanceof Boolean // false
Symbol() instanceof Symbol // false
BigInt(1) instanceof BigInt // false
null instanceof Object // false
undefined instanceof Object // false
```

## Object.prototype.toString.call()

```js

Object.prototype.toString.call(1) // "[object Number]"
Object.prototype.toString.call(true) // "[object Boolean]"
Object.prototype.toString.call('aaa') // "[object String]"
Object.prototype.toString.call(null) // "[object Null]"
Object.prototype.toString.call(undefined) // "[object Undefined]"
Object.prototype.toString.call(Symbol()) // "[object Symbol]"
Object.prototype.toString.call(BigInt(1)) // "[object BigInt]"

Object.prototype.toString.call([]) // "[object Array]"
Object.prototype.toString.call({}) // "[object Object]"

function f() {
    Object.prototype.toString.call(arguments) // [object Arguments]
}
```