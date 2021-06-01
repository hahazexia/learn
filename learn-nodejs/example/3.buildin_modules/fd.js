const fs = require('fs')

fs.open('./abc.txt', (err, fd) => {
    if (err) {
        console.log(err)
        return
    }
    console.log(fd, 'fd')
})