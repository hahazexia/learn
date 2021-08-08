# link 标签

link 标签主要用于将当前网页与相关的外部资源联系起来，最常用于加载样式表。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>css阻塞</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      h1 {
        color: red !important
      }
    </style>
    <script>
      function h () {
        console.log(document.querySelectorAll('h1'))
      }
      setTimeout(h, 0)
    </script>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
  </head>
  <body>
    <h1>这是红色的</h1>
  </body>
</html>
```

在 chrome 浏览器开发者工具中设置 throttling （节流，模拟弱网）后，可以发现，link 引入的外部 css 还没有被下载完成，js 中已经打印出 h1 标签了，但是页面上并没有渲染出内容，说明： css 加载不会阻塞 DOM 树的解析，css 加载会阻塞DOM 树的渲染。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>css阻塞</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      console.log('before css')
      var startDate = new Date()
    </script>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
  </head>
  <body>
    <h1>这是红色的</h1>
    <script>
      var endDate = new Date()
      console.log('after css')
      console.log('经过了' + (endDate -startDate) + 'ms')
    </script>
  </body>
</html>
```

再次在弱网下运行上面的例子，发现在 link 后面的 js 代码，应该要在 css 加载完成后才会运行。说明：css 加载会阻塞后面 js 语句的执行。

总结：
1. css 加载不会阻塞 DOM 树的解析
2. css 加载会阻塞 DOM 树的渲染
3. css 加载会阻塞后面 js 语句的执行

补充：

```js
window.addEventListener('load', (event) => {
    console.log('load')
});

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded')
});
```

* load 事件会等待页面的所有资源都加载完成才会触发，这些资源包括 css、js、图片视频等。
* 当页面只存在 css，或者 js 都在 css 前面，那么 DomContentLoaded 不需要等到 css 加载完毕。
* 当页面里同时存在 css 和 js，并且 js 在 css 后面的时候，DomContentLoaded 必须等到 css 和 js 都加载完毕才触发。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>css阻塞</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded');
      })
    </script>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
  </head>
  <body>
  </body>
</html>
```

上面的测试代码在 link 的 css 文件还没下载成功时，就已经触发 DOMContentLoaded 了。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>css阻塞</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded');
      })
    </script>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
​
    <script>
      console.log('到我了没');
    </script>
  </head>
  <body>
  </body>
</html>
```

而这里例子中，link 加载 css 下载完了之后，'到我了没' 被打印，然后才触发 DOMContentLoaded。以上例子说明 DOMContentLoaded 事件会等待 DOM 和 js 都加载执行完毕才会触发。