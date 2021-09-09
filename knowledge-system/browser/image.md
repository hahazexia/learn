# Image

Image() 函数将会创建一个新的 HTMLImageElement 实例。它的功能等价于 document.createElement('img')

```js
Image(width, height)
```

width 和 height 参数用来指定宽高的像素值。

```js
function loadImg(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = function () {
            resolve(img);
        }
        img.onerror = function (err) {
            reject(err);
        }
    });
}

loadImg(url).then((res) => {
    document.body.appendChild(res);
}).catch(err => {
    console.log(err)
});
```