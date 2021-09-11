# Buffer

buffer 对象用于表示固定长度的字节，也就是二进制数据。

Buffer 类是 js 的 Uint8Array 类的子类，被扩展后可以支持额外使用场景。Buffer 类在全局作用域下可以直接使用，不需要 require。

## 常用方法

### `Buffer.alloc(size[, fill[, encoding]])`

```js
Buffer.alloc(size[, fill[, encoding]])
// size <integer> The desired length of the new Buffer.
// fill <string> | <Buffer> | <Uint8Array> | <integer> A value to pre-fill the new Buffer with. Default: 0.
// encoding <string> If fill is a string, this is its encoding. Default: 'utf8'.
```

分配一段指定大小的内存空间用于存储 buffer 数据。如果 fill 是 undefined，则默认由 0 填充。

```js
const buf = Buffer.alloc(5);

console.log(buf);
// Prints: <Buffer 00 00 00 00 00>
```


### `Buffer.from()`

```js
Buffer.from(array)
Buffer.from(arrayBuffer[, byteOffset[, length]])
Buffer.from(buffer)
Buffer.from(string[, encoding])
```

创建一个 buffer 对象。参数可以是多种类型。

```js
const buf1 = Buffer.from('this is a tést');
const buf2 = Buffer.from('7468697320697320612074c3a97374', 'hex');

console.log(buf1.toString());
// Prints: this is a tést
console.log(buf2.toString());
// Prints: this is a tést
console.log(buf1.toString('latin1'));
// Prints: this is a tÃ©st
```

### `Buffer.concat(list[, totalLength])`

```js
Buffer.concat(list[, totalLength])

// list <Buffer[]> | <Uint8Array[]> List of Buffer or Uint8Array instances to concatenate.
// totalLength <integer> Total length of the Buffer instances in list when concatenated.
// Returns: <Buffer>
```

将第一个参数数组中所有 buffer 对象连接起来变成一个 buffer 然后返回。

```js
// Create a single `Buffer` from a list of three `Buffer` instances.

const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

console.log(totalLength);
// Prints: 42

const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

console.log(bufA);
// Prints: <Buffer 00 00 00 00 ...>
console.log(bufA.length);
// Prints: 42
```

### `buf.toString([encoding[, start[, end]]])`

```js
buf.toString([encoding[, start[, end]]])

// encoding <string> The character encoding to use. Default: 'utf8'.
// start <integer> The byte offset to start decoding at. Default: 0.
// end <integer> The byte offset to stop decoding at (not inclusive). Default: buf.length.
// Returns: <string>
```

buffer 对象实例方法，将 buffer 对象按照指定编码解码成字符串返回。

```js
const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf1[i] = i + 97;
}

console.log(buf1.toString('utf8'));
// Prints: abcdefghijklmnopqrstuvwxyz
console.log(buf1.toString('utf8', 0, 5));
// Prints: abcde

const buf2 = Buffer.from('tést');

console.log(buf2.toString('hex'));
// Prints: 74c3a97374
console.log(buf2.toString('utf8', 0, 3));
// Prints: té
console.log(buf2.toString(undefined, 0, 3));
// Prints: té
```

### `buf.write(string[, offset[, length]][, encoding])`

```js
buf.write(string[, offset[, length]][, encoding])

// string <string> String to write to buf.
// offset <integer> Number of bytes to skip before starting to write string. Default: 0.
// length <integer> Maximum number of bytes to write (written bytes will not exceed buf.length - offset). Default: buf.length - offset.
// encoding <string> The character encoding of string. Default: 'utf8'.
// Returns: <integer> Number of bytes written.
```

向 buffer 对象中写入字符串数据。

```js
const buf = Buffer.alloc(256);

const len = buf.write('\u00bd + \u00bc = \u00be', 0);

console.log(`${len} bytes: ${buf.toString('utf8', 0, len)}`);
// Prints: 12 bytes: ½ + ¼ = ¾

const buffer = Buffer.alloc(10);

const length = buffer.write('abcd', 8);

console.log(`${length} bytes: ${buffer.toString('utf8', 8, 10)}`);
// Prints: 2 bytes : ab
```