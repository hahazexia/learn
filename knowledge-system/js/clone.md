# 深浅拷贝

## 浅拷贝

在堆中新建一块内存，拷贝和原对象一样的属性，如果属性的值是基础类型的数据，则复制值；如果属性的值是对象（引用类型），则复制的是这个对象在栈内存中的地址，相当于它们引用同一份堆内存。

```js
let a = [1, 2, 3, [1, 1, 1]];
let b = a.slice(); // 数组浅拷贝。slice 参数为 start 和 end，如果两个参数都省略，则直接返回当前数组的浅拷贝。
let c = a.concat(); // 数组浅拷贝。concat 参数为要和当前数组连接的多个其他数组，如果省略参数，则直接返回当前数组的浅拷贝。

let d = {t: 1};
let e = Object.assign({}, d); // 对象浅拷贝。Object.assign 第一个参数是目标对象，之后的参数是要合并入目标对象的源对象。后面的源对象会覆盖前面的对象的同名属性，都合并到目标对象后，返回被改变的目标对象。

// 展开运算符也是浅拷贝
let f = [1, 2, 3, [1, 1, 1]];
let g = {t: 1};
let h = [...f];
let i = {...g};
```

## 深拷贝

在堆中新建内存，拷贝原对象的属性，如果属性是对象（引用类型），就创建这个属性为新对象，递归地去拷贝此对象上的属性。

### JSON.parse(JSON.stringify())

缺点：只能处理函数和对象，正则对象和函数会失败，正则变成空对象，函数被去掉（最新的 chrome）。

### 手写深拷贝

深拷贝需要考虑的问题：

1. 拷贝不同类型的引用类型，例如正则和函数。
2. 循环引用会造成无限递归调用
3. 引用丢失问题。如果两个不同的属性指向同一个引用类型对象，如果不处理，拷贝结束后这两个属性会是两个不同的对象。
4. 对象层次太深，深拷贝递归调用会造成栈溢出。


第一种写法

```js
// 只考虑了所有属性都是对象的情况

function cloneLoop(x) {
    const root = {};

    const handledObj = [];

    const loopList = [
        {
            parent: root,
            key: undefined,
            data: x,
        }
    ];

    while(loopList.length) {
        const node = loopList.pop();
        const parent = node.parent;
        const key = node.key;
        const data = node.data;

        let res = parent;
        if (typeof key !== 'undefined') {
            res = parent[key] = {};
        }

        let alreadyHandled = handledObj.find(item => item.data === data);

        if (alreadyHandled) {
            parent[key] = alreadyHandled.copy;
            continue;
        }

        handledObj.push({
            data: data,
            copy: res
        });

        for(let k in data) {
            if (data.hasOwnProperty(k)) {
                if (typeof data[k] === 'object') {
                    loopList.push({
                        parent: res,
                        key: k,
                        data: data[k],
                    });
                } else {
                    res[k] = data[k];
                }
            }
        }
    }

    return root;
}
```

如果不考虑循环引用，如下：

```js
function cloneLoop(x) {
    const root = {};

    // const handledObj = [];

    const loopList = [
        {
            parent: root,
            key: undefined,
            data: x,
        }
    ];

    while(loopList.length) {
        const node = loopList.pop();
        const parent = node.parent;
        const key = node.key;
        const data = node.data;

        let res = parent;
        if (typeof key !== 'undefined') {
            res = parent[key] = {};
        }

        // let alreadyHandled = handledObj.find(item => item.data === data);

        // if (alreadyHandled) {
        //     parent[key] = alreadyHandled.copy;
        //     continue;
        // }

        // handledObj.push({
        //     data: data,
        //     copy: res
        // });

        for(let k in data) {
            if (data.hasOwnProperty(k)) {
                if (typeof data[k] === 'object') {
                    loopList.push({
                        parent: res,
                        key: k,
                        data: data[k],
                    });
                } else {
                    res[k] = data[k];
                }
            }
        }
    }

    return root;
}
```

