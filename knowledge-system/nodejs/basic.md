# nodejs 基础

## 异步非阻塞I/O

* I/O 主要指与系统磁盘和网络之间的交互。

* `阻塞`是指在 Node.js 程序中，其它 JavaScript 语句的执行，必须等待一个非 JavaScript 操作完成。这是因为当`阻塞`发生时，事件循环无法继续运行 JavaScript。在 Node.js 中，JavaScript 由于执行 CPU 密集型操作，而不是等待一个非 JavaScript 操作（例如 I/O）而表现不佳，通常不被称为`阻塞`。在 Node.js 标准库中使用 libuv 的同步方法是最常用的`阻塞`操作。原生模块中也有`阻塞`方法。在 Node.js 标准库中的所有 I/O 方法都提供异步版本，`非阻塞`，并且接受回调函数。某些方法也有对应的`阻塞`版本，名字以 Sync 结尾。

* `阻塞`方法`同步`执行，`非阻塞`方法 `异步`执行。


通过读取文件的代码来比较，这是一个`同步`文件读取：

```js
const fs = require('fs');
const data = fs.readFileSync('/file.md'); // blocks here until file is read
```

这是一个等同的`异步`示例：

```js
const fs = require('fs');
fs.readFile('/file.md', (err, data) => {
  if (err) throw err;
});
```

第一个示例看上去比第二个简单些，但是有一个缺陷：第二行语句会`阻塞`其它 JavaScript 语句的执行直到整个文件全部读取完毕。注意在同步版本中，如果错误被抛出，它需要被捕获否则整个程序都会崩溃。在异步版本中，由作者来决定错误是否如上所示抛出。

让我们稍微扩展一下我们的例子：

```js
const fs = require('fs');
const data = fs.readFileSync('/file.md'); // blocks here until file is read
console.log(data);
moreWork(); // will run after console.log
```

这是一个类似但不等同的异步示例：

```js
const fs = require('fs');
fs.readFile('/file.md', (err, data) => {
  if (err) throw err;
  console.log(data);
});
moreWork(); // will run before console.log
```

在上述第一个例子中， console.log 将在 moreWork() 之前被调用。在第二个例子中， fs.readFile() 是`非阻塞`的，所以 JavaScript 执行可以继续， moreWork() 将被首先调用。在不等待文件读取完成的情况下运行 moreWork() 的能力是一个可以提高吞吐量的关键设计选择。

## 并发和吞吐量

在 Node.js 中 JavaScript 的执行是单线程的，因此并发性是指事件循环在完成其他工作后执行 JavaScript 回调函数的能力。任何预期以并行方式运行的代码必须让事件循环能够在非 JavaScript 操作（比如 I/O ）执行的同时继续运行。

例如，让我们思考这样一种情况：每个对 Web 服务器的请求需要 50 毫秒完成，而那 50 毫秒中的 45 毫秒是可以异步执行的数据库 I/O。选择 非阻塞 异步操作可以释放每个请求的 45 毫秒来处理其它请求。仅仅是选择使用`非阻塞`方法而不是`阻塞`方法，就能造成并发的显著差异。

**事件循环不同于许多其他语言的模型，其它语言创建额外线程来处理并发工作。**

## nodejs api 的阻塞版本和非阻塞版本

nodejs 中的 I/O 操作的 api 会提供阻塞版本和非阻塞版本。以 fs 模块举例。

```js
const fs = require('fs');

// 同步调用
const data = fs.readFileSync('./conf.js');

//代码会阻塞在这里
console.log(data);

// 异步调用
fs.readFile('./conf.js', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// nodejs v10 版本新增的 fs promise api
const fsp = require("fs").promises;

fsp.readFile("./confs.js")
  .then(data => console.log(data))
  .catch(err => console.log(err));
```

nodejs 中还有一个 promisify 方法，在版本 v8 中新增，用于将老式的 `error first callback` 写法（例如 fs.readFile 的异步回调写法）改造成返回 promise 形式的写法。

```js
// promisify
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

readFile('./conf.js')
  .then(data=>console.log(data))
```

下面是 promisify 的实现：

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

## Buffer 缓冲区

当使用 fs 模块读取一个文件的数据后，将这些数据打印出来长下面这样子：

```js
const fs = require('fs');
const data = fs.readFileSync('./aaa.txt');

console.log(data, 'data');
// <Buffer 31 2e 0d 0a e5 91 a8 e4 bd 9c e4 ba ba e6 95 a3 e6 96 87 0d 0a 0d 0a e5 87 ba e7 89 88 e7 a4 be 3a 20 e4 ba ba e6 b0 91 e6 96 87 e5 ad a6 e5 87 ba e7 ... 2753 more bytes>
```

这种类型被称为 Buffer，译为缓冲区，它用于表示固定长度的字节序列。也就是说它在 nodejs 中用于处理二进制数据。

下面是 Buffer 的一些常用方法。

```js
// Buffer.from 创建一个 buffer 对象。参数可以是多种类型。
const buf1 = Buffer.from('this is a tést');
console.log(buf1.toString());
// Prints: this is a tést

// Buffer.alloc 分配一段指定大小的内存空间用于存储 buffer 数据
const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

console.log(totalLength);
// Prints: 42

// Buffer.concat 合并 Buffer 对象
const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

console.log(bufA);
// Prints: <Buffer 00 00 00 00 ...>
console.log(bufA.length);
// Prints: 42

// buffer.write 写入 Buffer
const buffer = Buffer.alloc(10);
buffer.write('abcd');
console.log(buffer);
// <Buffer 61 62 63 64 00 00 00 00 00 00>
```

## http