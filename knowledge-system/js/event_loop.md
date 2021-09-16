# 事件循环

## 进程和线程

* `一个进程就是一个程序的运行实例`。详细解释就是，启动一个程序的时候，操作系统会为该程序创建一块内存，用来存放代码、运行中的数据和一个执行任务的主线程，我们把这样的一个运行环境叫进程。

* `线程`是依附于进程的，而进程中使用多线程并行处理能提升运算效率。

* 进程和线程的关系
    * 进程中的任意一线程执行出错，都会导致整个进程的崩溃
    * 线程之间共享进程中的数据
    * 当一个进程关闭之后，操作系统会回收进程所占用的内存
    * 进程之间的内容相互隔离

* 而浏览器运行的时候是多进程的，包括：1 个浏览器（Browser）主进程、1 个 GPU 进程、1 个网络（NetWork）进程、多个渲染进程和多个插件进程。

## 渲染进程

渲染进程。核心任务是将 HTML、CSS 和 JavaScript 转换为用户可以与之交互的网页，排版引擎 Blink 和 JavaScript 引擎 V8 都是运行在该进程中，默认情况下，Chrome 会为每个 Tab 标签创建一个渲染进程。出于安全考虑，渲染进程都是运行在沙箱模式下

每个渲染进程都有一个主线程，并且主线程非常繁忙，既要处理 DOM，又要计算样式，还要处理布局，同时还需要处理 JavaScript 任务以及各种输入事件。要让这么多不同类型的任务在主线程中有条不紊地执行，这就需要一个系统来统筹调度这些任务，这个统筹调度系统就是我们今天要讲的消息队列和事件循环系统。

## 事件循环和消息队列

1. 所有任务都在主线程上执行。
2. 主线程之外，还存在一个消息队列。只要其他任务有了运行结果，就放在消息队列中排队等待执行。例如 输入事件（鼠标滚动、点击、移动）、文件读写、WebSocket、JavaScript 定时器等等。
3. 一旦主线程中的所有任务执行完毕，系统就会读取消息队列，看看里面有哪些在排队的任务。那些任务结束等待状态，进入主线程执行栈，开始执行。

主线程不断重复上面的第三步。这就是事件循环和消息队列。

## 任务和微任务

* 任务（Tasks）就是一段被执行的任意 JavaScript 代码。这些都在 任务队列（task queue）上被调度。例如，一段被直接执行的程序，事件出发后的回调函数，或 setInterval 和 setTimeout 设置的定时器回调。

* 每当一个任务存在，事件循环都会检查该任务是否正把控制权交给其他 JavaScript 代码。如果不需要，事件循环就会运行微任务队列中的所有微任务。如果一个微任务通过调用 queueMicrotask(), 向队列中加入了更多的微任务，则那些新加入的微任务 会早于下一个任务运行 。这是因为事件循环会持续调用微任务直至队列中没有留存的，即使是在有更多微任务持续被加入的情况下。

* 微任务（Microtasks）包括 queueMicrotask 添加的回调函数，promise，MutationObserver 等。

* 消息队列机制并不是太灵活，为了适应效率和实时性，才引入了微任务。

## nodejs 中的事件循环

事件循环是 Node.js 处理非阻塞 I/O 操作的机制——尽管 JavaScript 是单线程处理的——当有可能的时候，它们会把操作转移到系统内核中去。

既然目前大多数内核都是多线程的，它们可在后台处理多种操作。当其中的一个操作完成的时候，内核通知 Node.js 将适合的回调函数添加到 轮询 队列中等待时机执行。

下面的图表展示了事件循环操作顺序的简化概览。

```
// 每个框都是事件循环机制的一个阶段

   ┌───────────────────────────┐
┌─>│           timers          │ // 执行 setTimeout() 和 setInterval() 的回调函数
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ // 执行延迟到下一个循环迭代的 I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ // 系统内部使用
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │ // 轮询：检索新的 I/O 事件; 执行与 I/O 相关的回调
│  └─────────────┬─────────────┘      │   data, etc.  │ // （几乎所有情况下，除了关闭的回调函数，那些由计时器和 setImmediate() 调度的之外）
│  ┌─────────────┴─────────────┐      └───────────────┘ // 其余情况 node 将在适当的时候在此阻塞
│  │           check           │ // 执行 setImmediate() 回调函数
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ // 一些关闭的回调函数，如：socket.on('close', ...)
   └───────────────────────────┘
```

