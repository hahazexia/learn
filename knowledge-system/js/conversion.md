# 类型转换

虽然变量的数据类型是不确定的，但是各种运算符对数据类型是有要求的。如果运算符发现，运算子的类型与预期不符，就会自动转换类型。

## 强制转换

强制转换主要指使用 Number()、String() 和 Boolean() 三个函数，手动将各种类型的值，分别转换成数字、字符串或者布尔值。

### Number()

* 原始类型值

```js
// 数值：转换后还是原来的值
Number(324) // 324

// 字符串：如果可以被解析为数值，则转换为相应的数值
Number('324') // 324

// 字符串：如果不可以被解析为数值，返回 NaN
Number('324abc') // NaN

// 空字符串转为0
Number('') // 0

// 布尔值：true 转成 1，false 转成 0
Number(true) // 1
Number(false) // 0

// undefined：转成 NaN
Number(undefined) // NaN

// null：转成0
Number(null) // 0
```

parseInt 和 Number 函数都会自动过滤一个字符串前导和后缀的空格。

* 对象

简单的规则是，Number方法的参数是对象时，将返回 NaN，除非是包含单个数值的数组。

```js
Number({a: 1}) // NaN
Number([1, 2, 3]) // NaN
Number([5]) // 5

// 对象转换时，先调用 valueOf 方法, 结果返回对象本身，然后调用 toString 方法，这时返回字符串[object Object]

// 而数组转换时，先调用 valueOf 返回数组本身，然后调用 toString ，[1, 2, 3] 返回 '1,2,3' 而 [5] 返回 '5'
```

原因：

第一步，调用对象自身的 valueOf 方法。如果返回原始类型的值，则直接对该值使用Number函数，不再进行后续步骤。

第二步，如果 valueOf 方法返回的还是对象，则改为调用对象自身的 toString 方法。如果 toString 方法返回原始类型的值，则对该值使用 Number 函数，不再进行后续步骤。

第三步，如果 toString 方法返回的是对象，就报错。


### String()

* 原始类型值
    * 数值：转为相应的字符串。
    * 布尔值：true转为字符串"true"，false转为字符串"false"。
    * undefined：转为字符串"undefined"。
    * null：转为字符串"null"。

```js
String(123) // "123"
String(true) // "true"
String(undefined) // "undefined"
String(null) // "null"
```

* 对象

String方法的参数如果是对象，返回一个类型字符串；如果是数组，返回该数组的字符串形式。

```js
String({a: 1}) // "[object Object]"
String([1, 2, 3]) // "1,2,3"
```

第一步，先调用对象自身的 toString 方法。如果返回原始类型的值，则对该值使用 String 函数，不再进行以下步骤。

第二步，如果 toString 方法返回的是对象，再调用原对象的 valueOf 方法。如果 valueOf 方法返回原始类型的值，则对该值使用 String 函数，不再进行以下步骤。

第三步，如果 valueOf 方法返回的是对象，就报错。

### Boolean()

* 0（+0 和 -0）
* ''
* null
* undefined
* NaN

这 5 个返回 false，其它都返回 true

## 自动转换

遇到以下三种情况时，JavaScript 会自动转换数据类型，即转换是自动完成的，用户不可见。

第一种情况，不同类型的数据互相运算。

```js
123 + 'abc' // "123abc"
```
第二种情况，对非布尔值类型的数据求布尔值。

```js
if ('abc') {
  console.log('hello')
}  // "hello"

let a
a ? 'a' : 'b'
```
第三种情况，对非数值类型的值使用一元运算符（即 + 和 -）。

```js
+ {foo: 'bar'} // NaN
- [1, 2, 3] // NaN
```

自动转换的规则是这样的：预期什么类型的值，就调用该类型的转换函数。比如，某个位置预期为字符串，就调用 String() 函数进行转换。如果该位置既可以是字符串，也可能是数值，那么默认转为数值。


* 当一个值为字符串，另一个值为非字符串，则非字符串值转为字符串。

```js
1 + 'a' // '1a'
'a' + 1 // 'a1'
```

* 除了加法运算符（+）有可能把运算子转为字符串，其他运算符都会把运算子自动转成数值。

```js
'5' - '2' // 3
'5' * '2' // 10
true - 1  // 0
false - 1 // -1
'1' - 1   // 0
'5' * []    // 0
false / '5' // 0
'abc' - 1   // NaN
null + 1 // 1
undefined + 1 // NaN
```

* 一元运算符也会把运算子转成数值。

```js
+'abc' // NaN
-'abc' // NaN
+true // 1
-false // 0
```