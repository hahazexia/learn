# 手写题

实现基础操作

* 实现 new
* 实现 instanceof
* 实现 call apply bind
* 实现 Object.create
* 实现 Object.assign
* 实现 Array.prototype.flat
* 实现 String.prototype.trim
* 实现 forEach map filter find reduce some every
* 定时器
* 实现数组去重
* 解析 url params 为对象

其他 js 题

* 实现 a == 1 && a == 2 && a == 3 的结果为 true
* 洗牌算法
* 判断字符串中的括号是否是合法闭合的括号
* 实现判断版本号的方法
* 实现 promisify

## 题目

#### new

<details>
<summary>答案</summary>

```js
function _new(constructor) {
    const args = [].slice.call(arguments, 1);
    const context = Object.create(constructor.prototype);
    const res = constructor.apply(context, args);
    return (typeof res === 'object' && res !== null) ? res : context;
}
```
</details>
<br><br>

#### instanceof

<details>
<summary>答案</summary>

```js
function _instanceof(obj, constructor) {
    if ((typeof obj !== 'object' && typeof obj !== 'function') || obj === null) return false;
    let objProto = obj.__proto__;
    while(true) {
        if (objProto === null) return false;
        if (objProto === constructor.prototype) return true;
        objProto = objProto.__proto__;
    }
}
```
</details>
<br><br>

#### call apply bind

<details>
<summary>答案</summary>

```js
Function.prototype._call = function (context, ...args) {
    context = context ? Object(context) : window;
    const key = Symbol();
    context[key] = this;
    const result = context[key](...args);
    Reflect.deleteProperty(context, key);
    return result;
}

Function.prototype._apply = function (context, args) {
    context = context ? Object(context) : window;
    const key = Symbol();
    context[key] = this;
    const result = context[key](...args);
    Reflect.deleteProperty(context, key);
    return result;
}

Function.prototype._bind = function (context) {
    let preArgs = [].slice.call(arguments, 1);
    let fToBind = this;
    function fNoP () {};
    function fBound () {
        let allArgs = [...preArgs, ...([].slice.call(arguments))];
        return fToBind.apply(fNoP.prototype.isPrototypeOf(this) ? this : context, allArgs);
    }

    if (fToBind.prototype) {
      fNoP.prototype = fToBind.prototype;
    }
    fBound.prototype = new fNoP();

    return fBound;
}

// 新建一个空函数 fNoP 作为中间者维护原型关系，不让 fBound 指向 fToBind 的原型，以防 fToBind 的原型被修改
```
</details>
<br><br>

#### Object.create

<details>
<summary>答案</summary>

```js
Object._create = function (proto) {
    const F = function () {};
    F.prototype = proto;
    return new F();
}

Object._create = function(proto, propertyObject = undefined) {
    if (typeof proto !== 'object' && typeof proto !== 'function') {
        throw new TypeError('Object prototype may only be an Object or null.')
    }
    if (propertyObject === null) {
        new TypeError('Cannot convert undefined or null to object')
    }

    function F() {};
    F.prototype = proto;
    const obj = new F();
    
    if (propertyObject != undefined) {
        Object.defineProperties(obj, propertyObject)
    }
    if (proto === null) {
        // 创建一个没有原型对象的对象，Object.create(null)
        obj.__proto__ = null
    }
    return obj
}
```
</details>
<br><br>

#### Object.assign

<details>
<summary>答案</summary>

```js
Object._assign = function assign(target) {
    'use strict';
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    let to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
            for (let nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}
```
</details>
<br><br>

#### Array.prototype.flat

<details>
<summary>答案</summary>

```js
// 循环 + 递归
Array.prototype._flat = function (d = 1) {
    return d > 0 ?
    this.reduce((acc, item) => acc.concat(Array.isArray(item) ? item._flat(d - 1) : item), []) 
    : this.slice();
}

Array.prototype._flat = function (d = 1) {
    const result = [];

    (function flat (arr, depth) {
        for (let item of arr) {
            if (Array.isArray(item) && depth > 0) {
                flat(item, depth - 1);
            } else {
                result.push(item);
            }
        }
    })(this, d);
    
    return result;
}

// generator

function* flatten(array) {
    for (const item of array) {
        if (Array.isArray(item)) {
            yield* flatten(item);
        } else {
            yield item;
        }
    }
}

```
</details>
<br><br>

#### String.prototype.trim

<details>
<summary>答案</summary>

```js
// \xA0 是不间断空白符
// \uFEFF 是文件包含字节顺序标记时开头会出现的空白字符
String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};
```
</details>
<br><br>

#### forEach map filter find reduce some every

<details>
<summary>答案</summary>

