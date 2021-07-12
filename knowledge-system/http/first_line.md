# 起始行

## 组成

* http 报文的第一部分是起始行。
* 请求报文的起始行包括
    * 请求类型（method）
    * url
    * 版本号 （version）
* 响应报文的起始行包括
    * 版本号 （version）
    * 状态码（status code）
    * 原因短语（reason phrase）

```js
// 请求的起始行

GET /test/test.html HTTP/1.1

// 响应的起始行
HTTP 1.1 200 OK
```

## url 统一资源定位符

```js
`https://www.example.com:80/path/to/myfile.html?key1=value1&key2=value2#anchor`
```

* url (统一资源定位符，网址) 由哪些部分组成？
    * 协议（scheme），是浏览器请求服务器资源的方法。
    互联网支持多种协议，必须指明网址使用哪一种协议，默认是 `HTTP` 协议。`HTTP` 和 `HTTPS` 的协议名称后面，紧跟着一个冒号和两个斜杠（`://`）。其他协议不一定如此，邮件地址协议`mailto:`的协议名后面只有一个冒号，比如`mailto:foo@example.com`。
    * 主机（host），是资源所在的网站名或服务器的名字，又称为`域名`。有些主机没有域名，只有 `IP` 地址，比如192.168.2.15。
    * 端口（port），同一个域名下面可能同时包含多个网站，它们之间通过端口区分。网站的默认端口是 `80`。端口紧跟在域名后面，两者之间使用冒号分隔，比如`www.example.com:80`。
    * 路径（path），是资源在网站的位置。互联网的早期，路径是真实存在的物理位置。现在由于服务器可以模拟这些位置，所以路径只是虚拟位置。
    * 查询参数（parameter），是提供给服务器的额外信息。参数的位置是在路径后面，两者之间使用`?`分隔，例如`?key1=value1&key2=value2`。
    查询参数可以有一组或多组。每组参数都是键值对（key-value pair）的形式，同时具有键名(key)和键值(value)，它们之间使用等号（=）连接。比如，`key1=value`就是一个键值对，`key1`是键名，`value1`是键值。多组参数之间使用&连接，比如`key1=value1&key2=value2`。
    * 锚点（anchor），是网页内部的定位点。浏览器加载带有锚点的页面以后，会自动滚动到锚点所在的位置。

* 组成 url 的字符有哪些？
    * 第一种，合法字符：
        * 26个英语字母（包括大写和小写）
        * 10个阿拉伯数字
        * 连词号`-`
        * 句点`.`
        * 下划线`_`
    * 第二种，18 个保留字符，要使用这些保留字符，必须使用它们的转义形式，在这些字符的十六进制 `ASCII` 码前面加上百分号 `%`。
        * !：%21
        * #：%23
        * $：%24
        * &：%26
        * '：%27
        * (：%28
        * )：%29
        * *：%2A
        * +：%2B
        * ,：%2C
        * /：%2F
        * :：%3A
        * ;：%3B
        * =：%3D
        * ?：%3F
        * @：%40
        * [：%5B
        * ]：%5D
    * 第三种，合法字符和保留字符除外的其他字符，理论上不需要手动转义，可以直接写在 URL 里面，浏览器会自动将它们转义，发给服务器。转义方法是使用这些字符的十六进制 UTF-8 编码，每两位算作一组，然后每组头部添加百分号`%`。比如 `www.example.com/中国.html` 可以写作 `www.example.com/%e4%b8%ad%e5%9b%bd.html`，`中`的转义形式是`%e4%b8%ad`，`国`是`%e5%9b%bd`。

## 请求类型

* GET 获取资源，GET 方法用来请求访问指定的资源。指定的资源经服务器端解析后返回响应内容。也就是说，如果请求的资源是文本，那就保持原样返回；
* POST 发送数据给服务器，例如表单或者 XMLHttpRequest 请求。
* PUT 使用请求中的负载创建或者替换目标资源。PUT 与 POST 方法的区别在于，PUT方法是幂等的：调用一次与连续调用多次是等价的（即没有副作用），而连续调用多次POST方法可能会有副作用，比如将一个订单重复提交多次。
* HEAD 获得响应首部，HEAD 方法和 GET 方法一样，只是不返回报文主体部分。用于确认 URI 的有效性及资源更新的日期时间等。
* DELETE 用来删除资源，是与 PUT 相反的方法。DELETE 方法按请求 URI 删除指定的资源。
* OPTIONS 询问支持的方法，OPTIONS 方法用来查询针对请求 URI 指定的资源支持的方法。
* TRACE 追踪路径，TRACE 方法是让 Web 服务器端将之前的请求通信环回给客户端的方法。
* CONNECT 要求用隧道协议连接代理，CONNECT 方法要求在与代理服务器通信时建立隧道，实现用隧道协议进行 TCP 通信。主要使用 SSL（Secure Sockets Layer，安全套接层）和 TLS（Transport Layer Security，传输层安全）协议把通信内容加密后经网络隧道传输。

## 状态码

* 1xx 请求已经被接受，还需继续处理
    * 100 Continue 目前为止一切正常, 客户端应该继续请求
    * 101 Switching Protocol 服务器应客户端升级协议的请求（Upgrade headers）正在切换协议
    * 103 Early Hints 一般和 Link header 一起使用，来允许用户在服务器还在准备响应数据的时候预加载一些资源。
