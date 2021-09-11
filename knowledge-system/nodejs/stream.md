# stream

```js
const stream = require('stream');
```

stream （流）是一个抽象接口，用于处理流数据。例如，HTTP 服务器的 request 对象和 process.stdout 都是 stream 的实例。

流是可读的，可写的。所有流都是 EventEmitter 的实例。

## 一个例子理解什么是流

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

当服务器向浏览器响应一张图片的时候，可以用两种方法，一种直接使用 fs 模块读取服务器上的图片文件到内存中，然后再通过响应发送数据，另外一种是通过创建一个可读流，然后 pipe 到 response 对象里。

读取文件到内存中的方法很好理解，但是它有一个缺点，占用资源过多，如果同时有多个请求要处理，并且文件非常大，则会造成服务器内存被占满，而使用流不会。使用 stream 就相当于建立了一个管道，将服务器上的文件读取为二进制数据然后通过管道直接传输到响应里，不会完整地读取整个文件数据到内存中，这样就避免了会大量占用内存地问题。