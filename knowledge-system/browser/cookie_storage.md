# cookie 和 localStorage 和 sessionStorage

## cookie

cookie 有两种方式可以设置
* 服务器在给客户端响应的时候，可以设置 Set-Cookie 响应头，当响应到达浏览器时 cookie 就被自动存入浏览器中。之后每一次新请求浏览器都会将刚才存下的 cookie 数据加入到请求的 Cookie 请求头中发送给服务器。

```js
// 响应头
// Set-Cookie: <cookie名>=<cookie值>
// 请求头
// Cookie: yummy_cookie=choco; tasty_cookie=strawberry
```

* 另外一种是客户端自己设置，通过 document.cookie 可以获取和设置 cookie。

```js
// 获取所有 cookie
allCookies = document.cookie;

// 设置 cookie
document.cookie = newCookie;

// 用这个方法只能一次设置一个 cookie

document.cookie = "name=oeschger";
document.cookie = "favorite_food=tripe";
console.log(document.cookie);
// 显示: name=oeschger;favorite_food=tripe

// 利用正则获取某个 cookie
document.cookie = "test1=Hello";
document.cookie = "test2=World";
var myCookie = document.cookie.replace(/(?:(?:^|.*;\s*)test2\s*\=\s*([^;]*).*$)|^.*$/, "$1");

alert(myCookie); // World

// 正则分析
// /(?:(?:^|.*;\s*)test2\s*\=\s*([^;]*).*$)|^.*$/
// ?; 是非捕获分组
// (?:^|.*;\s*) 这里匹配开头什么字符都没有，或者是多个字符和一个分号（;）再加上零个或多个空格。这里匹配的是 test2 之前的其他 cookie
// test2\s*\=\s* 这里匹配 test2 对应 cookie 的名字和等于号
// ([^;]*) 这里匹配 test2 cookie 的值，是零个或多个 非分号 的字符串，是捕获分组，会被捕获到作为 $1
// .*$ 这里匹配 test2 cookie 之后的其他 cookie 值
// ^.*$ 如果捕获不到 test2 的值，那么就匹配到整个字符串（从开头到结尾）
// 匹配结束之后用捕获到的 test2 的值 $1 替换掉整个字符串。
```

下面是 mdn 提供的一个 cookie 的小框架

```js
/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
    // 获取某个 cookie
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    // 设置新 cookie
    // sKey 要创建或者覆盖的 cookie 的名字
    // sValue cookie 的值
    // vEnd cookie 的 Max-Age（有效期，单位秒） 或者 Expires（过期时间）
    // sPath 路径 如果没有定义，默认为当前文档位置的路径
    // sDomain 域名 如果没有定义，默认为当前文档位置的路径的域名部分
    // bSecure cookie 只通过 https 协议传输
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        // 如果没有传 cookie 名字或者 cookie 名字中有下面这些关键词，就返回 false
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        // 如果传递了 Max-Age 或者 Expires，就根据数据类型判断生成 ;expires=xxx 字符串 或 ;max-age=xxx 字符串
        if (vEnd) {
            switch (vEnd.constructor) {
                // 如果 vEnd 传入的是 Number, 则设置 max-age
                case Number:
                sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                break;
                // 如果是 String ，则设置 expires
                case String:
                sExpires = "; expires=" + vEnd;
                break;
                // 如果是 Date 对象，则设置 expires
                case Date:
                sExpires = "; expires=" + vEnd.toUTCString();
                break;
            }
        }
        // 给 document.cookie 赋值设置新的一条 cookie
        // 顺序  cookie名字=cookie值;expres=xxx;max-age=xxx;domain=xxx;path=xxx;secure
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    // 删除某个 cookie
    removeItem: function (sKey, sPath, sDomain) {
        // 如果没有这个 cookie ，返回 false
        if (!sKey || !this.hasItem(sKey)) { return false; }
        // 设置这个 cookie 的过期时间为 Unix 纪元时间 UTC 1970年1月1日0点，即立即过期。注意还要加上对应的 path 和 domain
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
        return true;
    },
    // 判断是否存在某个 cookie
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    // 获取所有 cookie 名字组成的数组
    keys: function () { /* optional method: you can safely remove it! */
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
};
```

### 设置 cookie 组成部分

设置一条 cookie 的时候，一条 cookie 的组成部分按顺序如下：

* cookie名字=cookie值 （cookie 的名字和值）
* ;expires=xxx;max-age=xxx （cookie 的过期时间或有效期。过期时间是字符串或者 Date 对象，有效期是数字，单位秒）
* ;domain=xxx （cookie 的域名。默认为当前文档位置的路径的域名部分）
* ;path=xxx （cookie 的路径。默认为当前文档位置的路径）
* ;secure （cookie 是否只通过 https 协议传输，这个没有值）

### cookie 生命周期

Max-Age（有效期，单位秒） 或者 Expires（过期时间）

* 会话期 Cookie，不设置 Max-Age 或者 Expires 时，浏览器关闭之后它会被自动删除，也就是说它仅在会话期内有效。 
* 持久性 Cookie，生命周期取决于过期时间（Expires）或有效期（Max-Age）指定的一段时间。

### cookie 安全

