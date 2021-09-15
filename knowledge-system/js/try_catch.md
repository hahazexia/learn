# 错误捕获

## setTimeout

```js
    try {
        setTimeout(() => {
            let a = c;
        }, 100)
    } catch(e) {
        console.log('能获取到错误么？？', e);
    }
```

使用 try catch 无法捕获到 setTimeout 的回调里的错误，错误会被抛出，js 会停止执行。

思考：能不能在 setTimeout 里面先用 try catch 获取一下，然后捕获到错误后再传出去？

```js
    try {
        setTimeout(() => {
            try {
                let a = c;
            } catch(e) {
                throw new Error('some variable is not defined');
            }
        }, 100)
    } catch(e) {
        console.log('能获取到错误么？？', e);
    }
```

里面的 try catch 可以捕获到了，但是还是无法传递到外层。

原因：内存的错误跟最外层的 try catch 并不在一个执行栈中，当内存的回调函数执行的时候，外边的这个宏任务早已执行完， 他们的上下文已经完全不同了。

## promise

```js
    try {
        new Promise((resolve, reject) => {
            reject('promise error');
        })
    } catch(e) {
        console.log('异步错误，能catch到么？？', e);
    }
```

也 catch 不到错误，和 setTimeout 的原因一样，执行上下文不同了。

思考：那么使用 promise 对象自己的 catch 捕获到错误然后传递到外层 try catch 能不能捕获到呢？

```js
    try {
        new Promise((resolve, reject) => {
            reject('promise error');
        }).catch(e => {
            throw new Error(e);
        })
    } catch(e) {
        console.log('异步错误，能catch到么？？', e);
    }
```

答案是也不行，捕获不到。因为 promise 的 catch 的回调执行的之后，外层的 try catch 的执行上下文早已销毁了。

## callback

思考：是不是所有 callback 都无法从外部捕获错误？

```js
    function Fn(cb) {
        console.log('callback执行了');
        cb();
    }

    try {
        const cb = () => {
            throw new Error('callback执行错误');
        }
        Fn(cb);
    } catch(e) {
        console.log('能够catch住么???')
    }
```

这里可以 catch 到错误。

## async await

```js
const asyncFn = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('asyncFn执行时出现错误了')
        }, 100);
    })
}

const executedFn = async () => {
    try{
        await asyncFn();
    }catch(e) {
        console.log('拦截到错误..', e);
    }
}
```

async-await 是使用生成器、promise 和协程实现的，await 操作符还存储返回事件循环之前的执行上下文，以便允许 promise 操作继续进行。当内部通知解决等待的 promise 时，它会在继续之前恢复执行上下文。 所以说，能够回到最外层的上下文， 那就可以用 try catch。