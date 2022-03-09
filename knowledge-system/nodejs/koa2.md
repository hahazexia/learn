# koa2源码解析

## http 包的不足

首先思考一个问题，既然 nodejs 已经提供了 http 包，我们可以通过 http.createServer 来创建一个服务器，那么为什么我们还需要类似 koa 和 express 这样的框架？

```js
const http = require('http')
const fs = require('fs')

const server = http.createServer((request, response) => {
    const { url, method, headers } = request

    if (url === '/' && method === 'GET') {
        fs.readFile('index.html', (err, data) => {
            response.statusCode = 200
            response.setHeader('Content-Type','text/html')
            response.end(data)
        })
    } else if (url === '/users' && method === 'GET') {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        })
        response.end(JSON.stringify({
            name : 'laowang'
        }))
    // 使用 stream 处理图片的请求
    } else if (method === 'GET' && headers.accept.indexOf('image/*') !== -1) {
        fs.createReadStream('./' + url).pipe(response)
    }
})

server.listen(3000)
```

回顾上面的代码，既然使用 http 包就已经能够开发 web 服务了，为什么还需要封装 koa 这样的框架？

起始 http 包的不足之处有下面几点：

1. API 不够优雅
    ```js
        // 比如说使用 response 对象对请求做出响应

        // 写法一 http 包
        response.statusCode = 200
        response.setHeader('Content-Type','text/html')
        response.end(data)

        // 写法二
        response.body = {
            name: '123'
        }
        // http 包的写法使用 end 方法，这个方法的名字就令人费解，它起这个名字的原因是因为 response 对象是一个流，只是 http 协议的一个浅层封装，所以语义上并不明确
        // 而第二种写法就简单明了，符合人的直觉，直接可以看出其含义是响应数据的 body 是一个 json 对象，并且不需要额外手动设置 header，框架会自行判断数据类型然后添加
    ```

1. 如果路由只有 1 ~ 5 个，那么可以使用 if else 来实现，但是当路由数量达到 100 个或者上千个，那么就不能使用 if else 了，程序规模变得庞大这时候就必须引入设计模式中的`策略模式`。

1. 切面描述需要。
    * 比如所有操作前后都需要记录日志
    * 比如所有操作之前都需要鉴权
    * 这里的解决方案类似前端路由之中的路由守卫的效果

## koa

koa 是 Express 的下⼀代基于 Node.js 的 web 框架，koa2 完全使⽤ Promise 并配合 async 来实现异步。

```js
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```