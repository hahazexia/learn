# csp

## 概念

csp 全称 Content-Security-Policy（内容安全策略）用来防止 xss 跨域脚本攻击，它允许站点管理者控制浏览器能够为指定的页面加载哪些资源，它的指令的值主要设置的是从指定域名加载资源。它有两种用法：

* 在 html 的 meta 标签中设置

```js
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src https://*; child-src 'none';">
```

* 服务器返回 Content-Security-Policy 响应头

一般情况都使用服务器返回响应头的形式来设置。

## 指令

Content-Security-Policy 有多个指令。下面列举一些常见的指令：

* font-src 设置允许通过 @font-face 加载的字体的源
* frame-src 设置允许通过类似 iframe 标签加载的内嵌内容的源
* img-src 加载图片的源
* script-src 加载 js 文件的源
* media-src 加载媒体文件（audio video 标签）的源
* style-src 加载 css 文件的源
* default-src 为其他指令设置默认的值，如果有指令没有设置则取 default-src 的值

指令的语法如下：

```js
Content-Security-Policy: style-src <source>;
Content-Security-Policy: style-src <source> <source>;
```

不同的指令后面的值都是相同的，都有如下几种值：

* `<host-source>`
* `<scheme-source>`
* 'self'
* 'unsafe-eval'
* 'unsafe-hashes'
* 'unsafe-inline'
* 'none'
* `'nonce-<base64-value>'`
* `'<hash-algorithm>-<base64-value>'`
* 'strict-dynamic'
* 'report-sample'

|   指令的值   |  描述  |
|  ----  | ----  |
|  `<host-source>`  |  域名。可以加上可选的协议和端口号。域名前面可以使用 * 表示未知的域名部分，最后面也可以使用 * 表示任意合法的端口号。  |
|  `<scheme-source>`  |  协议。例如 http: 或者 https: 。必须带上后面的冒号。也可以指定其他数据协议，例如 data:   mediastream:  blob:   filesystem:  |
|  'self'  |  只能加载和当前页面同域名的地址。协议和主机和端口号必须一样。使用这个值的时候必须带上单引号  |
|  'unsafe-eval'  |  允许使用 eval() 或者类似的方法从字符串创建代码。使用这个值的时候必须带上单引号  |
|  'unsafe-hashes'  |  允许开启指定的行内事件处理器。  |
|  'unsafe-inline'  |  允许使用行内的资源。例如 script 元素   javascript:;  行内事件处理器  行内 style 元素。使用这个值的时候必须带上单引号    |
|  'none'  |  不匹配任何 url  |
|  `'nonce-<base64-value>'`  | 使用加密随机数（使用一次的数字）的特定内联脚本组成的允许列表。服务器每次传输策略时都必须生成唯一的随机数值。提供不可猜测的随机数至关重要，否则绕过资源的策略是微不足道的。指定 nonce 会使现代浏览器忽略 'unsafe-inline'，但它仍然可以为没有 nonce 支持的旧浏览器设置。  |
|  `'<hash-algorithm>-<base64-value>'`  |  js 脚本或 css 样式的 sha256、sha384 或 sha512 哈希值。此源的使用由用破折号分隔的两部分组成：用于创建散列的加密算法和 js 脚本或 css 样式的 base64 编码散列。生成哈希时，不要包含 script 或 style 标签，并注意大小写和空格很重要，包括前导或尾随空格。在 CSP 2.0 中，这仅适用于内联脚本。CSP 3.0 允许在script-src外部脚本的情况下使用它。  |
|  'strict-dynamic'  |  strict-dynamic 允许将信任关系传递给动态生成的脚本，也就是说，strict-dynamic 允许js 动态添加的脚本执行，而忽略其他任何允许列表或源表达式。  |
|  'report-sample'  | 要求在违规报告中包含违规代码的样本。  |

## 使用

1. 先在项目中使用 Content-Security-Policy-Report-Only 而不是直接使用 Content-Security-Policy。因为 Content-Security-Policy-Report-Only 会将违反政策的情况发送 post 请求到指定 uri 上报。当出现违反策略的情况只会上报，不会阻塞资源加载。

```js
Content-Security-Policy: img-src www.qq.com; report-uri https://a.b.c/report
```

当设置这个 header 的页面加载 www.qq.com 之外的图片的时候，将会阻塞加载，并在控制台报错，再上报到 https://a.b.c/report。


因此页面改造第一步是先通过仅仅上报的头来观察一段时间，看看哪些资源哪些情况是不符合 CSP 的，漏掉的加上，不合理的干掉。

2. 观察一段时间后，自己的上报站点如果有 CSP 报错，那么去解决掉，然后继续观察一段时间重复同样的步骤，直到没有CSP 错误。当上报站点再也没有 CSP 错误或者错误比较少能接受范围内，将 Content-Security-Policy-Report-Only 换成 Content-Security-Policy 再次上线。
