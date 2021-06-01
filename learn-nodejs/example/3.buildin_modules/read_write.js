const fs = require('fs')

fs.writeFile('./abc.txt', '你好', {flag: 'a'}, err => {
    console.log(err)
})

fs.readFile('./abc.txt', (err, data) => {
    if (err) {
        console.log(err)
        return
    }
    console.log(data)
})