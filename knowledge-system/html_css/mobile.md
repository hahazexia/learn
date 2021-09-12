# 移动端适配

## 基础知识

* 英寸。我们一般用英寸（inch）这个物理单位来描述屏幕的物理大小，这个尺寸指的是屏幕对角线的长度。英寸和厘米的换算单位是：1英寸 = 2.54厘米。

* 分辨率通常分为显示分辨率和图片分辨率。
    * 显示分辨率（屏幕分辨率）是指显示器所能显示的像素有多少
    * 图片分辨率则是单位英寸内所包含的像素点数。
        * ppi（像素每英寸）和 dpi（点每英寸）是我们最常用的用来描述分辨率的两种单位；从技术角度说，“像素”只存在于电脑显示领域，而“点”只出现于打印或印刷领域。

* 像素，是一个拥有位置和颜色属性的小方块。电脑屏幕就是由像素组成的。
    * 物理像素。物理像素等同于设备像素（dp:device pixel），顾名思义，显示屏是由一个个物理像素点组成的，通过控制每个像素点的颜色使屏幕显示出不同的图像，屏幕上面的物理像素点是固定不变的，单位pt。其中，我们通常说的显示器分辨率，其实是指操作系统设定的分辨率，而不是显示器的物理分辨率。
    * 设备独立像素（dip）。iPhone3，它的分辨率是 320x480，iPhone4 的分辨率是 640*960，正好是 iPhone3 的两倍。然而 iPhone4 和 iPhone3 的尺寸是一样的，都是3.5英寸。在 iPhone4 使用的视网膜屏幕中，把 2x2 个像素当 1 个像素使用，这样让屏幕看起来更精致，但是元素的大小却不会改变。我们必须用一种单位来同时告诉不同分辨率的手机，它们在界面上显示元素的大小是多少，这个单位就是设备独立像素(Device Independent Pixels)简称 DIP 或DP。如果列表的宽度为 300 个像素，实际上我们可以说：列表的宽度为 300 个设备独立像素。打开 chrome 的开发者工具，我们可以模拟各个手机型号的显示情况，每种型号上面会显示一个尺寸，比如 iPhone X显示的尺寸是 375x812，实际 iPhone X的分辨率会比这高很多，这里显示的就是设备独立像素 DIP。
    * 设备像素比（dpr）。设备像素比 device pixel ratio 简称 dpr，即物理像素和设备独立像素的比值。浏览器为我们提供了window.devicePixelRatio 来帮助我们获取 dpr。 在 css 中，可以使用媒体查询 min-device-pixel-ratio，区分 dpr：
    ```css
        @media (-webkit-min-device-pixel-ratio: 2),(min-device-pixel-ratio: 2){ }
    ```
    * css 像素（px）。在 CSS 规范中，长度单位可以分为两类，绝对(absolute)单位以及相对(relative)单位。px 是一个相对单位，相对的是设备像素(device pixel)。我们可以得到一个公式：dpr = dp / dips。物理像素 和 设备独立像素 的比值就是 设备像素比。
        * 其中设备独立像素这样计算 dips = css像素 / scale（缩放比例）
        * 所以，那么在没有缩放的情况下，1 个 css 像素等同于一个设备独立像素。

* 视口（Viewport）。用户网页的可视范围（指页面能够被浏览的范围）
    * 如果把移动设备上浏览器的可视区域设为 viewport 的话，某些网站就会因为 viewport 太窄而显示错乱，所以这些浏览器就决定默认情况下把viewport 设为一个较宽的值，比如 980px，这样的话即使是那些为桌面设计的网站也能在移动浏览器上正常显示了。ppk 把这个浏览器默认的 viewport 叫做 layout viewport(布局视口)。layout viewport 的宽度可以通过 document.documentElement.clientWidth 来获取。
    * layout viewport 的宽度是大于浏览器可视区域的宽度的，所以我们还需要一个 viewport 来代表浏览器可视区域的大小，ppk 把这个 viewport 叫做 visual viewport(视觉视口)。visual viewport 的宽度可以通过 window.innerWidth 来获取。
    * 浏览器觉得还不够，因为现在 网站都会为移动设备进行单独的设计，所以必须还要有一个能完美适配移动设备的 viewport。ppk 把这个 viewport 叫做 ideal viewport(理想视口)。ideal viewport 可通过 window.screen.width 获取。ideal viewport 并没有一个固定的尺寸，不同的设备拥有有不同的 ideal viewport。
    * 只要在 css 中把某一元素的宽度设为 ideal viewport的宽度(单位用px)，那么这个元素的宽度就是设备屏幕的宽度了，也就是宽度为 100% 的效果。ideal viewport 的意义在于，无论在何种分辨率的屏幕下，那些针对 ideal viewport 而设计的网站，不需要用户手动缩放，也不需要出现横向滚动条，都可以完美的呈现给用户。

