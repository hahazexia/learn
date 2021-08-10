# XMLHttpRequest

自己封装一个 ajax 方法：

```js
function ajax({url, method = 'GET', dataType = 'JSON', headers, data = null}) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.responseType = dataType;
        
        Object.keys(headers).forEach(i => {
            xhr.setRequestHeader(i, headers[i]);
        });
        
        // xhr.onreadystatechange = () => {
        //     if (xhr.readyState === 4 && xhr.status === 200) {
        //         resolve(xhr.response)
        //     }
        // }
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response)
            } else {
                resolve({
                    Code: xhr.status,
                    Data: xhr.response
                })
            }
        }
        xhr.onerror = err => {
            reject(err);
        }
        xhr.send(data);
    });
}

ajax({
    url:'./test.json', 
    method: 'get'
}).then(res => {
    console.log(res);
}, err => {
    console.log(err)
});
```


## 设置请求头

xhr.setRequestHeader() 用来设置请求头。此方法必须在 open() 方法和 send() 之间调用。setRequestHeader 可以调用多次，最终的值不会采用覆盖的方式，而是采用追加的方式。

```js
var client = new XMLHttpRequest();
client.open('GET', 'demo.cgi');
client.setRequestHeader('X-Test', 'one');
client.setRequestHeader('X-Test', 'two');
// 最终request header中"X-Test"为: one, two
client.send();
```


## 设置响应的类型

设置 xhr.response 的类型，一个是 level 1 就提供的 xhr.overrideMimeType() 方法，另一个是 level 2 才提供的 xhr.responseType 属性。

### xhr.overrideMimeType()

xhr.overrideMimeType() 用来重写 response 的 content-type。

下面是一个获取图片文件的代码示例：

```js
var xhr = new XMLHttpRequest();
//向 server 端获取一张图片
xhr.open('GET', '/path/to/image.png', true);

// 这行是关键
// 将响应数据按照纯文本格式来解析，字符集替换为用户自己定义的字符集
xhr.overrideMimeType('text/plain; charset=x-user-defined');

xhr.onreadystatechange = function(e) {
  if (this.readyState == 4 && this.status == 200) {
    // 通过 responseText 来获取图片文件对应的二进制字符串
    var binStr = this.responseText;
    // 然后自己再想方法将逐个字节还原为二进制数据
    for (var i = 0, len = binStr.length; i < len; ++i) {
      var c = binStr.charCodeAt(i);
      // String.fromCharCode(c & 0xff);
      var byte = c & 0xff; 
    }
  }
};

xhr.send();
```

### xhr.responseType

xhr.responseType 用来设置 xhr.response 的数据类型。

|   值   |  responseType  |  说明  |
|  ----  | ----  | ----  |
|  ''  | string 字符串  | 默认值  |
|  'text'  | string 字符串  |   |
|  'document'  | document 对象  | 希望返回 XML 格式数据时使用  |
|  'json'  | js 对象  | 存在兼容性问题，IE10/IE11不支持  |
|  'blob'  | Blob 对象  |   |
|  'arrayBuffer'  | ArrayBuffer 对象  |   |


下面的例子使用 xhr.responseType 获取一张图片

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', '/path/to/image.png', true);

//可以将`xhr.responseType`设置为`"blob"`也可以设置为`" arrayBuffer"`
//xhr.responseType = 'arrayBuffer';

xhr.responseType = 'blob';

xhr.onload = function(e) {
  if (this.status == 200) {
    var blob = this.response;
    ...
  }
};

xhr.send();
```

## 获取响应数据

xhr 提供了 3 个属性来获取请求返回的数据，分别是：xhr.response xhr.responseText xhr.responseXML

* xhr.response
    - 默认值：空字符串""
    - 当请求完成时，此属性才有正确的值
    - 请求未完成时，此属性的值可能是 "" 或者 null，具体与 xhr.responseType 有关：当 responseType 为 "" 或 "text" 时，值为 ""；responseType 为其他值时，值为 null
* xhr.responseText
    - 默认值为空字符串 ""
    - 只有当 responseType 为 "text" 或 "" 时，xhr 对象上才有此属性，此时才能调用 xhr.responseText，否则抛错
    - 只有当请求成功时，才能拿到正确值。以下2种情况下值都为空字符串 ""：请求未完成、请求失败
* xhr.responseXML
    - 默认值为 null
    - 只有当 responseType 为 "text" 或 "" 或 "document" 时，xhr 对象上才有此属性，此时才能调用 xhr.responseXML ，否则抛错
    - 只有当请求成功且返回数据被正确解析时，才能拿到正确值。以下 3 种情况下值都为 null：请求未完成、请求失败、请求成功但返回数据无法被正确解析时

## 追踪当前请求状态

xhr.readyState 这个属性可以追踪到，每次 xhr.readyState 的值发生变化时，都会触发 xhr.onreadystatechange 事件。

```js
    xhr.onreadystatechange = function () {
        switch(xhr.readyState){
            case 0: // UNSENT xhr 对象已创建，尚未调用 open() 方法，0 不会触发 onreadystatechange
                break;
            case 1: // OPENED open() 方法已经被调用
                break;
            case 2: // HEADERS_RECEIVED send() 方法已经被调用，并且头部和状态已经可获得
                break;
            case 3: // LOADING 下载中，responseText 属性已经包含部分数据
                break;
            case 4: // DONE 下载操作已完成
                break;
        }
    }
