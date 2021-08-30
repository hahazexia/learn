# src 和 href

* src 属性用于替换元素，也就是说这个元素会被 src 指向的资源替换掉；href 用于在引用的文档和外部资源之间建立联系。

* link a 标签使用 href。video audio script img iframe embed 标签使用 src。

* 浏览器遇到 script 的时候，会暂停页面的解析，先根据 src 去下载这个资源，下载完成后用资源将元素替换，然后再继续解析页面。注意，script 标签的行为会受到 defer async 还有 type="module" 的影响。

* link 的 href 引用 css 文件的时候就不会阻塞页面的解析。