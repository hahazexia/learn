# preload

link 标签可以设置 preload 和 prefetch 属性。[w3c文档](https://w3c.github.io/preload/)

```html
<link rel="preload" href="/path/to/style.css" as="style">

<script>
const link = document.createElement('link');
link.rel = 'preload';
link.as = 'style';
link.href = '/path/to/style.css';
document.head.appendChild(link);
</script>

```

还可以通过 http 响应头来进行

```js
Link: <https://example.com/other/styles.css>; rel=preload; as=style
```

* preload 将提升资源加载的优先级，并且资源的获取不会阻塞页面渲染和 load 事件，被加载的资源会等到合适的时间才会运行
* prefetch 的资源优先级低，是可选的，所以一般设置的是之后可能会用到的资源，比如第二屏的资源，或之后打开某个页面的资源；而 preload 优先级高，一般设置的是第一次加载页面就要立马用到的资源。