每个框都是事件循环机制的一个阶段。每个阶段都有一个 FIFO 队列来执行回调。虽然每个阶段都是特殊的，但通常情况下，当事件循环进入给定的阶段时，它将执行特定于该阶段的任何操作，然后执行该阶段队列中的回调，直到队列用尽或最大回调数已执行。当该队列已用尽或达到回调限制，事件循环将移动到下一阶段。

其中 process.nextTick() 和 promise.then() 将在每个阶段之后立即执行，它们类似浏览器中的微任务定义。

## html 规范中的事件循环流程

[html文档链接](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)

1. 执行宏任务（task）
    1. 选中一个任务队列为要执行的任务队列，从这个任务队列中取出最早入队的一个 Task，
        * 因为任务队列不止一个。以下是[规范原文](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)。For example, a user agent could have one task queue for mouse and key events (to which the user interaction task source is associated), and another to which all other task sources are associated. Then, using the freedom granted in the initial step of the event loop processing model, it could give keyboard and mouse events preference over other tasks three-quarters of the time, keeping the interface responsive but not starving other task queues. Note that in this setup, the processing model still enforces that the user agent would never process events from any one task source out of order. 大意：浏览器可以有一个任务队列存储鼠标和键盘事件，而剩余的其他任务则放在另外一个任务队列中。浏览器会在保持任务顺序的前提下，可能分配四分之三的优先权给鼠标和键盘事件，保证用户的输入得到最高优先级的响应，而剩下的优先级交给其他 Task，并且保证不会“饿死”它们。
    2. 让这个最早的 Task 执行
2. 执行微任务（Microtasks）
    1. 循环微任务队列，执行并清空微任务队列
3. 更新渲染
4. 判断是否启动空闲时间算法（window.requestIdleCallback()）
5. 不断重复以上过程

## 总结

1. 事件循环每轮的 task 执行完成后，不一定都会伴随页面的更新渲染；
    * Browsing context rendering opportunities are determined based on hardware constraints such as display refresh rates and other factors such as page performance or whether the page is in the background. Rendering opportunities typically occur at regular intervals. 会根据 Rendering opportunities 来判断每轮事件循环是否需要进行更新渲染，会根据浏览器刷新率以及页面性能或是否后台运行等因素判断的。如果 hasARenderingOpportunity 为 true，需要更新渲染。下面是更新渲染流程：
        1. 触发 resize、scroll事件，评估媒体查询并且提交变化
        2. 更新 css 动画 
        3. 执行动画回调（window.requestAnimationFrame 回调）；
        4. 执行 intersection observations 回调
        5. 更新渲染；
2. 事件循环中碰到以下情况会跳过渲染：
    1. 浏览器判断更新渲染不会带来视觉上的改变
    2. 有时候浏览器希望两次定时器任务是合并的，他们之间只会穿插着微任务的执行，而不会穿插页面渲染相关的流程。
    3. map of animation frame callbacks 为空，也就是帧动画回调为空。


## 题目

第一题

```js
setTimeout(() => {
    console.log(1)
}, 20)

setTimeout(() => {
    console.log(2)
}, 0)

setTimeout(() => {
    console.log(3)
}, 10)

setTimeout(() => {
    console.log(5)
}, 10)

console.log(4)
```

<details>
<summary>答案</summary>


```js
setTimeout(() => {
    console.log(1)
}, 20)

setTimeout(() => {
    console.log(2)
}, 0)

setTimeout(() => {
    console.log(3)
}, 10)

setTimeout(() => {
    console.log(5)
}, 10)

console.log(4)

// 4 2 3 5 1
```
</details>
<br><br>

第二题

```js
setTimeout(() => {
    console.log(1)
}, 20)

setTimeout(() => {
    console.log(2)
}, 0)

setTimeout(() => {
    console.log(3)
}, 30)

console.log(4)
```


<details>
<summary>答案</summary>

