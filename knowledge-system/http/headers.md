# 头部

## 请求头

### cache

* If-Modified-Since

```js
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
```

把浏览器端缓存页面的最后修改时间发送到服务器去，服务器会把这个时间与服务器上实际文件的最后修改时间进行对比。如果时间一致，那么返回 304 （Not Modified 资源没有被修改过），客户端就直接使用本地缓存文件。如果时间不一致，就会返回 200 和新的文件内容。客户端接到之后，会丢弃旧文件，把新文件缓存起来，并显示在浏览器中.

* If-None-Match

```js
If-None-Match: "bfc13a64729c4290ef5b2c2730249c88ca92d82d"

If-None-Match: W/"67ab43", "54ed21", "7892dd"

If-None-Match: *
```

If-None-Match 和 ETag 一起工作，工作原理是在 HTTP Response 中添加 ETag 信息。 当用户再次请求该资源时，将在 HTTP Request 中加入If-None-Match 信息(ETag的值)。如果服务器验证资源的 ETag 没有改变（该资源没有更新），将返回一个 304 （Not Modified 资源没有被修改过）状态告诉客户端使用本地缓存文件。否则将返回 200 状态和新的资源和 Etag。使用这样的机制将提高网站的性能。

* Pragma

```js
Pragma: no-cache
```

防止页面被缓存， 在 HTTP/1.1 版本中，它和 Cache-Control: no-cache 作用一模一样。Pargma只有一个用法， 例如： Pragma: no-cache。注意: 在HTTP/1.0 版本中，只实现了 Pragema: no-cache, 没有实现 Cache-Control。

* Cache-Control

**cache-control 既是请求头也是响应头。**

前端无法通过 meta 标签的 http-equiv 属性设置 cache-control，因为根据 [whatwg html 规范](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives)可知，meta 标签的 http-equiv 属性只允许设置 content-language content-type  default-style  set-cookie  x-ua-compatible  content-security-policy 这些值。

```js
Cache-Control: max-age=<seconds>
Cache-Control: max-stale[=<seconds>]
Cache-Control: min-fresh=<seconds>
Cache-control: no-cache
Cache-control: no-store
Cache-control: no-transform
Cache-control: only-if-cached

Cache-control: must-revalidate
Cache-control: no-cache
Cache-control: no-store
Cache-control: no-transform
Cache-control: public
Cache-control: private
Cache-control: proxy-revalidate
Cache-Control: max-age=<seconds>
Cache-control: s-maxage=<seconds>

Cache-control: immutable
Cache-control: stale-while-revalidate=<seconds>
Cache-control: stale-if-error=<seconds>

Cache-Control: public, max-age=31536000
```

Cache-Control 就是报头字段名，public 和 max-age=31536000 是指令。Cache-Control 报头可以接受一个或多个指令。各个指令含义如下

+ public 和 private
    - public 意味着包括 CDN、代理服务器之类的任何缓存都可以存储响应的副本。
    - private 表示只有浏览器可以缓存文件。
+ no-cache 和 no-store
    - no-cache 在和服务器验证过并且服务器通知可以使用缓存的副本之前，不能使用缓存中的副本。
    - no-store 不使用任何缓存
+ max-age 和 s-maxage
    - max-age 设置缓存存储的最大周期，超过这个时间缓存被认为过期(单位秒)。与 Expires 相反，时间是相对于请求的时间。
    - s-maxage s-maxage 会覆盖 max-age 指令，只适用于 public 缓存。
    ```js
    Cache-Control: max-age=60
    ```
+ must-revalidate 和 proxy-revalidate
    - must-revalidate 配合 max-age 使用，一旦资源过期（超过max-age），必须向服务器重新验证。
    - proxy-revalidate 只适用于 public 缓存，被 private 缓存忽略。
    ```js
    Cache-Control: must-revalidate, max-age=600
    ```
+ immutable 告诉浏览器这个文件是永远都不可变的。例如 style.ae3f66.css 这个文件是唯一的，一旦文件修改就会得到新的文件，所以是不可变的。可以让浏览器知道它不必检查更新版本：永远不会有新的版本，因为一旦内容改变，它就不存在了。
    ```js
    Cache-Control: max-age=31536000, immutable
    ```
+ stale-while-revalidate 提供的是一个宽限期（由我们设定），当我们检查新版本时，允许浏览器在这段宽限期期间使用过期的（旧的）资源。
    ```js
    Cache-Control: max-age=31536000, stale-while-revalidate=86400
    // “这个文件还可以用一年，但一年过后，额外给你一天你可以继续使用旧资源，直到你在后台重新验证了它”。
    ```
