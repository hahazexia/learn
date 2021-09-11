# path

```js
const path = require('path');
```
path 模块提供工具方法来处理文件和目录的路径。

## 常用方法

### `path.dirname(path)`

```js
path.dirname(path)
// path String
// return String
```

path.dirname 方法返回一个路径的目录名，和 Unix 系统的 dirname 命令类似。路径结尾处的分隔符会被忽略。如果参数不是字符串，会抛出 TypeError 错误。

```js
path.dirname('/foo/bar/baz/asdf/quux');
// Returns: '/foo/bar/baz/asdf'
```

### `path.basename(path[, ext])`

```js
path.basename(path[, ext])
// path String
// ext String 可选的文件扩展名
// return String
```

path.basename 方法返回路径的最后一部分，和 Unix 系统的 basename 命令类似。路径结尾处的分隔符会被忽略。

```js
path.basename('/foo/bar/baz/asdf/quux.html');
// Returns: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Returns: 'quux'
```

ext 扩展名参数是大小写敏感的

```js
path.win32.basename('C:\\foo.html', '.html');
// Returns: 'foo'

path.win32.basename('C:\\foo.HTML', '.html');
// Returns: 'foo.HTML'
```

### `path.extname(path)`

```js
path.extname(path)
// path String
// return String
```

path.extname 方法返回路径所代表的文件的扩展名，也就是路径的最后一部分中最后一个 . （点）字符到路径的结尾的内容。如果路径最后一部分没有点字符，或者除了 basename 的第一个字符是点以外没有其他点字符，path.extname 就会返回空字符串。

```js
path.extname('index.html');
// Returns: '.html'

path.extname('index.coffee.md');
// Returns: '.md'

path.extname('index.');
// Returns: '.'

path.extname('index');
// Returns: ''

path.extname('.index');
// Returns: ''

path.extname('.index.md');
// Returns: '.md'
```

### `path.join([...paths])`

```js
path.join([...paths])
// ...paths 路径片段组成的序列
// return String
```

path.join 方法将所有参数片段用平台指定的分隔符连接起来，然后标准化。

长度为零的片段会被忽略。如果所有参数都是空字符串，那么最后会返回 '.'，代表当前工作目录。

```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// Returns: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar');
// Throws 'TypeError: Path must be a string. Received {}'
```

### `path.resolve([...paths])`

```js
path.resolve([...paths])
// ...paths 路径片段组成的序列
// return String
```

path.resolve 方法将一组路径分解然后组成一个绝对路径。

给定的路径序列是从右往左解析的。例如，path.resolve('/foo', '/bar', 'baz') 会返回 /bar/baz 因为 baz 不是一个绝对路径但是 /bar/baz 是。

如果所有路径片段都解析结束，还是没有生成绝对路径，那么就会使用当前工作目录。

path.resolve 方法不是简单地拼接关系，而是类似 cd 命令的解析。

```js
path.resolve('/foo/bar', './baz');
// Returns: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/');
// Returns: '/tmp/file'

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
// If the current working directory is /home/myself/node,
// this returns '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

### `path.format(pathObject)`

```js
path.format(pathObject)
// pathObject Object 任意对象包含以下属性
// dir String
// root String
// base String
// name String
// ext String
// return String
```

path.format 方法基于一个对象返回路径字符串。这个方法和 path.parse 的作用相反。对象中的属性是有优先级的：pathObject.dir 存在则 pathObject.root 会被忽略。如果 pathObject.base 存在则 pathObject.ext 和 pathObject.name 被忽略。

下面的例子对于 POSIX （可移植系统操作接口）：

```js
// If `dir`, `root` and `base` are provided,
// `${dir}${path.sep}${base}`
// will be returned. `root` is ignored.
path.format({
  root: '/ignored',
  dir: '/home/user/dir',
  base: 'file.txt'
});
// Returns: '/home/user/dir/file.txt'

// `root` will be used if `dir` is not specified.
// If only `root` is provided or `dir` is equal to `root` then the
// platform separator will not be included. `ext` will be ignored.
path.format({
  root: '/',
  base: 'file.txt',
  ext: 'ignored'
});
// Returns: '/file.txt'

// `name` + `ext` will be used if `base` is not specified.
path.format({
  root: '/',
  name: 'file',
  ext: '.txt'
});
// Returns: '/file.txt'
```

下面的例子对于 windows

```js
path.format({
  dir: 'C:\\path\\dir',
  base: 'file.txt'
});
// Returns: 'C:\\path\\dir\\file.txt'
```