* meta 元素可以通过设置其 name 为 viewport，然后对其 content 设置不同的指令，从而可以达到控制 viewport 的目的。
    ```html
    <meta name="viewport" content="name=value,name=value">
    ```
    * width，设置 layout viewport 的宽度，为一个正整数，或关键词 device-width
    * initial-scale，设置页面的初始缩放值，为一个大于 0 的小数
    * minimum-scale，允许用户的最小缩放值，为一个大于 0 的小数
    * maximum-scale，允许用户的最大缩放值，为一个大于 0 的小数
    * height，设置 layout viewport 的高度，有这个属性，但是好像并没有人支持
    * user-scalable，是否允许用户进行缩放，值为 yes 或 no

    * layout viewport 可以设置成为 ideal viewport，通过设置 width=device-width 这组指令就可以了（但要注意的是，在 iphone 和 ipad 上，无论是竖屏还是横屏，device-width 都是竖屏时 ideal viewport的宽度。）。initial-scale=1 同样也可以把当前的 layout viewport 变为 ideal viewport。因为 initial-scale=1 缩放是相对于 ideal viewport 来进行缩放的，当对 ideal viewport 进行 100% 的缩放，也就是缩放值为 1 的时候，不就得到了 ideal viewport。

    * 但如果 width 和 initial-scale=1 同时出现，并且还出现了冲突呢？比如`<meta name="viewport" content="width=400, initial-scale=1">`。layout viewport 的宽度值会取 width 指定的宽度值和 ideal viewport 宽度值经过(initial-scale指定的值的倍数)缩放后的宽度值的最大值。例如，当width=400， initial-scale=0.5 时，此时 layout viewport 会取 640px（因为 320 / 0.5 > 400、320 / 0.5 = 640）作为它的宽度值。

    * visual viewport宽度 = ideal viewport宽度 / 当前缩放值
    * 当前缩放值 = ideal viewport宽度 / visual viewport宽度

    * 安卓设备上 initial-scale 没有默认值。而在 iphone 和 ipad 上，无论你给 viewport 设的宽的是多少，如果没有指定默认的缩放值，则 iphone 和 ipad 会自动计算这个缩放值，以达到当前页面不会出现横向滚动条(或者说viewport的宽度就是屏幕的宽度)的目的。

    * 视口总结。
        * 首先如果不设置 meta viewport 标签，那么移动设备上浏览器默认的宽度值为 800px，980px，1024px 等这些，总之是大于屏幕宽度的。这里的宽度所用的单位 px 都是指 css 中的 px，它跟代表实际屏幕物理像素的 px 不是一回事。
        * 每个移动设备浏览器中都有一个理想的宽度，这个理想的宽度是指 css 中的宽度，跟设备的物理宽度没有关系，在 css 中，这个宽度就相当于100% 所代表的那个宽度。我们可以用 meta 标签把 viewport 的宽度设为那个理想的宽度，如果不知道这个设备的理想宽度是多少，那么用device-width 这个特殊值就行了，同时 initial-scale=1 也有把 viewport 的宽度设为理想宽度的作用。所以，我们可以使用 `<meta name="viewport" content="width=device-width, initial-scale=1">` 来得到一个理想的 viewport（也就是前面说的ideal viewport）。

* 自己总结

`<meta name="viewport" content="width=device-width, initial-scale=1">`

meta 标签设置 viewport 宽度等于设备宽度，这个设置是很重要的。如果不设置，页面将使用布局视口（layout viewport），默认宽度 980 px，那么页面中的元素将变得非常小，看不清楚。设置了 width=device-width 后，页面会将布局视口（layout viewport）的默认文档宽度设置为理想视口（ideal viewport）的宽度，即使用设备独立像素的页面宽度进行布局。

