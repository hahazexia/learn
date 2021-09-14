const http = require('http');
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next)=>{
    try {
        await next();
    } catch (error) {
        ctx.status = 500;
        ctx.body = '进入默认错误中间件';
    }
});

app.use(async (ctx, next) => {
    await (() => new Promise((resolve, reject) => {
        http.get('http://www.example.com/testapi/123', res => {
            reject('假设错误了');
        }).on('error', (e) => {
            throw new Error(e);
        })
    }))();
    await next();
})

app.listen(3000)