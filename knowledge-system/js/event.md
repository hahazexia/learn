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
## 冒泡和捕获

* 当一个元素上的事件被触发了，浏览器会运行两个不同的阶段，捕获和冒泡。
* 捕获阶段。事件会从根元素向子孙元素传递，一直传递到目标元素为止，这期间如果有元素也绑定了同样的事件，那么它的回调函数也会被触发。
* 冒泡阶段。事件从目标元素开始，向祖先元素传递，一直到根元素为止。这期间如果有元素也绑定了同样的事件，那么它的回调函数也会被触发。
* 浏览器事件默认都是冒泡的，想要设置成捕获需要设置 addEventListener 第三个参数为 true

下面例子中，如果点击 d ，默认是冒泡的，所以事件回调触发顺序：d c b a

```html
<div id="a">
    <div id="b">
        <div id="c">
            <div id="d">
                aaa
            </div>
        </div>
    </div>
</div>
<script>
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    const c = document.getElementById('c');
    const d = document.getElementById('d');

    d.addEventListener('click', (e) => {
        console.log('target：', e.target, 'currentTarget', e.currentTarget)
    });
    c.addEventListener('click', (e) => {
        console.log('target：', e.target, 'currentTarget', e.currentTarget)
    });
    b.addEventListener('click', (e) => {
        console.log('target：', e.target, 'currentTarget', e.currentTarget)
    });
    a.addEventListener('click', (e) => {
        console.log('target：', e.target, 'currentTarget', e.currentTarget)
    });
</script>
```

如果想要改成捕获的 a b c d，改成下面这样

```html
<div id="a">
    <div id="b">
        <div id="c">
            <div id="d">
                aaa
            </div>
        </div>
    </div>
</div>
<script>
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    const c = document.getElementById('c');
    const d = document.getElementById('d');

    d.addEventListener('click', (e) => {
        console.log('target：', e.target, 'currentTarget', e.currentTarget)
    });
    c.addEventListener('click', (e) => {
        console.log('target：', e.target, 'currentTarget', e.currentTarget)
    }, true);
    b.addEventListener('click', (e) => {
        console.log('target：', e.target, 'currentTarget', e.currentTarget)
    }, true);
    a.addEventListener('click', (e) => {
        console.log('target：', e.target, 'currentTarget', e.currentTarget)
    }, true);
</script>
```

## 事件对象

addEventListener 添加的回调函数会收到一个参数，这个参数就是 Event 实例对象。

|  属性或方法   |  含义  |
|  ----  | ----  |
|  bubbles  | 只读，布尔值，事件是否冒泡  |
|  currentTarget  | 只读，事件当前注册的元素的引用  |
|  target  | 只读，真正触发事件的那个元素的引用  |
|  preventDefault()  | 取消默认事件  |
|  stopPropagation()  | 阻止事件冒泡  |

下面是关于 preventDefault 阻止默认事件的例子

```html
    <!-- a 链接点击事件 preventDefault 后页面就不会跳转到链接 href 指向的页面了 -->
    <a href="http://www.baidu.com" id="a">链接</a>
    <script>
        const a = document.getElementById('a');
        a.addEventListener('click', (e) => {
            e.preventDefault();
        });
    </script>

    <!-- 在元素绑定的 contextmenu 事件里 preventDefault 会阻止浏览器打开默认的右键菜单 -->
    <script>
        document.documentElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        // 下面这样也可以
        document.oncontextmenu = function (e) {
            e.preventDefault();
        }
        // 下面这样也可以
        document.oncontextmenu = function () {
            return false;
        }
    </script>

    <!-- 表单的 submit 事件中 preventDefault 会阻止表单提交 -->
    <form action="http://www.baidu.com" id="form">
        <input type="text" value="aaa" name="name">
        <button type="submit">提交</button>
    </form>
    <script>
        const form = document.getElementById('form');
        form.addEventListener('submit', (e) => {
            console.log('submit')
            e.preventDefault();
        });
    </script>
```

可以看到 preventDefault 和 return false 的区别，当直接给元素设置 onEventName 方法的时候，阻止默认事件就可以使用 return false。如果使用 addEventListener 添加回调，return false 则无效，只能使用 preventDefault。


下面的例子通过 event 对象判断按下了鼠标的哪个按键：

```js
document.documentElement.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        console.log('你点击了鼠标左键');
    }
    if (e.button === 1) {
        console.log('你点击了鼠标中键（滚轮）');
    }
    if (e.button === 2) {
        console.log('你点击了鼠标右键');
    }
});
```

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

当第三个参数 useCapture 使用布尔值的时候，含义是是否使用事件捕获。第三个参数使用对象的时候，有如下字段：

|  options 中的字段   |  含义  |
|  ----  | ----  |
|  capture  | 布尔值，表示事件捕获阶段会触发 listener  |
|  once  | 布尔值，表示 listener 在添加之后最多只调用一次。如果是 true， listener 会在其被调用之后自动移除  |
|  passive  | 布尔值，当设置为 true， preventDefault 将无法取消事件。 |

关于 passive。当我们在滚动页面的时候（通常是我们监听 touch 事件的时候），页面其实会有一个短暂的停顿（大概200ms），浏览器不知道我们是否要 preventDefault，所以它需要一个延迟来检测。这就导致了我们的滑动显得比较卡顿。添加 passive: true 参数后，touchmove 事件不会阻塞页面的滚动（同样适用于鼠标的滚轮事件），也就是说它不会停顿 200ms 去判断是否会调用 preventDefault，于是滑动就不会卡顿了。

规范中 passive 默认值为 false。从 Chrome 56 开始，如果我们给 document 绑定 touchmove 或者 touchstart 事件的监听器，这个 passive 是会被默认设置为 true 以提高性能。

## 题目

现有瀑布流图片页面（页面下拉时无限加载新图片），用 js 监听每个图片的点击事件。


<details>
<summary>答案</summary>

给瀑布流父级盒子绑定事件即可，然后根据 e.target 获取到目标元素，判断如果是图片做相应的处理即可

```js
const waterFallBox = document.getElementById('water-fall-box');
waterFallBox.addEventListener('click', function (e) {
    if (e.target.tagName.toLowerCase() === 'img') {
        // 做处理
    }
});
```
</details>
<br><br>