关键实现是使用一个栈结构存储当前循环要处理的拷贝。栈中的对象有三个属性：1. parent 即将被拷贝的对象所要添加到的对象。2. key 即将被拷贝的对象对应的属性。3. data 即将被拷贝的对象。也就是说将要做的事就是使 parent.key = 拷贝的 data。

解决引用丢失和循环引用的办法就是再声明一个数组，每次往新拷贝结果对象上拷贝属性的时候，都将处理过的 key 对应的原始值的引用和拷贝后的新值的引用存入数组。然后每次循环都先遍历这个数组，如果当前属性值和之前某一次的是同一个引用类型对象，则直接赋值，然后跳出本次循环。


```js
// 引用丢失测试用例
var b = {};
var a = {a1: b, a2: b};
a.a1 === a.a2 // true

var c = cloneLoop(a);
c.a1 === c.a2 
```


第二种写法：

```js
const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';
const argsTag = '[object Arguments]';

const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';

const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag];


function forEach(array, iteratee) {
    let index = -1;
    const length = array.length;
    while (++index < length) {
        iteratee(array[index], index);
    }
    return array;
}

function isObject(target) {
    const type = typeof target;
    return target !== null && (type === 'object' || type === 'function');
}

function getType(target) {
    return Object.prototype.toString.call(target);
}

function getInit(target) {
    const Ctor = target.constructor;
    return new Ctor();
}

function cloneSymbol(targe) {
    return Object(Symbol.prototype.valueOf.call(targe));
}

function cloneReg(targe) {
    const reFlags = /\w*$/;
    const result = new targe.constructor(targe.source, reFlags.exec(targe));
    result.lastIndex = targe.lastIndex;
    return result;
}

function cloneFunction(func) {
    const bodyReg = /(?<={)(.|\n)+(?=})/m;
    const paramReg = /(?<=\().+(?=\)\s+{)/;
    const funcString = func.toString();
    if (func.prototype) {
        const param = paramReg.exec(funcString);
        const body = bodyReg.exec(funcString);
        if (body) {
            if (param) {
                const paramArr = param[0].split(',');
                return new Function(...paramArr, body[0]);
            } else {
                return new Function(body[0]);
            }
        } else {
            return null;
        }
    } else {
        return eval(funcString);
    }
}

function cloneOtherType(targe, type) {
    const Ctor = targe.constructor;
    switch (type) {
        case boolTag:
        case numberTag:
        case stringTag:
        case errorTag:
        case dateTag:
            return new Ctor(targe);
        case regexpTag:
            return cloneReg(targe);
        case symbolTag:
            return cloneSymbol(targe);
        case funcTag:
            return cloneFunction(targe);
        default:
            return null;
    }
}

function clone(target, map = new WeakMap()) {

    // 克隆原始类型
    if (!isObject(target)) {
        return target;
    }

    // 初始化
    const type = getType(target);
    let cloneTarget;
    if (deepTag.includes(type)) {
        cloneTarget = getInit(target, type);
    } else {
        return cloneOtherType(target, type);
    }

    // 防止循环引用
    if (map.get(target)) {
        return map.get(target);
    }
    map.set(target, cloneTarget);

    // 克隆set
    if (type === setTag) {
        target.forEach(value => {
            cloneTarget.add(clone(value, map));
        });
        return cloneTarget;
    }

    // 克隆map
    if (type === mapTag) {
        target.forEach((value, key) => {
            cloneTarget.set(key, clone(value, map));
        });
        return cloneTarget;
    }

    // 克隆对象和数组
    const keys = type === arrayTag ? undefined : Object.keys(target);
    forEach(keys || target, (value, key) => {
        if (keys) {
            key = value;
        }
        cloneTarget[key] = clone(target[key], map);
    });

    return cloneTarget;
}

module.exports = {
    clone
};
```