const app = require('express')();

app.use((req, res, next) => {
    try {
        setTimeout(() => {
            const a = c;
            next()
        }, 0)
    } catch(e) {
        console.log('异步错误，能catch到么？？')
    }
    
    
});

app.use((err, req, res, next) => {
    if(err) {
        console.log('这里会执行么??', err.message);
    }
    next()
})


process.on("uncaughtException", (err) => {
    console.log("uncaughtException message is::", err);
})

app.listen(3000)