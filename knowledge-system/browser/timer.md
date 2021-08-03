# 定时器

## 定时器的原理

* 当通过 JavaScript 调用 setTimeout 设置回调函数的时候，渲染进程将会创建一个回调任务，包含了回调函数、当前发起时间、延迟执行时间
* 创建好回调任务之后，再将该任务添加到延迟执行队列中
* 消息队列中上一个任务完成之后，就开始处理延迟队列中的任务，根据发起时间和延迟时间计算出到期的任务，然后依次执行这些到期的任务。等到期的任务执行完成之后，再继续下一个循环过程。
* 取消定时器其实就是根据 id 将延迟队列中的定时器回调任务删除掉

## 定时器注意事项

1. 如果当前任务执行时间过久，会影响定时器任务的执行。所以定时器延迟的时间不是精确的。
2. 如果 setTimeout 存在嵌套递归调用，那么系统会设置最短时间间隔为 4 毫秒。在 Chrome 中，定时器被嵌套调用 5 次以上，系统会判断该函数方法被阻塞了，如果定时器的调用时间间隔小于 4 毫秒，那么浏览器会将每次调用的时间间隔设置为 4 毫秒。
3. 未激活的页面，setTimeout 执行最小间隔是 1000 毫秒。如果标签不是当前的激活标签，那么定时器最小的时间间隔是 1000 毫秒，目的是为了优化后台页面的加载损耗以及降低耗电量。
4. 延时执行时间有最大值。Chrome、Safari、Firefox 都是以 32 个 bit 来存储延时值的，32bit 最大只能存放的数字是 2147483647 毫秒，这就意味着，如果 setTimeout 设置的延迟值大于 2147483647 毫秒（大约 24.8 天）时就会溢出，那么相当于延时值被设置为 0 了，这导致定时器会被立即执行。
5. 使用 setTimeout 设置的回调函数中的 this 使用默认绑定，指向 window，如果是严格模式，会被设置为 undefined。this 绑定问题的解决办法：

```js
var name= 1;
var MyObj = {
  name: 2,
  showName: function(){
    console.log(this.name);
  }
}
setTimeout(MyObj.showName,1000)

// 第一种办法，用匿名函数

//箭头函数
setTimeout(() => {
    MyObj.showName()
}, 1000);
//或者function函数
setTimeout(function() {
  MyObj.showName();
}, 1000)

// 第二种办法，bind 绑定
setTimeout(MyObj.showName.bind(MyObj), 1000)
```

## 题目

第一题

使用 setTimeout 延迟打印：

* 4 秒后打印消息 'Hello after 4 seconds'
* 8 秒后打印 'Hello after 8 seconds'
* 限制条件：只能定义一个函数，其中包括内联函数。 这意味着多个 setTimeout 调用必须使用完全相同的函数。


<details>
<summary>答案</summary>

```js

const delay = function (t) {
    if (t === 4) {
        console.log('Hello after 4 seconds')
    }
    if (t === 8) {
        console.log('Hello after 8 seconds')
    }
}

setTimeout(delay, 4000, 4);
setTimeout(delay, 8000, 8);
```
</details>
<br><br>

第二题

编写脚本每秒打印消息 'Hello World'，但只打印 5 次。 5次之后，脚本应该打印消息 'Done' 并让节点进程退出。

限制条件：不能使用 setTimeout。

<details>
<summary>答案</summary>

```js

let count = 0;
let t = setInterval(() => {
    console.log('Hello World')
    count++;
    if (count === 5) {
        console.log('Done');
        clearInterval(t);
    }
}, 1000)

```
</details>
<br><br>

第三题

编写脚本以连续打印具有不同延迟的消息 'Hello World'。 以 1 秒的延迟开始，然后每次将延迟增加 1 秒。 第二次将延迟 2 秒。 第三次将延迟 3 秒，依此类推。

在打印的消息中包含延迟时间。 预期输出看起来像：

```js
Hello World. 1
Hello World. 2
Hello World. 3
```
限制条件：只能使用 const 来定义变量，不能使用 let 或 var。

<details>
<summary>答案</summary>

```js

const delay = function (t = 1) {
    setTimeout(() => {
        console.log(`Hello World ${t}`);
        delay(t + 1);
    }, t * 1000)
}

delay();
```
</details>
<br><br>

第四题

编写一个脚本以连续打印消息 'Hello World'，每个主延迟间隔的 5 个消息组。 从前 5 个消息的延迟 100ms 开始，接下来的 5 个消息延迟 200ms，然后是 300ms，依此类推。

以下是代码的要求：

* 在 100ms，脚本将开始打印 'Hello World'，并以 100ms 的间隔进行 5 次。 第一条消息将出现在 100 毫秒，第二条消息将出现在 200 毫秒，依此类推。
* 在前 5 条消息之后，脚本应将主延迟增加到 200ms。 因此，第 6 条消息将在 500毫秒 + 200毫秒（700毫秒）打印，第 7 条消息将在 900 毫秒打印，第 8 条消息将在 1100 毫秒打印，依此类推。
* 在 10 条消息之后，脚本应将主延迟增加到 300 毫秒。 所以第 11 条消息应该在 500ms + 1000ms + 300ms（18000ms）打印。 第 12 条消息应打印在21000ms，依此类推。
* 一直重复上面的模式。

预期的输出看起来像这样：

```js
Hello World. 100  // At 100ms
Hello World. 100  // At 200ms
Hello World. 100  // At 300ms
Hello World. 100  // At 400ms
Hello World. 100  // At 500ms
Hello World. 200  // At 700ms
Hello World. 200  // At 900ms
Hello World. 200  // At 1100ms...
```

限制条件：只能使用 setInterval ，并且只能使用一个 if 语句。

<details>
<summary>答案</summary>

```js
let lastIntervalId, counter = 5;

const greeting = delay => {
    if (counter === 5) {
        clearInterval(lastIntervalId);
        lastIntervalId = setInterval(() => {
            console.log('Hello World. ', delay);
            greeting(delay + 100);
        }, delay);
        counter = 0;
    }
    counter += 1;
};

greeting(100);
```
</details>
<br><br>