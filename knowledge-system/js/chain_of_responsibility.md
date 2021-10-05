# 责任链模式

职责链模式的定义是：使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系，将这些对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止。

```js
class Middleware {
    constructor() {
        this.middlewares = [];
    }
    use(fn) {
        if (typeof fn !== 'function') {
            throw new Error('Middleware must be function, but get ' + typeof fn);
        } 
        this.middlewares.push(fn);
        return this;
    }
    compose() {
        const middlewares = this.middlewares;
        function dispatch(index) {
            const middleware = middlewares[index];
            if (!middleware) {return;}
            try {
                const ctx = {};
                const result = middleware(ctx, dispatch.bind(null, index + 1));
                return Promise.resolve(result);
            } catch(err) {
                return Promise.reject(err);
            }
        }
        return dispatch(0);
    }
}

const middleware = new Middleware();
middleware.use(async (ctx, next) => {
    console.log(1);
    await next();
    console.log(2);
});
middleware.use(async (ctx, next) => {
    console.log(3);
    await next();
    console.log(4);
});
middleware.compose(); // 1 3 4 2
```