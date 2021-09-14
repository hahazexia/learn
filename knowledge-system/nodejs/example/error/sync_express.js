const app = require('express')();

app.use((req, res, next) => {
    const a = c;
});

app.use((err, req, res, next) => {
    if(err) {
        console.log(err.message, '出错了');
    }
    next()
})

process.on("uncaughtException", (err) => {
    console.log("uncaughtException message is::", err);
})

app.listen(3000)