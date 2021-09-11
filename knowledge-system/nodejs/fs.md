# fs

```js
const fs = require('fs');
```

fs 模块用于处理文件系统，基于 POSIX （可移植系统操作接口）。

## 三种形式

所有 fs 模块的操作都有三种形式
* 同步
* 回调
* promise 异步

```js
// 同步例子
// 同步形式会阻塞 nodejs 的事件循环和之后 js 的执行

const fs = require('fs');

try {
  fs.unlinkSync('/tmp/hello');
  console.log('successfully deleted /tmp/hello');
} catch (err) {
  // handle the error
}

// 回调例子
// 回调形式会接收最后一个参数为一个回调函数，然后异步执行。回调接收的参数根据不同的方法而定，但是第一个参数都是抛出的 error 对象。如果操作成功了，第一个参数会收到 null 或者 undefined

const fs = require('fs');

fs.unlink('/tmp/hello', (err) => {
  if (err) throw err;
  console.log('successfully deleted /tmp/hello');
});

// promise 异步形式
// 异步形式返回一个 promise 对象

const fs = require('fs/promises');

(async function(path) {
  try {
    await fs.unlink(path);
    console.log(`successfully deleted ${path}`);
  } catch (error) {
    console.error('there was an error:', error.message);
  }
})('/tmp/hello');
```

## 文件路径

大多数 fs 操作都接受文件路径参数，这个参数可以是字符串，Buffer，或者使用文件协议的 URL 对象。字符串形式的相对路径会通过调用 process.cwd 被分解为当前工作路径。

```js
// 绝对路径（将前面的根目录省略了）
const fs = require('fs');

fs.open('/open/some/file.txt', 'r', (err, fd) => {
  if (err) throw err;
  fs.close(fd, (err) => {
    if (err) throw err;
  });
});

// 相对路径
fs.open('file.txt', 'r', (err, fd) => {
  if (err) throw err;
  fs.close(fd, (err) => {
    if (err) throw err;
  });
});
```

## 常用方法

### `fs.exists()` `fs.existsSync(path)`

```js
fs.exists() // 不建议使用
fs.existsSync(path)

// path <string> | <Buffer> | <URL>
// Returns: <boolean>
```

如果路径存在返回 true，否则 false


### `fs.rmdir(path[, options], callback)` `fs.rmdirSync(path[, options])`

```js
fs.rmdir(path[, options], callback)

// path <string> | <Buffer> | <URL>
// options <Object>
    // maxRetries  <integer> 遇到错误时重试次数
    // retryDelay <integer> 重试之前的毫秒数
    // recursive  <boolean> 是否递归目录删除
// callback <Function>

fs.rmdirSync(path[, options])
```

fs.rmdir 和 fs.rmdirSync 用于删除目录。


### `fs.mkdir(path[, options], callback)` `fs.mkdirSync(path[, options])`

```js
fs.mkdir(path[, options], callback)
fs.mkdirSync(path[, options])

// path <string> | <Buffer> | <URL>
// options <Object> | <integer>
//     recursive <boolean> Default: false
//     mode <string> | <integer> Not supported on Windows. Default: 0o777.
// Returns: <string> | <undefined>
```

创建一个新目录。

默认 recursive 为 false，如果要创建 /a/b/c 目录，a 目录不存在会报错。recursive 设置为 true 后就可以创建成功。


### `fs.readdir(path[, options], callback)` `fs.readdirSync(path[, options])`

```js
fs.readdirSync(path[, options])
fs.readdir(path[, options], callback)

// path <string> | <Buffer> | <URL>
// options <string> | <Object>
    // encoding <string> Default: 'utf8'
    // withFileTypes <boolean> Default: false
// callback <Function>
    // err <Error>
    // files <string[]> | <Buffer[]> | <fs.Dirent[]>
```

读取目录下的内容。回调接收的第二个参数是目录下的文件名组成的数组。


### `fs.writeFile(file, data[, options], callback)` `fs.writeFileSync(file, data[, options])`

```js
fs.writeFile(file, data[, options], callback)

// file <string> | <Buffer> | <URL> | <integer> filename or file descriptor
// data <string> | <Buffer> | <TypedArray> | <DataView> | <Object>
// options <Object> | <string>
    // encoding <string> | <null> Default: 'utf8'
    // mode <integer> Default: 0o666
    // flag <string> See support of file system flags. Default: 'w'.
    // signal <AbortSignal> allows aborting an in-progress writeFile
// callback <Function>
    // err <Error>
```

向指定文件名写入数据，如果文件已经存在则会被新内容替换。


### `fs.stat(path[, options], callback)` `fs.statSync(path[, options])` 

```js
fs.stat(path[, options], callback)
fs.statSync(path[, options])

// path <string> | <Buffer> | <URL>
// options <Object>
    // bigint <boolean> Whether the numeric values in the returned fs.Stats object should be bigint. Default: false.
// callback <Function>
    // err <Error>
    // stats <fs.Stats>
```
返回 fs.Stats 对象，此对象用于提供文件的详细信息。

fs.Stats 对象可以可以通过调用 stats.isFile() 方法判断是否是一个文件，stats.isDirectory() 方法判断是否是一个目录。