* 标记为 Secure 的 cookie 只应通过被 HTTPS 协议加密过的请求发送给服务端
* Document.cookie 无法访问带有 HttpOnly 属性的 cookie；此类 cookie 仅作用于服务器
* HttpOnly 和 Secure 都可以在后台设置 Set-Cookie 响应头的时候设置，在后面加上即可。

```js
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly
```

### cookie 作用域

* Domain 指定了哪些域名可以接受 Cookie。如果不指定，默认为 origin，不包含子域名。如果指定了 Domain，则一般包含子域名。
* Path 标识指定了域名下的哪些路径可以接受 Cookie
* SameSite Cookie 允许服务器要求某个 cookie 在跨站请求时不会被发送，从而可以阻止跨站请求伪造攻击（CSRF）。
    * SameSite=None 浏览器会在同站请求、跨站请求下继续发送 cookies，不区分大小写。
    * SameSite=Strict 浏览器将只在访问相同站点时发送 cookie。
    * SameSite=Lax 在跨站点的情况下，从第三方站点的链接打开和从第三方站点提交 Get 方式的表单这两种方式都会携带 Cookie。但如果在第三方站点中使用 Post 方法，或者通过 img、iframe 等标签加载的 URL，这些场景都不会携带 Cookie。
    ```js
    Set-Cookie: key=value; SameSite=Strict
    ```

## localStorage 和 sessionStorage

localStorage 和 sessionStorage 类似，都是存在当前域名下的一个 storage 对象。区别在于：存储在 localStorage 的数据可以长期保留；而当页面会话结束，也就是说，当页面被关闭时，存储在 sessionStorage 的数据会被清除。

localStorage 中的键值对总是以字符串的形式存储，意味着数值类型会自动转化为字符串类型。

```js
// sessionStorage 的语法和 localStorage 一样
localStorage.setItem('myCat', 'Tom'); // 设置
let cat = localStorage.getItem('myCat'); // 获取
localStorage.removeItem('myCat'); // 移除
localStorage.clear(); //移除所有

localStorage.key(0); // 获取第 n 个的键名 myCat
localStorage.length；// storage 中数据长度

// 也可以这样设置，它们是等价的
localStorage.colorSetting = '#a4509b';
localStorage['colorSetting'] = '#a4509b';
localStorage.setItem('colorSetting', '#a4509b');
```

### 响应 storage 变化

Storage 对象发生变化时（即创建/更新/删除数据项时，重复设置相同的键值不会触发该事件，Storage.clear() 方法至多触发一次该事件），StorageEvent 事件会触发。

事件在同一个域下的不同页面之间触发，即在 A 页面注册了 storge 的监听处理，只有在跟 A 同域名下的 B 页面操作 storage 对象，A 页面才会被触发storage 事件。

```js
window.addEventListener('storage', function(e) {
  document.querySelector('.my-key').textContent = e.key;
  document.querySelector('.my-old').textContent = e.oldValue;
  document.querySelector('.my-new').textContent = e.newValue;
  document.querySelector('.my-url').textContent = e.url;
  document.querySelector('.my-storage').textContent = e.storageArea;
});
```

下面是是 storage 事件触发后，回调的参数 e 的属性：

|   属性名   |  描述  |
|  ----  | ----  |
|  key  | 该属性代表被修改的键值。当被 clear() 方法清除之后该属性值为 null。（只读）  |
|  newValue  | 该属性代表修改后的新值。当被 clear() 方法清理后或者该键值对被移除，newValue 的值为 null 。（只读）  |
|  oldValue  | 该属性代表修改前的原值。在设置新键值对时由于没有原始值，该属性值为 null。（只读）  |
|  storageArea  | 被操作的 storage 对象。（只读）  |
|  url  | key 发生改变的对象所在文档的 URL 地址。（只读）  |

## 三者的异同

* 生命周期
    * cookie：可设置失效时间（Expires）和有效期（Max-Age），没有设置的话，默认关闭浏览器后失效
    * localStorage：除非被手动清除，否则将会永久保存
    * sessionStorage： 仅在当前网页会话下有效，关闭页面或浏览器后就会被清除

* 存放数据大小
    * cookie：4kb 左右
    * localStorage 和 sessionStorage：可以保存 5mb 的信息。

* http 请求
    * cookie：每次都会携带在 HTTP 头中，如果使用 cookie 保存过多数据会带来性能问题
    * localStorage 和 sessionStorage：仅在客户端（即浏览器）中保存，不参与和服务器的通信

* 易用性：
    * cookie：需要程序员自己封装，源生的 cookie 接口不友好
    * localStorage 和 sessionStorage：源生接口可以接受，亦可再次封装来对 Object 和 Array 有更好的支持

## 应用场景

* 从安全性来说，因为每次 http 请求都会携带 cookie 信息，这样无形中浪费了带宽，所以 cookie 应该尽可能少的使用，另外 cookie 还需要指定作用域，不可以跨域调用，限制比较多。但是用来识别用户登录来说，cookie 还是比 storage 更好用的。其他情况下，可以使用 storage，就用 storage。

* storage 在存储数据的大小上面秒杀了 cookie，现在基本上很少使用 cookie 了。

* localStorage 和 sessionStorage 唯一的差别一个是永久保存在浏览器里面，一个是关闭网页就清除了信息。localStorage 可以用来夸页面传递参数，sessionStorage 用来保存一些临时的数据，防止用户刷新页面之后丢失了一些参数。
