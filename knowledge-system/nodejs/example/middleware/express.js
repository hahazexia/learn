const Express = require('express');
const app = new Express();
const sleep = () => new Promise(resolve => setTimeout(function () { resolve(1) }, 2000));

function f1(req, res, next) {
    console.log('this is function f1....');
    next();
    console.log('f1 fn executed done');
}

function f2(req, res, next) {
    console.log('this is function f2....');
    next();
    console.log('f2 fn executed done');
}

async function f3(req, res) {
    await sleep();
    console.log('f3 send to client');
    res.send('Send To Client Done');
}
app.use(f1);
app.use(f2);
app.use(f3);
app.get('/', f3)
app.listen(3000, () => console.log(`Example app listening on port ${3000}!`))

// this is function f1....
// this is function f2....
// f2 fn executed done
// f1 fn executed done
// f3 send to client
