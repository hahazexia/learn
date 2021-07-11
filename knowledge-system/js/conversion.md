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

## parseInt 和 parseFloat

### parseInt

* parseInt方法用于将字符串转为整数。如果参数不是一个字符串，则将其转换为字符串。parseInt的返回值只有两种可能，要么是一个十进制整数，要么是NaN
* 如果字符串头部有空格，空格会被自动去除
* 字符串转为整数的时候，是一个个字符依次转换，如果遇到不能转为数字的字符，就不再进行下去，返回已经转好的部分。
* 如果字符串的第一个字符不能转化为数字（后面跟着数字的正负号除外），返回NaN。
* 如果字符串以0x或0X开头，parseInt会将其按照十六进制数解析。
* 如果字符串以0开头，将其按照10进制解析。
* 会自动转为科学计数法的数字，parseInt会将科学计数法的表示方法视为字符串，因此导致一些奇怪的结果

```js
parseInt('123') // 123


parseInt('   81') // 81


parseInt(1.23) // 1
// 等同于
parseInt('1.23') // 1



parseInt('8a') // 8
parseInt('12**') // 12
parseInt('12.34') // 12
parseInt('15e2') // 15
parseInt('15px') // 15



parseInt('abc') // NaN
parseInt('.3') // NaN
parseInt('') // NaN
parseInt('+') // NaN
parseInt('+1') // 1


parseInt('0x10') // 16


parseInt('011') // 11


parseInt(1000000000000000000000.5) // 1
// 等同于
parseInt('1e+21') // 1
parseInt(0.0000008) // 8
// 等同于
parseInt('8e-7') // 8
```

* parseInt方法还可以接受第二个参数（2到36之间），表示被解析的值的进制。parseInt的第二个参数默认为10，也就是十进制转十进制
* 第二个参数不是数值，会被自动转为一个整数。这个整数只有在2到36之间，才能得到有意义的结果，超出这个范围，则返回NaN。如果第二个参数是0、undefined和null，则直接忽略。
* 如果字符串包含对于指定进制无意义的字符，则从最高位开始，只返回可以转换的数值。如果最高位无法转换，则直接返回NaN。
* 如果parseInt的第一个参数不是字符串，会被先转为字符串。这会导致一些令人意外的结果。八进制的前缀0，尤其需要注意

```js
parseInt('1000') // 1000
// 等同于
parseInt('1000', 10) // 1000


parseInt('1000', 2) // 8
parseInt('1000', 6) // 216
parseInt('1000', 8) // 512


parseInt('10', 37) // NaN
parseInt('10', 1) // NaN
parseInt('10', 0) // 10
parseInt('10', null) // 10
parseInt('10', undefined) // 10


parseInt('1546', 2) // 1
parseInt('546', 2) // NaN


parseInt(0x11, 36) // 43
parseInt(0x11, 2) // 1
// 等同于
parseInt(String(0x11), 36)
parseInt(String(0x11), 2)
// 等同于
parseInt('17', 36)
parseInt('17', 2)


parseInt(011, 2) // NaN
// 等同于
parseInt(String(011), 2)
// 等同于
parseInt(String(9), 2)
```

### parseFloat

* parseFloat方法用于将一个字符串转为浮点数。parseFloat方法会自动过滤字符串前导的空格。
* 如果字符串符合科学计数法，则会进行相应的转换。
* 如果字符串包含不能转为浮点数的字符，则不再进行往后转换，返回已经转好的部分。
* 如果参数不是字符串，或者字符串的第一个字符不能转化为浮点数，则返回NaN。

```js
parseFloat('3.14') // 3.14
parseFloat('\t\v\r12.34\n ') // 12.34


parseFloat('314e-2') // 3.14
parseFloat('0.0314E+2') // 3.14


parseFloat('3.14more non-digit characters') // 3.14


parseFloat([]) // NaN
parseFloat('FF2') // NaN
parseFloat('') // NaN


parseFloat(true)  // NaN
Number(true) // 1

parseFloat(null) // NaN
Number(null) // 0

parseFloat('') // NaN
Number('') // 0

parseFloat('123.45#') // 123.45
Number('123.45#') // NaN
```