const fs = require('fs')
const path = require('path')


// 创建文件夹
const filePath = './why'
if (!fs.existsSync(filePath)) {
    fs.mkdir(filePath, err => {
        console.log(err)
    })
}

// 读取文件夹内所有文件

function getFiles (filePath) {
    fs.readdir(filePath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(files, 'files')
        for (const f of files) {
            if (f.isDirectory()) {
                getFiles(path.resolve(filePath, f.name));
            } else {
                console.log(f.name);
            }
        }
    });
}

getFiles(filePath)

// 重命名
fs.rename('./why', './aaa', err => {
    console.log(err)
})