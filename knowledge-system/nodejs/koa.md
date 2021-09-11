# koa

## http 包的不足

```js
const http = require('http')
const fs = require('fs')

const server = http.createServer((request, response) => {
    const { url, method, headers } = request

    if (url === '/' && method === 'GET') {
        fs.readFile('index.html',(err, data) => {
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
    } else if (method === 'GET' && headers.accept.indexOf('image/*') !== -1) {
        fs.createReadStream('./' + url).pipe(response)
    }
})

server.listen(3000)
```

1. api 不优雅，只是对 http 协议的一个浅层封装，不是从开发者使用的角度封装的，用起来不方便。
2. 路由。当不同的 url 数量小于 5 个的时候还可以使用 if else 的写法，但是数量达到上百个以后，就需要使用策略模式，不能再使用简单的 if else 写法了。
3. 切面描述需要。例如操作前后记录日志，操作前需要鉴权。

## 封装 koa 的 ctx 对象

