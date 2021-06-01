const path = require('path')

// 获取路径信息

const basePath = '/User/Why/abc.txt'
console.log(path.dirname(basePath)) // 获取文件所在目录的路径
console.log(path.basename(basePath)) // 获取文件名
console.log(path.extname(basePath)) // 获取文件扩展名

// join 路径拼接

const basePath2 = '../User/why';
const filename = './abc.txt';

const filePath = path.join(basePath2, filename);

console.log(filePath)