* 2xx 请求已成功被服务器接收理解
    * 200 Ok 请求已经成功
    * 201 Created 创建了新的资源
    * 202 Accepted 如果服务器在接受请求后，需要进行一个异步处理才能有结果，并且觉得不需要让 TCP 连接保持到结果出来再返回，它可以返回 202 Accepted，意思是请求已接受，但没有立即可返回的结果。
    * 204 No Content 在并没有新文档的情况下，浏览器继续显示先前的文档
    * 205 Reset Content 用来通知客户端重置页面，比如清空表单内容、重置 canvas 状态或者刷新用户界面
    * 206 Partial Content 断点续传和多线程下载都是通过 206 Partial Content 实现的。请求的 header 必须包含一个 Range 字段，表明自己请求第几个字节到第几个字节的内容。如果服务器支持的话，就返回 206 Partial Content，然后使用 header 的 Content-Range 指明范围，并在 body 内提供这个范围内的数据。
* 3xx 重定向（这类状态码代表需要客户端采取进一步的操作才能完成请求。通常，这些状态码用来重定向，后续的请求地址（重定向目标）在本次响应的 Location 域中指明。）
    * 301 Moved Permanently 永久性重定向。目标由 header 的 Location 字段给出，同时 body 中也应该有指向目标的链接。新请求使用的方法应该和原请求的一致。如果用户使用 HEAD 和 GET 以外的方式发起原请求，客户端在遇到 301 Moved Permanently 后应当询问用户是否对新的 URI 发起新请求。
    * 302 Found 这应该是浏览器实现最不符合标准的一个状态码了。理论上，除了临时性这一点，302 Found 跟 301 Moved Permanently 应该是完全一样的。然而实质上，很多浏览器在遇到 302 Found 后就会使用 GET 去请求新的 URI，而无论原请求使用的是何种方法。由于这种现象的普遍存在，使得这成为了一个与书面标准相违背的事实标准，新的客户端在实现时很难选择应该遵守哪一个标准，所以 RFC 2616 专门新增了 303 See Other 和 307 Temporary Redirect 两个状态码来消除二义性。
    * 303 See Other 临时性重定向，且总是使用 GET 请求新的 URI。
    * 304 Not Modified 如果客户端发起了一个「条件 GET」，同时资源确实没被修改过，那么服务器端就应该返回 304 Not Modified，同时 body 不包含任何内容。所谓的「条件 GET」，是指 GET 的 header 带上了 If-Modified-Since 或 If-None-Match 字段。这两个 header 就是「条件」，如果条件符合了 GET 就应该正常执行，否则就应该返回 304 Not Modified，以便告诉客户端它想要请求的资源在上一次请求之后没有被更新过，客户端可以继续使用之前的版本。
    * 307 Temporary Redirect 临时性重定向，且总是使用原请求的方法来进行新请求。
* 4xx 客户端错误
    * 400 Bad Request 语法无效，服务器无法理解该请求
    * 401 Unauthorized 缺少身份验证凭证
    * 403 Forbidden 拒绝授权访问，和服务器资源相关
    * 404 Not Found 请求的资源不存在
    * 405 Method Not Allowed 禁止使用当前方法请求
    * 407 Proxy Authentication Required 缺少位于代理服务器要求的身份验证凭证
    * 408 Request Timeout 请求时间过长，空闲连接将被关闭
    * 409 Conflict 表示请求与服务器目标资源的当前状态相冲突
    * 410 Gone 请求资源在原服务器上永久性丢失
    * 411 Length Required 缺少确定的 Content-Length 请求头
    * 412 Precondition Failed（先决条件失败）表示客户端错误，意味着对于目标资源的访问请求被拒绝。这通常发生于采用除 GET 和 HEAD 之外的方法进行条件请求时，由首部字段 If-Unmodified-Since 或 If-None-Match 规定的先决条件不成立的情况下。这时候，请求的操作——通常是上传或修改文件——无法执行，从而返回该错误状态码。
    * 413 Payload Too Large 请求 body 过大
    * 414 URI Too Long URI过长
    * 415 Unsupported Media Type 请求所带的附件的格式类型服务器不知道如何处理
    * 416 Range Not Satisfiable 错误状态码意味着服务器无法处理所请求的数据区间。最常见的情况是所请求的数据区间不在文件范围之内，也就是说，Range 首部的值，虽然从语法上来说是没问题的，但是从语义上来说却没有意义。
    * 422 Unprocessable Entity 服务器无法理解请求体
    * 426 Upgrade Required 表示服务器拒绝处理客户端使用当前协议发送的请求，但是可以接受其使用升级后的协议发送的请求
    * 429 Too Many Requests 表示在一定的时间内用户发送了太多的请求
    * 431 Request Header Fields Too Large 表示由于请求头字段的值过大
* 5xx 服务器错误
    * 500 Internal Server Error 
    * 501 Not Implemented 服务器错误响应码表示请求的方法不被服务器支持
    * 502 Bad Gateway 
    * 503 Service Unavailable 服务器由于在维护或已经超载而无法响应
    * 504 Gateway Timeout 表示扮演网关或者代理的服务器无法在规定的时间内获得想要的响应。
    * 505 HTTP Version Not Supported 表示服务器不支持请求所使用的 HTTP 版本。


