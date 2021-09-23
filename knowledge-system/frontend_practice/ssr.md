# ssr

## 概念

ssr 就是在服务端将 vue 组件解析成 html 字符串，然后发送给浏览器。

优点：

* 更好的 SEO，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面
* 更快的内容到达时间 (time-to-content)，也就是首屏时间。因为不需要等待 js 下载完成后再去执行 js 生成 dom。
* 还可以使用预渲染 prerender-spa-plugin，无需使用 web 服务器实时动态编译 HTML，而是在构建时 (build time) 简单地生成针对特定路由的静态 HTML 文件。优点是设置预渲染更简单，并可以将你的前端作为一个完全静态的站点。

局限性：

* 在服务端渲染中，created 和 beforeCreate 之外的生命周期钩子不可用
* 服务端渲染比仅仅提供静态文件的服务器更加占用 CPU 资源
* 需要 nodejs

## 原理

通过 Webpack 打包生成两份 bundle 文件：

* Client Bundle，给浏览器用。和纯 Vue 前端项目 Bundle 类似
* Server Bundle，供服务端 SSR 使用，一个 json 文件


## 使用

和 express 结合的例子：

```js
const Vue = require('vue')
const server = require('express')()
const renderer = require('vue-server-renderer').createRenderer()

server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })

  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error')
      return
    }
    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>${html}</body>
      </html>
    `)
  })
})

server.listen(8080)

```

[查看代码](./example/srr/index.js)

