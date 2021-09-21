# 柯里化

柯里化（Currying）是把接受多个参数的函数变换成接受一个单一参数(最初函数的第一个参数)的函数，并且返回接受余下的参数且返回结果的新函数的技术。

柯里化是在一个函数的基础上进行变换，得到一个新的预置了参数的函数。最后在调用新函数时，实际上还是会调用柯里化前的原函数。

## 参数定长的柯里化

```js
function curry(fn) {
  const argLen = fn.length;
  const presetArgs = [].slice.call(arguments, 1)

  return function() {
    const restArgs = [].slice.call(arguments)
    const allArgs = [...presetArgs, ...restArgs]

    if (allArgs.length >= argLen) {
      return fn.apply(this, allArgs)
    } else {
      return curry.call(null, fn, ...allArgs)
    }
  }
}

```

测试用例

```js
function fn(a, b, c) {
  return a + b + c;
}
var curried = curry(fn);
curried(1, 2, 3); // 6
curried(1, 2)(3); // 6
curried(1)(2, 3); // 6
curried(1)(2)(3); // 6
curried(7)(8)(9); // 24

```

## 参数不定长的柯里化

```js
function curry(fn) {
    let presetArgs = [].slice.call(arguments, 1);

    function curried() {
        let restArgs = [].slice.call(arguments);
        let allArgs = [...presetArgs, ...restArgs];

        return curry.call(null, fn, allArgs);
    }

    curried.toString = function () {
        return fn.apply(null, presetArgs);
    }
    return curried;
}
```

测试

```js
function dynamicAdd() {
  return [...arguments].reduce((prev, curr) => {
    return prev + curr
  }, 0)
}
var add = curry(dynamicAdd);
(add(1)(2)(3)(4)).toString() // 10
(add(1, 2)(3, 4)(5, 6)).toString() // 21
```

toString 的调用如果不对函数结果进行隐式转换就不会起作用，总是会打印函数，于是修改一下：

```js
function curry(fn) {
    let args = [].slice.call(arguments, 1)

    function curried () {
        if (arguments.length) {
            args = [...args, ...[].slice.call(arguments)];
            return curried;
        } else {
            return fn.apply(null, args);
        }
    }

    return curried
}

function dynamicAdd() {
    console.log(arguments, '看看')
  return [...arguments].reduce((prev, curr) => {
    return prev + curr
  }, 0)
}
var add = curry(dynamicAdd);

add(1, 2)(3, 4)(5, 6)() // 21
```

再次优化，每次计算结果后将后来追加的参数置空，这样不会发生再次调用参数不断累加的情况

```js
function curry(fn) {
    let preArgs = [].slice.call(arguments, 1);
    let resArgs = [];

    function curried() {
        if (arguments.length) {
            resArgs = [...resArgs, ...([].slice.call(arguments))];
            return curried;
        } else {
            let allArgs = [...preArgs, ...resArgs];
            resArgs = [];
            return fn.apply(this, allArgs);
        }
    }

    return curried;
}

function sum() {
    return [].slice.call(arguments).reduce((acc, i) => (acc += i, acc), 0);
}
let s = curry(sum, 1);
console.log(s(2, 3)(4)());
console.log(s(2, 3)(4)());
// 两次都是 10
```

## 题目

第一题

实现 add(1)(2)(3)(4) 的打印结果为 10，并且要求可以随意调用，不过每次只传一个参数，如 add(1)(2)(3)(4)(5) 的打印结果为 15

<details>
<summary>答案</summary>


```js
function add(x) {
    let sum = x;

    function curry(y) {
        if (arguments.length === 0) return sum;
        sum += y;
        return curry
    }

    return curry;
}
```
</details>
<br><br>


第二题

实现 add(1, 2)(3) 的打印结果为 6，add(1)(2, 3, 4)(5) 结果为 15， 意思就是传递的参数个数不固定

<details>
<summary>答案</summary>


```js
function add(x) {
    let args = [].slice.call(arguments);

    function curry() {
        args = [...args, ...[].slice.call(arguments)];
        return curry
    }

    curry.toString = function () {
        return args.reduce((acc, i) => (acc += i, acc), 0);
    }

    return curry;
}
```
</details>
<br><br>

第三题

实现一个 sum 函数

```js
sum(1, 2, 3).valueOf(); // 6
sum(2, 3)(2).valueOf(); // 7
sum(1)(2)(3)(4).valueOf(); // 10
sum(2)(4, 1)(2).valueOf(); // 9
```

<details>
<summary>答案</summary>

```js
function curry(fn) {
  let preArgs = [].slice.call(arguments, 1);
  let allArgs = [...preArgs];

  function curried() {
    if (arguments.length > 0) {
      allArgs = [...allArgs, ...([].slice.call(arguments))];
      return curried;
    }
  }

  curried.valueOf = function () {
    let res = fn.apply(this, allArgs);
    allArgs = [...preArgs];
    return res;
  }

  return curried;
}

function s() {
  return [].slice.call(arguments).reduce((acc, item) => (acc += item, acc), 0)
}

let sum = curry(s);

console.log(sum(1, 2, 3).valueOf())
console.log(sum(2, 3)(2).valueOf())
console.log(sum(1)(2)(3)(4).valueOf())
console.log(sum(2)(4, 1)(2).valueOf())
```
</details>
<br><br>