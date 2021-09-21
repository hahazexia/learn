# promise

Promise对象有以下两个特点。

1. 对象的状态不受外界影响。Promise 对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）和 rejected（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是 Promise 这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

2. 一旦状态改变，就不会再变，任何时候都可以得到这个结果。Promise 对象的状态改变，只有两种可能：从 pending 变为 fulfilled 和从 pending 变为 rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。如果改变已经发生了，你再对 Promise 对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

```js
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});

promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```

resolve 或 reject 之后的的代码会继续执行。

```js
new Promise((resolve, reject) => {
  console.log(1)
  resolve(2);
  console.log(3);
}).then(r => {
  console.log(r);
});

console.log(4)

// 1 3 4 2
```

加上 return 后面的代码就不会执行了

```js
new Promise((resolve, reject) => {
  console.log(1)
  return resolve(2);
  console.log(3);
}).then(r => {
  console.log(r);
});

console.log(4)

// 1 4 2
```

* Promise.prototype.then() 第一个参数是 resolved 状态的回调函数，第二个参数是 rejected 状态的回调函数，它们都是可选的。
* Promise.prototype.catch() 是 .then(null, rejection) 或 .then(undefined, rejection) 的别名，用于指定发生错误时的回调函数。
* 一般来说，不要在 then() 方法里面定义 Reject 状态的回调函数（即 then 的第二个参数），总是使用 catch 方法。
* Promise.prototype.finally() finally() 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。finally 方法的回调函数不接受任何参数，这表明，finally方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。

```js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

## Promise.all() Promise.race() Promise.allSettled() Promise.any()

```js
const p = Promise.all([p1, p2, p3]);
const p = Promise.race([p1, p2, p3]);
const p = Promise.allSettled([p1, p2, p3]);
const p = Promise.any([p1, p2, p3]);

// 下面是 allSettled 返回的结果数组的元素
// 异步操作成功时
// {status: 'fulfilled', value: value}
// 异步操作失败时
// {status: 'rejected', reason: reason}
```

* 它们四个都是将多个 promise 包装成一个
    + Promise.all 当所有都 resolve 才会返回 resolve，否则返回第一个 reject
    + Promise.race 哪一个先变，就返回哪一个的状态
    + Promise.allSettled 所有异步都结束了，无论成功或者失败，返回结果对象组成的数组
    + Promise.any 有一个 resolve 了就返回 resolve，所有 reject 了才返回 reject


下面是 Promise.any 例子

```js
var resolved = Promise.resolve(42);
var rejected = Promise.reject(-1);
var alsoRejected = Promise.reject(Infinity);

Promise.any([resolved, rejected, alsoRejected]).then(function (result) {
  console.log(result); // 42
});

Promise.any([rejected, alsoRejected]).catch(function (results) {
  console.log(results); // [-1, Infinity]
});
```

## 题目

第一题

```js
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)
```

<details>
<summary>答案</summary>

如果 Promise.prototype.then 的第一个参数不是函数，则会在内部被替换为 (x) => x，即原样返回 promise 最终结果的函数。因此第一个 then 和 第二个 then 都变成了 (x) => x，x 是 一开始的 1 被传递下去。最后被 console.log 函数接收打印出来。
</details>
<br><br>