+ stale-if-error 如果重新验证资源时返回了 500 之类的错误，stale-if-error 会给浏览器一个使用旧的响应的宽限期。
    ```js
    Cache-Control: max-age=2419200, stale-if-error=86400
    // 缓存的有效期为 28 天（2,419,200 秒），过后如果我们遇到内部错误就额外提供一天（86,400 秒），此间允许访问旧版本资源。
    ```
+ no-transform 告诉中间代理不得对该资源进行任何更改或转换
+ only-if-cached 表明客户端只接受已缓存的响应，并且不要向原始服务器检查是否有更新的拷贝

### client

* Accept 浏览器端可以接受的媒体类型，例如：Accept: text/html 代表浏览器可以接受服务器回发的类型为 text/html 也就是我们常说的html文档，如果服务器无法返回 text/html 类型的数据，服务器应该返回一个 406 错误(non acceptable)。通配符 * 代表任意类型。例如  Accept: */*  代表浏览器可以处理所有类型，一般浏览器发给服务器都是发这个。

* Accept-Encoding 浏览器告知能够理解的编码方法，通常指定压缩方法，是否支持压缩，支持什么压缩方法（gzip，deflate）。例如： Accept-Encoding: gzip, deflate

* Accept-Language 浏览器声明自己能够理解的语言。例如：Accept-Language: en-US

* Accept-Charset 浏览器声明自己可以处理的字符集。例如：Accept-Charset: utf-8

* User-Agent 告诉服务器自己的浏览器和操作系统版本。

### other

* Cookie 将 cookie 值发送给服务器
    ```js
    Cookie: PHPSESSID=298zf09hf012fh2; csrftoken=u32t4o3tb3gg43; _gat=1;
    ```
* Content-Length 发送给服务器的 body 的数据长度
* Content-Type 发送给服务器的数据的 MIME 类型
* Referer 包含了当前页面的来源页面的地址，即表示当前页面是通过此来源页面里的链接进入的。
* Connection 决定当前的事务完成后，是否会关闭网络连接。如果该值是“keep-alive”，网络连接就是持久的，不会关闭，使得对同一个服务器的请求可以继续在该连接上完成。
    ```js
    Connection: keep-alive
    Connection: close
    ```
* Host 请求将要发送到的服务器主机名和端口号

* If-Unmodified-Since 如果从某个时间点算起, 文件没有被修改。用途：断点续传(一般会指定Range参数). 要想断点续传, 那么文件就一定不能被修改, 否则就不是同一个文件。如果没有被修改: 则开始`继续'传送文件: 服务器返回: 200 。如果文件被修改: 则不传输, 服务器返回: 412 Precondition failed (预处理错误)

## 响应头

### cache

* Clear-Site-Data 清除当前请求网站的浏览器数据。
    ```js
    // 单个参数
    Clear-Site-Data: "cache"

    // 多个参数 (用逗号分隔)
    Clear-Site-Data: "cache", "cookies"

    // 通配
    Clear-Site-Data: "*"
    ```
    * Clear-Site-Data: "cache" 删除本URL原始响应的本地缓存数据
    * Clear-Site-Data: "cookies" 删除URL响应的所有cookie
    * Clear-Site-Data: "storage" 删除URL原响应的所有DOM存储。(localStorage, sessionStorage, IndexedDB 等)
    * Clear-Site-Data: "executionContexts" 表示服务端希望浏览器重新加载本请求(Location.reload)
    * Clear-Site-Data: "*" 删除所有类型数据

* Date 当前消息的日期和时间

* Expires 值是一个日期时间，在此时间之后，响应会过期

* Vary 缓存服务器会将某接口的首次请求结果缓存下来，后面在发生相同请求的时候缓存服务器会拿着缓存的Vary来进行判断。比如Vary: Accept-Encoding,User-Agent，那么Accept-Encoding与User-Agent两个请求头的内容，就会作为判断是否返回缓存数据的依据，当缓存服务器中相同请求的缓存数据的编码格式、代理服务与当前请求的编码格式、代理服务一致，那就返回缓存数据，否则就会从服务器重新获取新的数据。

* ETag 资源特定版本的标识符，和 If-None-Match 请求头一起工作。

* Last-Modified 服务器返回的资源做出修改的日期及时间。和 If-Modified-Since 或 If-Unmodified-Since 请求头一起工作。

### other

* Content-Length 服务器响应的数据长度
* Content-Type 响应数据类型和字符集
* Content-Encoding 服务器使用了什么压缩方法
* Content-Language 响应对象是什么语言提供的
* Server 服务器软件信息
* Location 指定需要将页面重新定向至的地址。3xx 的响应中会出现。