```js
setTimeout(() => {
    console.log(1)
}, 20)

setTimeout(() => {
    console.log(2)
}, 0)

setTimeout(() => {
    console.log(3)
}, 30)

console.log(4)

// 4 2 1 3 
```
</details>
<br><br>

第三题

```js
let xhr = new XMLHttpRequest()
xhr.open('post', 'api')
xhr.onreadystatechange = () => {
    if (xhr.readyState == 2) {
        console.log(2)
    }
    if (xhr.readyState == 4) {
        console.log(4)
    }
}
xhr.send()
console.log(3)

```


<details>
<summary>答案</summary>

```js
let xhr = new XMLHttpRequest()
xhr.open('post', 'api')
xhr.onreadystatechange = () => {
    if (xhr.readyState == 2) {
        console.log(2)
    }
    if (xhr.readyState == 4) {
        console.log(4)
    }
    /*
    0: 请求未初始化
    1: 服务器连接已建立
    2: 请求已接收
    3: 请求处理中
    4: 请求已完成，且响应已就绪
    */
}
xhr.send()
console.log(3)

// 3 2 4
```
</details>
<br><br>

第四题

```js
let xhr = new XMLHttpRequest()
xhr.open('get', 'xxx', false)
xhr.send()

xhr.onreadystatechange = () => {
    console.log(xhr.readyState)
}
```

<details>
<summary>答案</summary>

```js
let xhr = new XMLHttpRequest()
xhr.open('get', 'xxx', false)
xhr.send()

xhr.onreadystatechange = () => {
    console.log(xhr.readyState)
}
// 没有打印 readyState 因为 open 方法传递第三个参数 async 为 false，所以请求是同步执行的，send()方法直到收到答复前不会返回。
```
</details>
<br><br>

第五题

```js
let xhr = new XMLHttpRequest()
xhr.open('post', 'api')
xhr.onreadystatechange = () =>{
    console.log(xhr.readyState)
}
xhr.send()
```

<details>
<summary>答案</summary>

```js
let xhr = new XMLHttpRequest()
xhr.open('post', 'api')
xhr.onreadystatechange = () =>{
    console.log(xhr.readyState)
}
xhr.send()
// 2 3 4

/*
0: 请求未初始化
1: 服务器连接已建立
2: 请求已接收
3: 请求处理中
4: 请求已完成，且响应已就绪
*/
// onreadystatechange 的回调加入到任务队列中等待，xhr.send() 执行后 readyState 变成 1，这时候 onreadystatechange 回调才开始执行，然后打印 2 3 4
```
</details>
<br><br>

第六题

```js
console.log(1)
new Promise((resolve, reject) => {
    console.log(2)
    resolve()
}).then(res => {
    console.log(3)
})
console.log(4)
```

<details>
<summary>答案</summary>

```js
console.log(1)
new Promise((resolve, reject) => {
    console.log(2)
    resolve()
}).then(res => {
    console.log(3)
})
console.log(4)

// 1 2 4 3
```
</details>
<br><br>

第七题

```js
setTimeout(function () {
    console.log(1)
}, 0);

new Promise(function (resolve, reject) {
    console.log(2);
    resolve();
}).then(function () {
    console.log(3)
}).then(function () {
    console.log(4)
});

console.log(6);
```

<details>
<summary>答案</summary>

```js
setTimeout(function () {
    console.log(1)
}, 0);

new Promise(function (resolve, reject) {
    console.log(2);
    resolve();
}).then(function () {
    console.log(3)
}).then(function () {
    console.log(4)
});

console.log(6);

// 2 6 3 4 1
```
</details>
<br><br>

第八题

```js
setTimeout(function () {
    console.log(1)
}, 0);

new Promise(function (resolve, reject) {
    console.log(2)
    for (var i = 0; i < 10000; i++) {
        if (i === 10) {
            console.log(10)
        }
        i == 9999 && resolve();
    }
    console.log(3)
}).then(function () {
    console.log(4)
})
console.log(5);
```

<details>
<summary>答案</summary>

```js
setTimeout(function () {
    console.log(1)
}, 0);

new Promise(function (resolve, reject) {
    console.log(2)
    for (var i = 0; i < 10000; i++) {
        if (i === 10) {
            console.log(10)
        }
        i == 9999 && resolve();
    }
    console.log(3)
}).then(function () {
    console.log(4)
})
console.log(5);

// 2 10 3 5 4 1
```
</details>
<br><br>

