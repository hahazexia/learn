# 去抖和节流

##  去抖 debounce

解释：去抖就是将单位时间内的多次函数调用合并成一次，推迟到单位时间之后触发，或者在等待单位时间之前就立即触发。

实现思路：用一个变量存下定时器，每次函数被触发的时候都会重置定时器重新计时，这样直到不再触发函数，定时器才能正常被执行然后调用目标函数。

使用场景：

* 输入框监听输入事件或者按键抬起事件，会被频繁触发，去抖后只在停止输入了才去触发函数做搜索或者其他操作
* 防止多次点击按钮提交请求

实现一：

```js
function debounce (fn, wait) {
    let timer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(context, args)
        }, wait);
    }
}
```

实现二：

```js
function debounce (func, wait, immediate) { // 有时希望立刻执行函数，然后等到停止触发 n 秒后，才可以重新触发执行。
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
      }, wait)
      if (callNow) func.apply(context, args)
    } else {
      timeout = setTimeout(function () {
        func.apply(context, args)
      }, wait);
    }
  }
}
```

实现三：

```js
// func函数可能会有返回值，所以需要返回函数结果，但是当 immediate 为 false 的时候，因为使用了 setTimeout ，我们将 func.apply(context, args) 的返回值赋给变量，最后再 return 的时候，值将会一直是 undefined，所以只在 immediate 为 true 的时候返回函数的执行结果。
function debounce (func, wait, immediate) {
  let timeout, result;
  return function () {
    const context = this;
    const args = arguments;
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
      }, wait)
      if (callNow) result = func.apply(context, args)
    }
    else {
      timeout = setTimeout(function () {
        func.apply(context, args)
      }, wait);
    }
    return result;
  }
}
```

## 节流 throttle

解释：规定在单位时间内只能触发有限次函数。

使用场景：

* 窗口改变大小，resize 事件
* 拖拽滚动条，scroll 事件
* 拖拽 html 元素

实现一：

```js
function throttle(fn, wait) {
    let timer;

    return function () {
        const context = this;
        const args = arguments;

        if (!timer) {
            fn.apply(context, args);
            timer = setTimerout(() => {
                timer = null
            }, wait);
        }
    }
}
```

实现二：

```js
function throttle(fn, wait) {
    let prev = 0;

    return function () {
        const context = this;
        const args = arguments;
        let now = Date.now();

        if (now - prev > wait) {
            fn.apply(context, args);
            prev = now;
        }
    }
}
```