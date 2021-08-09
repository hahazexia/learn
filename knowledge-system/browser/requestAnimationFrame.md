# requestAnimationFrame

## 基础概念

window.requestAnimationFrame 要求浏览器在下次重绘之前调用指定的回调函数更新动画。为什么需要 window.requestAnimationFrame ？做动画不可避免的会去更改 DOM，而如果在渲染之后再去更改 DOM，那就只能等到下一轮渲染机会的时候才能去绘制出来了，这显然是不合理的。它有以下特点：

* 在下次页面渲染之前调用指定回调；
* 若想在浏览器下次渲染之前继续更新下一帧动画，回调函数内必须再次调用 window.requestAnimationFrame；
* task 执行后可能不会调用 window.requestAnimationFrame。因为 requestAnimationFrame 即不是宏任务，也不是微任务，而是跟随渲染过程的，在事件循环过程中是包含渲染过程的，而 requestAnimationFrame 的触发是在浏览器重新渲染之前；

## 60fps 与设备刷新率

大多数设备的屏幕刷新率为 60 次/秒。因此，如果在页面中有一个动画或渐变效果，或者用户正在滚动页面，那么浏览器渲染动画或页面的每一帧的速率也需要跟设备屏幕的刷新率保持一致。

因为浏览器渲染每一帧页面速率要和设备屏幕刷新率保持一致，所以每一帧画面渲染的预算时间为 1000 / 60 = 16.66 毫秒。但实际上，浏览器有整理工作要做，因此您的所有工作需要在 10 毫秒内完成。如果无法符合此预算，帧率将下降，并且内容会在屏幕上抖动。 此现象通常称为卡顿，会对用户体验产生负面影响。

## 闪烁动画

假设我们现在想要快速的让屏幕上闪烁 红、蓝两种颜色，保证用户可以观察到，如果我们用 setTimeout 来写。

```js
setTimeout(() => {
  document.body.style.background = "red"
  setTimeout(() => {
    document.body.style.background = "blue"
  })
})
```

但是你会发现无法看到红色的背景，一直都会是蓝色的。因为这两个宏任务直接相隔时间太短了，于是浏览器将两次定时器任务合并，之间只会穿插着微任务的执行，而不会穿插页面的渲染。

如果将内层的定时器的时间改为 17ms，则偶尔可以看到红色闪一下然后变成蓝色。

```js
setTimeout(() => {
  document.body.style.background = "red"
  setTimeout(() => {
    document.body.style.background = "blue"
  }, 17)
})
```

这是因为 16 ms 的时间到了，浏览器必须和屏幕刷新率保持一致渲染下一帧画面，所以产生了这样的现象。但是也不是必现的，所以依赖 setTimeout 去做动画渲染是不可靠的。

```js

let i = 10
let req = () => {
  i--
  requestAnimationFrame(() => {
    document.body.style.background = "red"
    requestAnimationFrame(() => {
      document.body.style.background = "blue"
      if (i > 0) {
        req()
      }
    })
  })
}
 
req()
```
使用 requestAnimationFrame 切换 10 次颜色，可以看到红色和蓝色的切换一共 10 次。

再看一个例子

```js
setTimeout(() => {
  console.log("sto")
  requestAnimationFrame(() => console.log("rAF"))
})
setTimeout(() => {
  console.log("sto")
  requestAnimationFrame(() => console.log("rAF"))
})
 
queueMicrotask(() => console.log("mic"))
queueMicrotask(() => console.log("mic"))
```

看起来感觉应该打印如下，因为两次宏任务之间穿插一次渲染：

```js
mic
mic
sto
rAF
sto
rAF
```

但是实际上打印如下：

```js
mic
mic
sto
sto
rAF
rAF
```

这个例子更加说明了虽然定时器是宏任务，但是两个执行时机接近的定时器任务会被浏览器合并在一次任务执行，中间不会穿插渲染。