第九题

```js
console.log("start");
setTimeout(() => {
    console.log("children2")
    Promise.resolve().then(() => {
        console.log("children3")
    })
}, 0)

new Promise(function(resolve, reject) {
    console.log("children4")
    setTimeout(function() {
        console.log("children5")
        resolve("children6")
    }, 0)
}).then(res =>{
    console.log("children7")
    setTimeout(() =>{
        console.log(res)
    }, 0)
})
```

<details>
<summary>答案</summary>


```js
console.log("start");
setTimeout(() => {
    console.log("children2")
    Promise.resolve().then(() => {
        console.log("children3")
    })
}, 0)

new Promise(function(resolve, reject) {
    console.log("children4")
    setTimeout(function() {
        console.log("children5")
        resolve("children6")
    }, 0)
}).then(res =>{
    console.log("children7")
    setTimeout(() =>{
        console.log(res)
    }, 0)
})

// start children4 children2 children3 children5 children7 children6
```
</details>
<br><br>

第十题

```js
async function async1() {
    console.log('async1 start')
    await async2()
    console.log('async1 end')
}
async function async2() {
    console.log('async2')
}
console.log('script start')
setTimeout(function () {
    console.log('setTimeout')
}, 0)
async1()
new Promise((resolve) => {
    console.log('promise1')
    resolve()
}).then(function () {
    console.log('promise2')
})
console.log('script end')

```

<details>
<summary>答案</summary>

```js
async function async1() {
    console.log('async1 start')
    await async2()
    console.log('async1 end')
}

async function async2() {
    console.log('async2')
}

console.log('script start')

setTimeout(function () {
    console.log('setTimeout')
}, 0)

async1()

new Promise((resolve) => {
    console.log('promise1')
    resolve()
}).then(function () {
    console.log('promise2')
})

console.log('script end')

// 'script start'
// 'async1 start'
// 'async2'
// 'promise1'
// 'script end'
// 'async1 end'
// 'promise2'
// 'setTimeout'
```
</details>
<br><br>

第十一题

```js
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    new Promise(function (resolve) {
        console.log('promise1');
        resolve();
    }).then(function () {
        console.log('promise2');
    });
}
console.log('script start');
setTimeout(function () {
    console.log('setTimeout');
}, 0)
async1();
new Promise(function (resolve) {
    console.log('promise3');
    resolve();
}).then(function () {
    console.log('promise4');
});
console.log('script end');

```

<details>
<summary>答案</summary>


```js
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    new Promise(function (resolve) {
        console.log('promise1');
        resolve();
    }).then(function () {
        console.log('promise2');
    });
}

console.log('script start');

setTimeout(function () {
    console.log('setTimeout');
}, 0)

async1();

new Promise(function (resolve) {
    console.log('promise3');
    resolve();
}).then(function () {
    console.log('promise4');
});

console.log('script end');

// 'script start'
// 'async1 start'
// 'promise1'
// 'promise3'
// 'script end'
// 'promise2'
// 'async1 end'
// 'promise4'
// 'setTimeout'
```
</details>
<br><br>

第十二题

```js
async function async1() {
    console.log('async1 start');
    await async2();
    setTimeout(function() {
        console.log('setTimeout1')
    },0)
}
async function async2() {
	setTimeout(function() {
		console.log('setTimeout2')
	},0)
}
console.log('script start');
setTimeout(function() {
    console.log('setTimeout3');
}, 0)
async1();
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```

<details>
<summary>答案</summary>

```js
async function async1() {
    console.log('async1 start');
    await async2();
    setTimeout(function() {
        console.log('setTimeout1')
    },0)
}

async function async2() {
    setTimeout(function() {
        console.log('setTimeout2')
    },0)
}

console.log('script start');

setTimeout(function() {
    console.log('setTimeout3');
}, 0)

async1();

new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});

console.log('script end');

// 'script start'
// 'async1 start'
// 'promise1'
// 'script end'
// 'promise2'
// 'setTimeout3'
// 'setTimeout2'
// 'setTimeout1'
```
</details>
<br><br>