const fs = require('fs')

const filePath = './abc.txt'

// 同步方法

const info = fs.statSync(filePath);
console.log(info, 'statSync')

// 回调方法

fs.stat(filePath, (err, info) => {
    if (err) {
        console.log(err)
    }
    console.log(info, 'fs.stat')
})

// promise

fs.promises.stat(filePath).then(info => {
    console.log(info, 'fs.promises.stat')
})