而 visual viewport宽度 = ideal viewport宽度 / 当前缩放值。如果在 viewport 的设置中同时出现了 width=device-width 和initial-scale=xx ，则 layout viewport 会在 device-width 和 visual viewport 的宽度值中取一个最大值作为其宽度值。

例子：如果手机是高清屏幕，其实际物理像素为 750x1134 ，dpr 为 2，则 css 像素为 375x667。设置 width=device-width 后，视口宽度将为 375，再设置 initial-scale=0.5 后，通过计算 visual viewport 宽度等于 375 / 0.5 = 750。则最终视口宽度为 750。实现了物理像素和 css 像素 1:1。


## 适配方案

### flexible

<details>
<summary>完整 flexible 代码</summary>

```js
;(function(win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var dpr = 0;
    var scale = 0;
    var tid;
    var flexible = lib.flexible || (lib.flexible = {});
    
    if (metaEl) {
        console.warn('将根据已有的meta标签来设置缩放比例');
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if (match) {
            scale = parseFloat(match[1]);
            dpr = parseInt(1 / scale);
        }
    } else if (flexibleEl) {
        var content = flexibleEl.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = parseFloat(initialDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));    
            }
            if (maximumDpr) {
                dpr = parseFloat(maximumDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));    
            }
        }
    }

    if (!dpr && !scale) {
        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;
        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案
            dpr = 1;
        }
        scale = 1 / dpr;
    }

    docEl.setAttribute('data-dpr', dpr);
    if (!metaEl) {
        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    function refreshRem(){
        var width = docEl.getBoundingClientRect().width;
        if (width / dpr > 540) {
            width = 540 * dpr;
        }
        var rem = width / 10;
        docEl.style.fontSize = rem + 'px';
        flexible.rem = win.rem = rem;
    }

    win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 300);
    }, false);
    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }
    }, false);

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }
    

    refreshRem();

    flexible.dpr = win.dpr = dpr;
    flexible.refreshRem = refreshRem;
    flexible.rem2px = function(d) {
        var val = parseFloat(d) * this.rem;
        if (typeof d === 'string' && d.match(/rem$/)) {
            val += 'px';
        }
        return val;
    }
    flexible.px2rem = function(d) {
        var val = parseFloat(d) / this.rem;
        if (typeof d === 'string' && d.match(/px$/)) {
            val += 'rem';
        }
        return val;
    }

})(window, window['lib'] || (window['lib'] = {}));
```
</details>
<br><br>


1. 如果不设置 viewport 的 width=device-width，默认 layout viewport（document.documentElement.clientWidth） 和 visual viewport（window.innerWidth） 宽度为 980px。
2. 设置 width=device-width 后，layout viewport（document.documentElement.clientWidth） 和 visual viewport（window.innerWidth）宽度都变成和 ideal-viewport 一样了。
3. 在 dpr（物理像素 与 CSS像素 比值） 大于 1 的设备上，css 里设置 1px 的边框，会实际使用 2px 的物理像素（因为我们设置了 width=device-width，使视口宽度和理想视口一样。所以举个例子， 750 的物理像素宽度变成了 375，这时候 css 中的 1px 实际使用了 2px 的物理像素 ）。这时候根据 dpr（物理像素 与 CSS像素 比值） 作缩放，visual viewport宽度 = ideal viewport宽度 / 当前缩放值。对 dpr 为 2 的设备，就将其 initial-scale 设置为 0.5，则可以计算出 visual viewport宽度 =  ideal viewport宽度 * 2。也就是说 375 * 2 = 750。于是 layout viewport（document.documentElement.clientWidth） 和 visual viewport（window.innerWidth）宽度都乘 2 从 ideal-viewport 的 375 变成了 750，从而实现了 1物理像素 = 1css像素。
4. 使用 rem 模拟 vw 特性适配多种屏幕尺寸。rem 是相对于 html 元素的 font-size 来做计算的计算属性值。通过设置 documentElement 的 fontSize 属性值就可以统一整个页面的布局标准。Flexible 将整个页面的宽度切成了 10 份，然后将计算出来的页面宽度的 1/10 设置为 html 节点的 fontSize。

### vw vh 方案

