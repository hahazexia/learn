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
    if (typeof obj !== 'object' || typeof obj !== 'function' || obj === null) return false;
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

    if (this.prototype) {
      fNoP.prototype = this.prototype;
    }
    fBound.prototype = new fNoP();

    return fBound;
}
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
    return d > 0 ? this.reduce((acc, item) => acc.concat(Array.isArray(item) ? item._flat(d - 1) : item), []) 
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
    return arr.reduce((acc, i) => (!acc.includes(i) ? acc.push(i) : '', acc) , [])
}

```
</details>
<br><br>


#### 解析 url params

