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


## koa 和 express 中间件的区别

请去文件夹中查看[代码示例](./example/middleware/)

* express 中的中间件调用不是基于 Promise 的，所以是同步执行的
* koa 内部使用了 Promise

## 为什么要使用洋葱模型

```js
const Koa = require('koa');
const axios = require('axios');

//Applications
const app = new Koa();

//Middleware 1
app.use(async (ctx, next) => {
    //Using onion model to calculate request time
    const start = new Date();
    await next();
    const delta = new Date() - start;
    console.log (` request time consumption: ${delta} MS`);
});

//Middleware 2
app.use(async (ctx, next) => {
    // The onion model is used to process the results of subsequent middleware
    await next();
    console.log(ctx.baiduHTML);
});

//Middleware 3
app.use(async (ctx, next) => {
    ctx.baiduHTML = await axios.get('http://baidu.com');
});

app.listen(9000, '0.0.0.0', () => {
    console.log(`Server is starting`);
});
```

* 可以方便地计算中间件处理的耗时
* 可以方便地处理后续中间件的结果
* 轻松捕获所有中间件的异常

## koa 和 express 关于错误捕获的区别

请去文件夹中查看[代码示例](./example/error/)

* express 内部对同步发生的错误进行了拦截，所以，不会传到负责兜底的 node 事件 uncaughtException，如果发生了错误，则直接绕过其它中间件，进入错误处理中间件。这里会有一个很容易被忽略的点，即使没有错误处理中间件做兜底，也不会进入 node 的 uncaughtException，这时会直接报 500 错误。

* 因为 express 的实现并没有把 Promise 考虑进去， 它的中间件执行是同步顺序执行的。 所以如果有异步的，那么错误处理中间件实际是兜不住的，所以，express 对这种中间件中的异步处理错误无能为力。

所以要想 catch 当前的错误，那么就需要用 async await 和立即执行函数。

```js
app.use(async (req, res, next) => {
    try {
        await (() => new Promise((resolve, reject) => {
            reject('假设错误了');
        }))();
    } catch(e) {
        console.log('异步错误，能catch到么？？')
    }
});
```

* koa 捕获异常就非常容易了，在最开始的中间件捕获即可


```js
// 异常捕获处理
const handler = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.response.body = {
      code: '00000',
      message: '服务器异常',
      desc: error.message
    }
  }
}

// 异常捕获逻辑，一定要放在第一个中间件
app.use(handler)

app.use(async (ctx, next) => {
  console.log(1)
  await next()
  console.log(2)
})

app.use(async (ctx, next) => {
  console.log(3)
  await next()
  console.log(4)
})
```