```js
Array.prototype.forEach = function(callback, thisArg) {
    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    var _this, index = 0;
    var arr = Object(this);
    var len = arr.length >>> 0;

    if (arguments.length > 1) {
      _this = thisArg;
    }

    while (index < len) {
      var value;

      if (index in arr) {
        value = arr[index];
        callback.call(_this, value, index, arr);
      }
      index++;
    }
};


Array.prototype.map = function(callback, thisArg) {
    if (this == null) {
        throw new TypeError(' this is null or not defined');
    }
    if (typeof callback !== "function") {
        throw new TypeError(callback + ' is not a function');
    }

    var _this, index = 0;
    var arr = Object(this);
    var len = arr.length >>> 0;
    var result = new Array(len);

    if (arguments.length > 1) {
        _this = thisArg;
    }

    while (index < len) {
        var value, res;

        if (index in arr) {
            value = arr[index];
            res = callback.call(_this, value, index, arr);
            result[index] = res;
        }
        index++;
    }

    return result;
};

Array.prototype.filter = function(callback, thisArg) {
    if (!((typeof callback === 'Function' || typeof callback === 'function') && this)) {
        throw new TypeError();
    }

    var arr = this;
    var len = this.length >>> 0;
    var res = new Array(len);
    var i = 0, index = 0;
    var _this = thisArg || null;

    while (index < len) {
        if (index in arr) {
            if (callback.call(thisArg, arr[index], index, arr)) {
                res[i++] = arr[index];
            }
        }
        index++;
    }

    res.length = i;
    return res;
};

Array.prototype.find = function(callback, thisArg) {
    if (this == null) {
        throw new TypeError('"this" is null or not defined');
    }
    if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
    }

    var arr = Object(this);
    var len = o.length >>> 0;
    var thisArg = arguments[1];
    var index = 0;

    while (index < len) {
        var value = arr[index];
        if (callback.call(thisArg, value, index, arr)) {
            return value;
        }
        index++;
    }

    return undefined;
}

Array.prototype.reduce = function(callback) {
    if (this === null) {
        throw new TypeError( 'Array.prototype.reduce ' +
        'called on null or undefined' );
    }
    if (typeof callback !== 'function') {
        throw new TypeError( callback +
        ' is not a function');
    }

    var arr = Object(this);
    var len = arr.length >>> 0;
    var index = 0;
    var acc;

    if (arguments.length >= 2) {
        acc = arguments[1];
    } else {
        while (index < len && !(index in arr)) {
            index++;
        }

        if (index >= len) {
            throw new TypeError( 'Reduce of empty array ' +
            'with no initial value' );
        }
        acc = arr[index++];
    }

    while (index < len) {
        if (index in arr) {
            acc = callback(acc, arr[k], index, arr);
        }
        index++;
    }

    return acc;
}


Array.prototype.some = function(callback) {
    if (this == null) {
      throw new TypeError('Array.prototype.some called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError();
    }

    var arr = Object(this);
    var len = arr.length >>> 0;

    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
        if (i in arr && callback.call(thisArg, arr[i], i, arr)) {
            return true;
        }
    }

    return false;
};

Array.prototype.every = function(callbackfn, thisArg) {
    if (this == null) {
        throw new TypeError('this is null or not defined');
    }
    if (typeof callbackfn !== 'function') {
        throw new TypeError();
    }

    var _this, index = 0;
    var arr = Object(this);
    var len = arr.length >>> 0;

    if (arguments.length > 1) {
        _this = thisArg;
    }

    while (index < len) {
        var value;
        if (index in arr) {
            value = arr[index];
            var testResult = callbackfn.call(_this, value, index, arr);
            if (!testResult) {
                return false;
            }
        }
        k++;
    }
    return true;
};
```
</details>
<br><br>


#### 定时器

<details>
<summary>答案</summary>

```js
function _setTimeout (callback, wait) {
    const timer = setInterval(() => {
        clearInterval(timer);
        callback();
    }, wait);
}

function _setInterval (callback, wait) {
    (function t() {
        setTimeout(() => {
            callback();
            t();
        }, wait);
    })();
}
```
</details>
<br><br>

#### 数组去重


<details>
<summary>答案</summary>

```js
function duplicateRemoval (arr) {
    return [...new Set(arr)];
}

function duplicateRemoval (arr) {
    return Object.keys(arr.reduce((acc, i) => (acc[i] = i, acc), {}))
}

function duplicateRemoval (arr) {
    return arr.reduce((acc, i) => (acc.includes(i) ? acc : [...acc, i]) , [])
}

```
</details>
<br><br>


#### 解析 url params


<details>
<summary>答案</summary>

