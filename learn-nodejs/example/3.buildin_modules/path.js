const path = require('path')

const basePath = '/User/Why'
const fileName = 'abc.txt'

const filePath = path.resolve(basePath, fileName)
console.log(filePath) // D:\User\Why\abc.txt