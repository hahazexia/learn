# fetch

## 语法

```js
Promise<Response> fetch(input[, init]);
```

* input 请求的 url，或者一个 Request 对象
* init 一个对象，包含所有请求设置
    * method: 请求使用的方法，如 GET、POST
    * headers: 请求头
    * body: 请求的 body，POST 请求使用
    * mode: 请求的模式，如 cors、 no-cors 或者 same-origin。
    * credentials: 请求的 credentials，如 omit、same-origin 或者 include。为了在当前域名内自动发送 cookie ， 必须提供这个选项
    * cache:  请求的 cache 模式。 default、 no-store、 reload 、 no-cache 、 force-cache 或者 only-if-cached
    * redirect: 可用的 redirect 模式。 follow (默认值，自动重定向), error (如果产生重定向将自动终止并且抛出一个错误）, 或者 manual (手动处理重定向)
    * referrer: 可以是 no-referrer、client或一个 URL。默认是 client。
    * referrerPolicy: 指定了 HTTP 头部 referer 字段的值。可能为以下值之一： no-referrer、 no-referrer-when-downgrade、 origin、 origin-when-cross-origin、 unsafe-url 


```js
// get 请求一张图片
var myImage = document.querySelector('img');

var myHeaders = new Headers();
myHeaders.append('Content-Type', 'image/jpeg');

var myInit = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default' };

var myRequest = new Request('flowers.jpg');

fetch(myRequest,myInit).then(function(response) {
  ...
});

// post 请求
fetch('/api/user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'zzz',
    age: '11',
  })
})
```

