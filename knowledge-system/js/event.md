# 事件

## 添加事件监听回调的方式

```js
// 设置元素的事件属性为一个函数
const btn = document.querySelector('button');
btn.onclick = function() {}

// 设置 html 标签的事件属性
<button onclick="bgChange()">Press me</button>

// addEventListener() 和 removeEventListener()
const btn = document.querySelector('button');
function bgChange() {}
btn.addEventListener('click', bgChange);
btn.removeEventListener('click', bgChange);

```

当给同一个元素设置多个事件监听回调

```js
// 设置元素的事件属性，后一个会覆盖掉前一个
myElement.onclick = functionA;
myElement.onclick = functionB;

// addEventListener 两个回调都会执行，按照代码中先后绑定的顺序依次执行
myElement.addEventListener('click', functionA);
myElement.addEventListener('click', functionB);
```

## 事件对象

addEventListener 添加的回调函数会收到一个参数，这个参数就是 Event 实例对象。

|  属性或方法   |  含义  |
|  ----  | ----  |
|  ----  | ----  |

## 自定义事件和原生事件

Event 本身是一个构造函数，可以新建自定义事件对象，然后使用 element.dispatchEvent(event) 去触发这个事件。

下面是 new Event 自定义事件的例子：

```js
const event = new Event('build');
elem.addEventListener('build', function (e) {}, false);
elem.dispatchEvent(event);
```

如果想为自定义事件添加数据，可以使用 CustomEvent 构造函数创建自定义事件：

```js
const event = new CustomEvent('build', {
    detail: '哈哈哈', // 自定义数据，可以传任意类型
    bubbles: false, // 是否能冒泡
    cancelable: false, // 是否能取消
});
elem.addEventListener('build', function (e) {
    console.log(e.detail) // '哈哈哈'
}, false);
elem.dispatchEvent(event);
```

如果想使用 js 去创建原生事件并且触发，可以使用原生事件对应的构造函数，例如 MouseEvent。

```js
const event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
});
elem.dispatchEvent(event);
```

上面这样触发 click 事件相当于调用元素的 click() 方法：elem.click()。元素除了 click 方法，还有 blur focus 方法。

## addEventListener

```js
target.addEventListener(type, listener, options);
target.addEventListener(type, listener, useCapture);
```

当第三个参数 useCapture 使用布尔值的时候，含义是是否使用事件捕获。