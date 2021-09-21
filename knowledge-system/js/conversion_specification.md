# 规范中的隐式转换

## 普通运算符

[链接](https://tc39.es/ecma262/#sec-ecmascript-language-expressions)

从 ES 标准中可以发现以下几种运算符做运算的时候，都调用了相同的抽象操作：
  1. Exponentiation Operator 指数运算，幂运算，例如： a ** 2
  2. Multiplicative Operators 乘法运算，例如：a * 2; a / 2; a % 2（乘法，除法，取余）
  3. Additive Operators 加法运算，例如 a + b; a - b（加法，减法）
  4. The Left Shift Operator; The Signed Right Shift Operator;  The Unsigned Right Shift Operator 左移，右移，无符号右移，例如： a << 2, a >> 2, a >>> 2
  5. Binary Bitwise Operators 二进制位运算符，例如 a & 1, a | 1, a ^ 1 （按位与，按位或，按位异或）

以上这些运算符（最常用的就是加减乘除）都调用了 ES 内部的抽象操作：`EvaluateStringOrNumericBinaryExpression ( leftOperand, opText, rightOperand )`。

以下是 EvaluateStringOrNumericBinaryExpression 的步骤：

```js
1. Let lref be the result of evaluating leftOperand.
2. Let lval be ? GetValue(lref).
3. Let rref be the result of evaluating rightOperand.
4. Let rval be ? GetValue(rref).
5. Return ? ApplyStringOrNumericBinaryOperator(lval, opText, rval).
```

获取到左操作数的值和右操作数的值后，又调用了抽象操作 `ApplyStringOrNumericBinaryOperator(lval, opText, rval)`

```js
// ApplyStringOrNumericBinaryOperator(lval, opText, rval)

1. Assert: opText is present in the table in step 8.
2. If opText is +, then
  a. Let lprim be ? ToPrimitive(lval).
  b. Let rprim be ? ToPrimitive(rval).
  c. If Type(lprim) is String or Type(rprim) is String, then
    i. Let lstr be ? ToString(lprim).
    ii. Let rstr be ? ToString(rprim).
    iii. Return the string-concatenation of lstr and rstr.
  d. Set lval to lprim.
  e. Set rval to rprim.
3. NOTE: At this point, it must be a numeric operation.
4. Let lnum be ? ToNumeric(lval).
5. Let rnum be ? ToNumeric(rval).
6. If Type(lnum) is different from Type(rnum), throw a TypeError exception.
7. Let T be Type(lnum).
8. Let operation be the abstract operation associated with opText in the following table:
  opText	operation
  **	T::exponentiate
  *	T::multiply
  /	T::divide
  %	T::remainder
  +	T::add
  -	T::subtract
  <<	T::leftShift
  >>	T::signedRightShift
  >>>	T::unsignedRightShift
  &	T::bitwiseAND
  ^	T::bitwiseXOR
  |	T::bitwiseOR
9. Return ? operation(lnum, rnum).
```

加号的运算是优先要判断处理的，它和其他运算符不一样。

```js
2. 如果运算符是 + ，则
  a. 计算 lprim 为 ToPrimitive(lval)
  b. 计算 rprim 为 ToPrimitive(rval)
  c. 如果 lprim 或 rprim 的类型是字符串，则
    i. 将 lprim 转换为字符串 lstr
    ii. 将 rprim 转换为字符串 rstr
    iii. 返回 lstr 和 rstr 的字符串拼接结果
  d. 将 lval 设置为 lprim
  e. 将 rval 设置为 rprim
3. 这之后必须是数值的操作了（也就是说两个操作数都必须转成数字类型了）
```

ToPrimitive 操作其实就是将非原始类型的值（比如对象和数组）转换成原始类型（比如字符串和数字）。

```js
// ToPrimitive ( input [ , preferredType ] )

1. Assert: input is an ECMAScript language value.
2. If Type(input) is Object, then
  a. Let exoticToPrim be ? GetMethod(input, @@toPrimitive).
  b. If exoticToPrim is not undefined, then
    i. If preferredType is not present, let hint be "default".
    ii. Else if preferredType is string, let hint be "string".
    iii. Else,
      1. Assert: preferredType is number.
      2. Let hint be "number".
    iv. Let result be ? Call(exoticToPrim, input, « hint »).
    v. If Type(result) is not Object, return result.
    vi. Throw a TypeError exception.
  c. If preferredType is not present, let preferredType be number.
  d. Return ? OrdinaryToPrimitive(input, preferredType).
3. Return input.

2. 如果输入值的类型是 Object，则
  a. 让 exoticToPrim 等于 GetMethod(input, @@toPrimitive) （获取这个类型对应的 toPrimitive 方法）
  b. 如果 exoticToPrim 存在，则
    i. 如果 preferredType （期望类型）不存在，则 hint 设置为 'default'
    ii. 如果 preferredType （期望类型） 是字符串，则 hint 设置为 'string'
    iii. 其他情况：
      1. preferredType 为数字
      2. hint 设置为 'number'
    iv. 让 result 等于 exoticToPrim 调用结果 Call(exoticToPrim, input, « hint »)
    v. 如果 result 的类型不是 Object，返回 result
    vi. 抛出 TypeError 类型错误
  c. 如果 preferredType 不存在，让 preferredType 是数字类型
  d. 返回 OrdinaryToPrimitive(input, preferredType) 的结果
3. 返回输入值 input
```


注意：如果 ToPrimitive 调用时没有 hint，则通常它就会认为 hint 是数字类型 number。默认情况下原始类型中只有 Date 和 Symbol 这两个类型定义了 Symbol.toPrimitive 属性，其他类型都没有这个属性，所以 GetMethod(input, @@toPrimitive) 会返回 undefined，因此数组和对象的 Symbol.toPrimitive 没有定义的时候会走 OrdinaryToPrimitive 逻辑。

`OrdinaryToPrimitive ( O, hint ) `的步骤如下：

```js
// OrdinaryToPrimitive ( O, hint )

1. Assert: Type(O) is Object.
2. Assert: hint is either string or number.
3. If hint is string, then
  a. Let methodNames be « "toString", "valueOf" ».
4. Else,
  a. Let methodNames be « "valueOf", "toString" ».
5. For each element name of methodNames, do
  a. Let method be ? Get(O, name).
  b. If IsCallable(method) is true, then
    i. Let result be ? Call(method, O).
    ii. If Type(result) is not Object, return result.
6. Throw a TypeError exception.

1. O 的类型是对象类型
2. hint 是字符串或数字
3. 如果 hint 是字符串
  a. 让 methodNames 为 « "toString", "valueOf" »
4. 否则
  a. 让 methodNames 为 « "valueOf", "toString" »
5. 循环 methodNames 的得到每一项为 name
  a. 让 method 等于 Get(O, name)
  b. 如果 method 是可被调用的，则
    i. 让 result 等于 Call(method, O)
    ii. 如果 result 不是对象类型，返回 result
6. 抛出 TypeError 错误
```

之前的 ApplyStringOrNumericBinaryOperator 中如果左操作数和右操作数调用 toPrimitive 返回的原始类型都不是字符串，则继续后续流程，会调用 ToNumeric 将它们都转换成数字类型。

```js
// ToNumeric ( value )

1. Let primValue be ? ToPrimitive(value, number).
2. If Type(primValue) is BigInt, return primValue.
3. Return ? ToNumber(primValue).

1. 让 primValue 等于调用 ToPrimitive 将 value 转换成的原始类型结果，preferredType 期望类型是 number
2. 如果 primValue 是 BigInt 类型，直接返回
3. 返回 ToNumber(primValue)
```

可以看到 ToNumeric 先调用了 ToPrimitive 并且期望值是 number，然后最后调用了 ToNumber。ToNumber 的转换规则如下表

|   参数类型   |  转换结果  |
|  ----  | ----  |
|  Undefined  | NaN  |
|  null  | +0  |
|  Boolean  | true 返回 1；false 返回 +0  |
|  Number  | 直接返回不转换  |
|  String  | 返回 StringToNumber 的结果  |
|  Symbol  | 抛出 TypeError 错误  |
|  BigInt  | 抛出 TypeError 错误  |
|  Object  | 1. 让 primValue 等于 ToPrimitive(argument, number) 的返回值 2. 返回 ToNumber(primValue)  |


## 非相等运算符

非相等运算符都调用了 `IsLessThan ( x, y, LeftFirst )`

```js
// IsLessThan ( x, y, LeftFirst )

1. If the LeftFirst flag is true, then
    a. Let px be ? ToPrimitive(x, number).
    b. Let py be ? ToPrimitive(y, number).
2. Else,
    a. NOTE: The order of evaluation needs to be reversed to preserve left to right evaluation.
    b. Let py be ? ToPrimitive(y, number).
    c. Let px be ? ToPrimitive(x, number).
3. If Type(px) is String and Type(py) is String, then
    a. If IsStringPrefix(py, px) is true, return false.
    b. If IsStringPrefix(px, py) is true, return true.
    c. Let k be the smallest non-negative integer such that the code unit at index k within px is different from the code unit at index k within py. (There must be such a k, for neither String is a prefix of the other.)
    d. Let m be the integer that is the numeric value of the code unit at index k within px.
    e. Let n be the integer that is the numeric value of the code unit at index k within py.
    f. If m < n, return true. Otherwise, return false.
4. Else,
    a. If Type(px) is BigInt and Type(py) is String, then
        i. Let ny be ! StringToBigInt(py).
        ii. If ny is NaN, return undefined.
        iii. Return BigInt::lessThan(px, ny).
    b. If Type(px) is String and Type(py) is BigInt, then
        i. Let nx be ! StringToBigInt(px).
        ii. If nx is NaN, return undefined.
        iii. Return BigInt::lessThan(nx, py).
    c. NOTE: Because px and py are primitive values, evaluation order is not important.
    d. Let nx be ? ToNumeric(px).
    e. Let ny be ? ToNumeric(py).
    f. If Type(nx) is the same as Type(ny), return Type(nx)::lessThan(nx, ny).
    g. Assert: Type(nx) is BigInt and Type(ny) is Number, or Type(nx) is Number and Type(ny) is BigInt.
    h. If nx or ny is NaN, return undefined.
    i. If nx is -∞𝔽 or ny is +∞𝔽, return true.
    j. If nx is +∞𝔽 or ny is -∞𝔽, return false.
    k. If ℝ(nx) < ℝ(ny), return true; otherwise return false.
```

主要步骤就是：
1. 调用 ToPrimitive 将左右操作数中非原始类型的转换成原始类型
2. 如果左右操作数都是 String，就按照字典顺序比较
3. 如果左右操作数一个是 BigInt 一个是 String，就将 String 转换成 BigInt 然后比较
4. 其他情况，将两个操作数都转换成 Number 比较

## 非严格相等运算符

非严格相等运算符调用了 `IsLooselyEqual ( x, y )`

```js
// IsLooselyEqual ( x, y )

1. If Type(x) is the same as Type(y), then
    a. Return IsStrictlyEqual(x, y).
2. If x is null and y is undefined, return true.
3. If x is undefined and y is null, return true.
4. NOTE: This step is replaced in section B.3.6.2.
5. If Type(x) is Number and Type(y) is String, return IsLooselyEqual(x, ! ToNumber(y)).
6. If Type(x) is String and Type(y) is Number, return IsLooselyEqual(! ToNumber(x), y).
7. If Type(x) is BigInt and Type(y) is String, then
    a. Let n be ! StringToBigInt(y).
    b. If n is NaN, return false.
    c. Return IsLooselyEqual(x, n).
8. If Type(x) is String and Type(y) is BigInt, return IsLooselyEqual(y, x).
9. If Type(x) is Boolean, return IsLooselyEqual(! ToNumber(x), y).
10. If Type(y) is Boolean, return IsLooselyEqual(x, ! ToNumber(y)).
11. If Type(x) is either String, Number, BigInt, or Symbol and Type(y) is Object, return IsLooselyEqual(x, ? ToPrimitive(y)).
12. If Type(x) is Object and Type(y) is either String, Number, BigInt, or Symbol, return IsLooselyEqual(? ToPrimitive(x), y).
13. If Type(x) is BigInt and Type(y) is Number, or if Type(x) is Number and Type(y) is BigInt, then
    a. If x or y are any of NaN, +∞𝔽, or -∞𝔽, return false.
    b. If ℝ(x) = ℝ(y), return true; otherwise return false.
14. Return false.
```

主要步骤如下：

1. 如果 x 和 y 类型一样，返回 IsStrictlyEqual(x, y) 的比较结果（其实就和严格相等运算符一样）
2. x 和 y 如果是 null 或 undefined，直接返回 true
3. x 和 y 中有对象类型存在，就调用 toPrimitive 转换成原始类型然后再比较
4. x 和 y 都是原始类型，都转换成数字比较
5. x 和 y 是 BigInt 和 String ，把 String 转换成 BigInt 然后再比较

## 严格相等运算符

严格相等运算符调用了 ` IsStrictlyEqual ( x, y )`

```js
// IsStrictlyEqual ( x, y )

1. If Type(x) is different from Type(y), return false.
2. If Type(x) is Number or BigInt, then
    a. Return ! Type(x)::equal(x, y).
3. Return ! SameValueNonNumeric(x, y).
```

1. 如果 x 和 y 类型不一样，返回 false
2. 如果是 Number 或者 BigInt 类型，调用 equal(x, y)
3. 否则调用 SameValueNonNumeric(x, y)


`SameValueNonNumeric ( x, y )`

```js
// SameValueNonNumeric ( x, y )

1. Assert: Type(x) is not Number or BigInt.
2. Assert: Type(x) is the same as Type(y).
3. If Type(x) is Undefined, return true.
4. If Type(x) is Null, return true.
5. If Type(x) is String, then
    a. If x and y are exactly the same sequence of code units (same length and same code units at corresponding indices), return true; otherwise, return false.
6. If Type(x) is Boolean, then
    a. If x and y are both true or both false, return true; otherwise, return false.
7. If Type(x) is Symbol, then
    a. If x and y are both the same Symbol value, return true; otherwise, return false.
8. If x and y are the same Object value, return true. Otherwise, return false.
```

1. x 和 y 类型相等，但是不是 Number 或 BigInt
2. x 是 Undefined 或 null，直接返回 true
3. 字符串一个字符一个字符比较
4. 布尔值都是 true 或 都是 false 返回 true，否则返回 false
5. Symbol 如果是同一个 Symbol 值，返回 true，否则返回 false
6. 如果是同一个对象，返回 true，否则返回 false

## 总结

### 基础运算符（加减乘除，指数，位运算，二进制左移右移）

1. 运算符是加号 + 的情况单独处理
  1. 调用 ToPrimitive 将左右操作数变成原始类型
    1. 此处开始 ToPrimitive 操作。如果参数是对象类型，获取这个类型的 toPrimitive 方法
    2. 如果类型对应的 toPrimitive 方法存在，则设置 hint 为 default（没有期望），string（期望字符串），number（期望数字）然后返回 toPrimitive 方法调用结果作为结果
    3. 如果 toPrimitive 方法不存在，则按照期望类型先后调用 valueOf toString （期望 number），toString valueOf（期望字符串），然后返回结果
2. 加号 + 的情况 toPrimitive 返回后，如果左右操作数中有一个是字符串，则两个都转换为字符串，然后返回字符串拼接的结果
3. 否则，其他情况都是数字计算的情况，两个操作数都转换成数字然后计算

### 非相等运算符（大于，小于，大于等于，小于等于）

1. 调用 ToPrimitive 将左右操作数中非原始类型的转换成原始类型
2. 如果左右操作数都是 String，就按照字典顺序比较
3. 如果左右操作数一个是 BigInt 一个是 String，就将 String 转换成 BigInt 然后比较
4. 其他情况，将两个操作数都转换成 Number 比较

### 不严格相等运算符

1. 如果 x 和 y 类型一样，返回 IsStrictlyEqual(x, y) 的比较结果（其实就和严格相等运算符一样）
2. x 和 y 如果是 null 或 undefined，直接返回 true
3. x 和 y 中有对象类型存在，就调用 toPrimitive 转换成原始类型然后再比较
4. x 和 y 都是原始类型，且类型不一样，那就都转换成数字比较
5. x 和 y 是 BigInt 和 String ，把 String 转换成 BigInt 然后再比较

### 严格相等运算符

1. 如果 x 和 y 类型不一样，返回 false
2. 如果是 Number 或者 BigInt 类型，调用 equal(x, y)
3. 否则调用 SameValueNonNumeric(x, y)

### 一元操作符 +

1. 调用 ToNumber
2. 如果参数是引用类型对象，调用 ToPrimitive(argument, number) 后再调用 ToNumber

### 一元操作符 !

1. 先调用 ToBoolean 将操作数转换成布尔值（null undefined 0 NaN false '' 返回 false，其他一律 true）
2. 然后对布尔值取反，返回结果