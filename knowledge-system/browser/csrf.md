# csrf

csrf （Cross-site request forgery 跨域请求伪造）发生的时候，黑客并不知道 cookie 的具体内容，只是使用了用户浏览器上的 cookie 去请求目标网站，因此，主要有两种方式来预防：

* 阻止其他域的请求
    + 检测请求的来源网站是否同源
    + Samesite Cookie
* 发请求需要携带只有在本域下才能获取到的参数
    + csrf token
    + 双重 cookie 验证

## 检测请求的来源网站是否同源

每个请求都会携带 Origin 和 Referrer 请求头代表了请求的来源域名。这两个请求头是浏览器自动加上的，前端不能控制。

如果 Origin 存在，那么直接使用 Origin 中的字段确认来源域名就可以。但是有两种情况 Origin 不存中：
* IE 11 不会在跨站 CORS 请求上添加 Origin 头
* 在 302 重定向之后 Origin 不包含在重定向的请求

Referrer 也用来记录请求的来源页面地址。对于 Ajax 请求，图片和 script 等资源请求，Referrer 为发起请求的页面地址。对于页面跳转，Referrer 为打开页面历史记录的前一个页面地址。那么也可以通过 Referrer 来判断请求的来源域名是否同源。但是 [Referrer Policy](https://www.w3.org/TR/referrer-policy/) 允许开发者控制 Referrer 如何发送。有如下几种设置 Referrer 的方式：

* Referrer-Policy 请求头
* 页面里设置 referrer 的 meta 标签 例如：`<meta name="referrer" content="no-referrer">`
* html 元素设置 referrerpolicy 属性 例如：`<a href="http://example.com" referrerpolicy="origin">`

因此可以发现黑客可以通过设置 Referrer 政策隐藏请求的 Referrer 。

另外在以下情况下 Referrer 没有或者不可信：

1. IE6、7 下使用 window.location.href = url 进行界面的跳转，会丢失 Referer。
2. IE6、7 下使用 window.open，也会缺失 Referer。
3. HTTPS 页面跳转到 HTTP 页面，所有浏览器 Referer 都丢失。
4. 点击 Flash 上到达另外一个网站的时候，Referer 的情况就比较杂乱，不太可信。

## Samesite

Set-Cookie 响应头的 Samesite 属性使得 cookie 只能作为第一方 Cookie，不能作为第三方 Cookie。

* Strict 最为严格。如果 SameSite 的值是 Strict，那么浏览器会完全禁止第三方 Cookie。
* Lax 相对宽松一点。在跨站点的情况下，从第三方站点的链接打开和从第三方站点提交 Get 方式的表单这两种方式都会携带 Cookie。但如果在第三方站点中使用 Post 方法，或者通过 img、iframe 等标签加载的 URL，这些场景都不会携带 Cookie。
* 而如果使用 None 的话，在任何情况下都会发送 Cookie 数据。

如果设置为 Strict 则可以防止绝对多数 csrf 攻击，但是体验不好。例如用户从百度搜索页面甚至天猫页面的链接点击进入淘宝后，淘宝不会是登录状态，因为淘宝的服务器不会接受到那个 Cookie，其它网站发起的对淘宝的任意请求都不会带上那个 Cookie。

如果 Samesite 被设置为 Lax，那么其他网站通过页面跳转过来的时候可以使用 Cookie，可以保障外域连接打开页面时用户的登录状态。但相应的，其安全性也比较低。

## csrf token

所有的用户请求都携带一个 csrf 攻击者无法获取到的 Token。服务器通过校验请求是否携带正确的 Token，来把正常的请求和攻击的请求区分开，也可以防范 csrf 的攻击。

1. 将 csrf Token 输出到页面中。首先，用户打开页面的时候，服务器需要给这个用户生成一个 Token，该 Token 通过加密算法对数据进行加密，一般 Token 都包括随机字符串和时间戳的组合，显然在提交时 Token 不能再放在 Cookie 中了，否则又会被攻击者冒用。因此，为了安全起见 Token 最好还是存在服务器的 Session 中，之后在每次页面加载时，使用 JS 遍历整个 DOM树，对于 DOM 中所有的 a 和 form 标签后加入 Token。这样可以解决大部分的请求，但是对于在页面加载之后动态生成的 HTML 代码，这种方法就没有作用，还需要程序员在编码时手动添加 Token。

2. 页面提交的请求携带这个 Token。a 链接就在链接后面加上 ?csrfToken=xxx ，form 表单请求就添加隐藏域参数加上 csrftoken 参数。

3. 服务器验证 Token 是否正确。将请求传递的 Token 和 Session 中的 Token 比较。如果匹配，返回响应，如果不匹配，响应终止。

## 双重 Cookie

* 在用户访问网站页面时，向请求域名注入一个 Cookie，内容为随机字符串（例如csrfcookie=v8g9e4ksfhw）。
* 在前端向后端发起请求时，取出 Cookie，并添加到 URL 的参数中（接上例 POST https://www.a.com/comment?csrfcookie=v8g9e4ksfhw）。
* 后端接口验证 Cookie 中的字段与 URL 参数中的字段是否一致，不一致则拒绝。
