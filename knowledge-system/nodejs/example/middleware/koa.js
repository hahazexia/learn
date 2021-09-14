const Koa = require('koa');
const app = new Koa();
const sleep = () => new Promise(resolve => setTimeout(function(){resolve()}, 1000))

app.use(async (ctx, next) => {
    console.log('middleware 1 start');
    await next();
    console.log('middleware 1 end');
});
app.use(async (ctx, next) => {
    await sleep();
    console.log('middleware 2 start');
    await next();
    console.log('middleware 2 end');
});

app.use(async (ctx, next) => {
    console.log('middleware 3 start')
    ctx.body = 'test middleware executed';
})


app.listen(3000)

// middleware 1 start
// middleware 2 start
// middleware 3 start
// middleware 2 end
// middleware 1 end