```

## 超时时间

* xhr.timeout 用来设置超时时间。单位毫秒，默认值为 0 ，即没有超时时间。
* 从 xhr.send() 调用后开始计时，xhr.timeout 时间过后还没有结束，则会触发 ontimeout 事件。
* xhr.loadend 触发的时候即请求结束。

## 获取请求的进度

onprogress 事件来实时显示进度，默认情况下这个事件每 50ms 触发一次。需要注意的是，上传过程和下载过程触发的是不同对象的 onprogress 事件：
* 上传触发的是xhr.upload对象的 onprogress事件
* 下载触发的是 xhr 对象的 onprogress 事件

```js
xhr.onprogress = updateProgress;
xhr.upload.onprogress = updateProgress;

function updateProgress(event) {
    if (event.lengthComputable) {
      var completedPercent = event.loaded / event.total;
    }
 }
```

## 请求的数据

xhr.send(data) 的参数 data 就是请求发送的数据。

* ArrayBuffer
* Blob
* Document
* DOMString
* FormData
* null

xhr.send(data) 中 data 参数的数据类型会影响请求头部 content-type 的默认值：

* 如果 data 是 Document 类型，同时也是 HTML Document 类型，则 content-type 默认值为 text/html;charset=UTF-8; 否则为 application/xml;charset=UTF-8；
* 如果 data 是 DOMString 类型，content-type 默认值为 text/plain;charset=UTF-8；
* 如果 data 是 FormData 类型，content-type 默认值为 multipart/form-data; boundary=[xxx]
* 如果 data 是其他类型，则不会设置 content-type 的默认值

这些只是 content-type 的默认值，但如果用 xhr.setRequestHeader() 手动设置了中 content-type 的值，以上默认值就会被覆盖。

## 事件

1. 7 个事件
    * onloadstart
    * onprogress
    * onabort
    * ontimeout
    * onerror
    * onload
    * onloadend
2. xhr 和 xhr.upload 都有上面 7 个事件
3. onreadystatechange 是 xhr 独有的事件

|   事件   |  触发条件  |
|  ----  | ----  |
|  onreadystatechange  |  每当 xhr.readyState 改变时触发；但 xhr.readyState 由非 0 值变为 0 时不触发  |
|  onloadstart  |  调用 xhr.send() 方法后立即触发  |
|  onprogress  |  xhr.upload.onprogress 在上传阶段(即 xhr.send() 之后，xhr.readystate=2 之前)触发，每 50ms 触发一次；xhr.onprogress 在下载阶段（即 xhr.readystate=3 时）触发，每 50ms 触发一次。  |
|  onload  |  当请求成功完成时触发，此时 xhr.readystate=4  |
|  onloadend  |  当请求结束（包括请求成功和请求失败）时触发  |
|  onabort  |  当调用 xhr.abort() 后触发  |
|  ontimeout  |  xhr.timeout 不等于 0，由请求开始即 onloadstart 开始算起，当到达 xhr.timeout 所设置时间请求还未结束即 onloadend，则触发此事件  |
|  onerror  |  在请求过程中，若发生 Network error 则会触发此事件（若发生 Network error 时，上传还没有结束，则会先触发 xhr.upload.onerror，再触发 xhr.onerror；若发生 Network error 时，上传已经结束，则只会触发 xhr.onerror）。注意，只有发生了网络层级别的异常才会触发此事件，对于应用层级别的异常，如响应返回的 xhr.statusCode 是 4xx 时，并不属于 Network error，所以不会触发 onerror 事件，而是会触发 onload 事件。  |

### 事件触发顺序

* 触发 xhr.onreadystatechange(之后每次readyState变化时，都会触发一次)
* 触发 xhr.onloadstart

* 上传阶段开始：

* 触发 xhr.upload.onloadstart
* 触发 xhr.upload.onprogress
* 触发 xhr.upload.onload
* 触发 xhr.upload.onloadend

*  上传结束，下载阶段开始：

* 触发 xhr.onprogress
* 触发 xhr.onload
* 触发 xhr.onloadend

### 发生abort/timeout/error异常的处理

在请求的过程中，有可能发生 abort/timeout/error 这 3 种异常。那么一旦发生这些异常，xhr 后续会进行处理：

* 一旦发生 abort 或 timeout 或 error 异常，先立即中止当前请求
* 将 readystate 置为 4，并触发 xhr.onreadystatechange 事件
* 如果上传阶段还没有结束，则依次触发以下事件：
    * xhr.upload.onprogress
    * xhr.upload.[onabort 或 ontimeout 或 onerror]
    * xhr.upload.onloadend

* 触发 xhr.onprogress事件

* 触发 xhr.[onabort 或 ontimeout 或 onerror] 事件
* 触发 xhr.onloadend 事件

## XMLHttpRequest 运行原理

代码中实例化 XMLHttpRequest 对象后渲染进程会通过 IPC 通知网络进程去执行具体的 http 请求，然后网络进程将执行结果通过 IPC 通知渲染进程，然后渲染进程再将对应的消息和回调函数加入消息队列。