```js
function urlSearch(href) {
    let name, value;
    let str = href;
    let num = str.indexOf("?");
    str = str.substr(num + 1);
    let arr = str.split("&");
    let json = {};
    for (let i = 0; i < arr.length; i++) {
        num = arr[i].indexOf("=");
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            json[name] = value;
        }
    }
    return json;
}


function parseParam(url) {
    const paramsStr = /.+\?(.+)$/.exec(url)[1];
    const paramsArr = paramsStr.split('&');
    let paramsObj = {};

    paramsArr.forEach(param => {
        if (/=/.test(param)) {
            let [key, val] = param.split('=');
            val = decodeURIComponent(val);
            val = /^\d+$/.test(val) ? parseFloat(val) : val;
            if (paramsObj.hasOwnProperty(key)) {
                paramsObj[key] = [].concat(paramsObj[key], val);
            } else {
                paramsObj[key] = val;
            }
        } else {
            paramsObj[param] = true;
        }
    })
    
    return paramsObj;
}


function parseParam(url) {
    const paramsStr = /.+\?(.+)$/.exec(url)[1]; // 将 ? 后面的字符串取出来
    //exec() 方法用于检索字符串中的正则表达式的匹配。
    const paramsArr = paramsStr.split('&'); // 将字符串以 & 分割后存到数组中
    let paramsObj = {};
    // 将 params 存到对象中
    paramsArr.forEach(param => {
        if (/=/.test(param)) { // 处理有 value 的参数
            let [key, val] = param.split('='); // 分割 key 和 value
            val = decodeURIComponent(val); // 解码
            val = /^\d+$/.test(val) ? parseFloat(val) : val; // 判断是否转为数字
               //test() 方法用于检测一个字符串是否匹配某个模式.
            if (paramsObj.hasOwnProperty(key)) { // 如果对象有 key，则添加一个值
                paramsObj[key] = [].concat(paramsObj[key], val);
                //concat() 方法用于连接两个或多个数组。
                //该方法不会改变现有的数组，而仅仅会返回被连接数组的一个副本。
            } else { // 如果对象没有这个 key，创建 key 并设置值
                paramsObj[key] = val;
            }
        } else { // 处理没有 value 的参数
            paramsObj[param] = true;
        }
    })
    
    return paramsObj;
}

function parseSearch(search) {
    let data = new URLSearchParams(search);
    let res = {};
    for (let i of data) {
        res[i[0]] = i[1];
    }
    return res
}

```
</details>
<br><br>

#### 实现 a == 1 && a == 2 && a == 3 的结果为 true


<details>
<summary>答案</summary>

```js
// 对象定义自定义 toString 或者 valueOf
 const a = {
   i: 0,
   toString: function() {
     this.i++
     return this.i
   }
 }

 const a = {
   i: 0,
   valueOf: function() {
     this.i++
     return this.i
   }
 };
 console.log(a == 1 && a == 2 && a == 3);

// 定义对象 getter
 let a = {};

 let temp = 0
 Object.defineProperty(a, 'i', {
   get(val) {
     return ++temp
   },
   set() {
     return temp
   }
 });
a.i == 1 && a.i == 2 && a.i == 3

// Proxy 代理
let a = {
  i: 0
};
const currentA = new Proxy(a, {
  get: function(obj) {
    return ++obj.i
  }
});
console.log(currentA.i == 1 && currentA.i == 2 && currentA.i == 3);
```
</details>
<br><br>

#### 洗牌算法


<details>
<summary>答案</summary>

```js
function shuffle(arr) {
  const array = arr.slice();

  for (let i = (array.length - 1); i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }

  return array;
}
```
</details>
<br><br>

#### 判断字符串中的括号是否是合法闭合的括号


<details>
<summary>答案</summary>


```js
function isClosed(str) {
  if (!str) return true;
  const array = str.split('');

  const stack = [];

  const targetsMap = {
    '[': 1,
    ']': -1,
    '(': 2,
    ')': -2,
    '{': 3,
    '}': -3
  }

  for (let i = 0; i < array.length; i++) {
    if (array[i] === '(' || array[i] === '[' || array[i] === '{') {
      stack.push(targetsMap[array[i]]);
    } else {
      const l = stack.length;
      if (targetsMap[array[i]]) {
        if (l > 0 && ((stack[l - 1] + targetsMap[array[i]]) === 0)) {
          stack.pop();
        } else {
          stack.push(targetsMap[array[i]]);
        }
      }
    }
  }

  return stack.length ? false : true;
}

// 简化一下

function isClosed(str) {
    if (!str) return true;
    const arr = str.split('');
    const stack = [];

    const map = {
        '[': 1,
        ']': -1,
        '(': 2,
        ')': -2,
        '{': 3,
        '}': -3,
    };

    for (let i = 0; i < arr.length; i++) {
        let temp = arr[i];
        if (map[temp]) {
            if ((map[temp] + stack[stack.length - 1]) === 0) {
                stack.pop();
            } else {
                stack.push(map[temp]);
            }
        }
    }

    return stack.length ? false : true;
}

isClosed('{}'); // true
isClosed('()[]{}'); // true
isClosed('{()[][{()}][]}'); // true
isClosed('{)'); // false
isClosed('{(])}'); // false
isClosed('{(}[)]'); // false
isClosed('('); // false
```
</details>
<br><br>

#### 实现判断版本号的方法

<details>
<summary>答案</summary>

```js
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

compareVersion('1.11.0', '1.9.9') // 1
```

</details>
<br><br>

#### 实现 promisify

<details>
<summary>答案</summary>

```js
function promisify(fn) {
    return function(...arg) {
        return new Promise((resolve, reject) => {
            fn.apply(null, [...arg, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            }]);
        });
    }
}
```
</details>
<br><br>