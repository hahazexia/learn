# webview 加载优化

## h5 页面的体验问题

从用户角度，相比原生页面，h5 页面的体验问题主要有两点：

1. 页面打开时间慢：打开一个 h5 页面需要做一系列处理，会有一段白屏时间，体验糟糕。
2. 响应流畅度较差：由于 WebKit 的渲染机制，单线程，历史包袱等原因，页面刷新/交互的性能体验不如原生。

所以就需要解决白屏时间

## webview 打开页面

* 页面渲染之前耗时主要在两部分：初始化 Webview 和 数据请求（html, css, js）。在这两步完成之前用户看到的都是白屏
* [First Paint](https://www.w3.org/TR/2017/WD-paint-timing-20170907/#sec-terminology) 是浏览器在导航之后首次渲染的时间，它不包括默认的背景渲染，但是包含了非默认的背景渲染。可以理解为这个时间就是白屏结束的时间点。
* [First Contentful Paint](https://www.w3.org/TR/2017/WD-paint-timing-20170907/#sec-terminology) 浏览器首次渲染任意 文本，图片，或者非白色的 canvas 和 svg 的时间点。这个时间点是用户首次可以开始看到页面的内容。
* 优化的方面包括：
    * 降低请求量：合并资源，减少 HTTP 请求数，minify/gzip 压缩，webP 图片格式，lazyLoad。
    * 加快请求速度：预解析 DNS，减少域名数，并行加载，CDN 分发。
    * 缓存：HTTP 协议缓存请求，离线缓存 manifest，离线数据缓存 localStorage。
    * 渲染：JS/CSS优化，加载顺序，服务端渲染。

## 优化方案

trick 方案（不建议）

1. 预初始化 Webview。首次初始化 Webview，需要初始化浏览器内核，需要的时间在 400ms 这个量级；二次初始化时间在几十ms 这个量级。根据此特征，选择在 APP 启动后 X 秒，预创建(初始化)一个 Webview 然后释放，这样等使用到 h5 模块，再加载 Webview 时，加载时间也少了不少。
2. 预创建 Webview 并加载首页 h5，驻留在内存中，需要的时候，立刻显示

离线包方案（建议）

1. 将每个独立的 h5 功能模块，相关 HTML、Javascript、CSS 等页面内静态资源打包到一个压缩包内，客户端可以下载该离线包到本地，然后打开 Webview，直接从本地加载离线包，从而最大程度地摆脱网络环境对 h5 页面的影响。
    * 后端使用构建工具把同一个业务模块相关的页面和资源打包成一个文件，同时对文件加密/签名。
    * 客户端根据配置表，在自定义时机去把离线包拉下来，做解压/解密/校验等工作。
    * 根据配置表，打开某个业务时转接到打开离线包的入口页面。
    * 拦截网络请求，对于离线包已经有的文件，直接读取离线包数据返回，否则走 HTTP 协议缓存逻辑。
    * 离线包更新时，根据版本号后台下发两个版本间的 diff 数据，客户端合并，增量更新。