* vw(Viewport's width)：1vw 等于视觉视口的 1%
* vh(Viewport's height) :1vh 为视觉视口高度的 1%
* vmin : vw 和 vh 中的较小值
* vmax : 选取 vw 和 vh 中的最大值

如果视觉视口为 375px，那么 1vw = 3.75px，这时 UI 给定一个元素的宽为 75px（设备独立像素），我们只需要将它设置为 75 / 3.75 = 20vw。

可以使用 PostCSS 的 postcss-px-to-viewport 插件来计算。

## 1px 问题

而在设备像素比大于 1 的屏幕上，我们写的 1px 实际上是被多个物理像素渲染，这就会出现 1px 在有些屏幕上看起来很粗的现象。

1. 媒体查询利用设备像素比缩放，设置小数像素；

优点：简单，好理解

缺点：兼容性差，目前之余 IOS8+ 才支持，在 IOS7 及其以下、安卓系统都是显示 0px。

```css
.border { border: 1px solid #999 }

@media screen and (-webkit-min-device-pixel-ratio: 2) {
    .border { border: 0.5px solid #999 }
}
@media screen and (-webkit-min-device-pixel-ratio: 3) {
    .border { border: 0.333333px solid #999 }
}
```

2. border-image

缺点：需要制作图片，圆角可能出现模糊

border-width：指定边框的宽度，可以设定四个值，分别为上右下左 border-width: top right bottom left;

border-image：该例意为：距离图片上方 2px（属性值上没有单位）裁剪边框图片作为上边框，下方 2px 裁剪作为下边框。距离左右 0 像素裁剪图片即没有边框，以拉伸方式展示。


```css
.border-image-1px {
    border-width: 1px 0px;
    -webkit-border-image: url("border.png") 2 0 stretch;
    border-image: url("border.png") 2 0 stretch;
}
```

3. background-image

缺点：需要制作图片，圆角可能出现模糊

```css
.border_1px{
        @media only screen and (-webkit-min-device-pixel-ratio:2){
            .border_1px{
                background: url(../img/1pxline.png) repeat-x left bottom;
                background-size: 100% 1px;
            }
        }
```

4. box-shadow

优点是没有圆角问题，缺点是颜色不好控制

```css
div {
    -webkit-box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.5);
}
```

box-shadow 属性的用法：`box-shadow: h-shadow v-shadow [blur] [spread] [color] [inset]`

参数分别表示: 水平阴影位置，垂直阴影位置，模糊距离， 阴影尺寸，阴影颜色，将外部阴影改为内部阴影，后四个可选；

该例中为何将阴影尺寸设置为负数。设置成 -1px 是为了让阴影尺寸稍小于 div 元素尺寸，这样左右两边的阴影就不会暴露出来，实现只有底部一边有阴影的效果。从而实现分割线效果（单边边框）。

5. viewport + rem

通过设置缩放，让 CSS 像素等于真正的物理像素。例如：当设备像素比为 3 时，我们将页面缩放 1/3 倍，这时 1px 等于一个真正的屏幕像素。

6. 伪类 + transform

这种方式可以满足各种场景，如果需要满足圆角，只需要给伪类也加上 border-radius 即可

```css
.border_1px:before{
    content: '';
    position: absolute;
    top: 0;
    height: 1px;
    width: 100%;
    background-color: #000;
    transform-origin: 50% 0%;
}
@media only screen and (-webkit-min-device-pixel-ratio:2){
    .border_1px:before{
        transform: scaleY(0.5);
    }
}
@media only screen and (-webkit-min-device-pixel-ratio:3){
    .border_1px:before{
        transform: scaleY(0.33);
    }
}

```

```scss
border-1px($color = #ccc, $radius = 2PX, $direction = all)
  position: relative
  &::after
    content: ""
    pointer-events: none
    display: block
    position: absolute
    border-radius: $radius
    box-sizing border-box
    width 100%
    height 100%
    left: 0
    top: 0
    transform-origin: 0 0
    if $direction == all
      border: 1PX solid $color
    else
      border-{$direction}: 1PX solid $color
    @media only screen and (-webkit-min-device-pixel-ratio:2)
      width: 200%
      height: 200%
      border-radius: $radius * 2
      transform: scale(.5)
    @media only screen and (-webkit-min-device-pixel-ratio:3)
      width: 300%
      height: 300%
      border-radius: $radius * 3
      transform: scale(.333)

```