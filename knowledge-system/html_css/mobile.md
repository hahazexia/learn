# 移动端适配

## 基础知识

* 英寸。我们一般用英寸（inch）这个物理单位来描述屏幕的物理大小，这个尺寸指的是屏幕对角线的长度。英寸和厘米的换算单位是：1英寸 = 2.54厘米。

* 分辨率通常分为显示分辨率和图片分辨率。
    * 显示分辨率（屏幕分辨率）是指显示器所能显示的像素有多少
    * 图片分辨率则是单位英寸内所包含的像素点数。
        * ppi（像素每英寸）和 dpi（点每英寸）是我们最常用的用来描述分辨率的两种单位；从技术角度说，“像素”只存在于电脑显示领域，而“点”只出现于打印或印刷领域。

* 像素，是一个拥有位置和颜色属性的小方块。电脑屏幕就是由像素组成的。
    * 物理像素。物理像素等同于设备像素（dp:device pixel），顾名思义，显示屏是由一个个物理像素点组成的，通过控制每个像素点的颜色使屏幕显示出不同的图像，屏幕上面的物理像素点是固定不变的，单位pt。其中，我们通常说的显示器分辨率，其实是指操作系统设定的分辨率，而不是显示器的物理分辨率。
    * 设备独立像素（dip）。iPhone3，它的分辨率是 320x480，它的分辨率是 640*960，正好是 iPhone3 的两倍。然而 iPhone4 和 iPhone3 的尺寸是一样的，都是3.5英寸。在 iPhone4 使用的视网膜屏幕中，把 2x2 个像素当 1 个像素使用，这样让屏幕看起来更精致，但是元素的大小却不会改变。我们必须用一种单位来同时告诉不同分辨率的手机，它们在界面上显示元素的大小是多少，这个单位就是设备独立像素(Device Independent Pixels)简称 DIP 或DP。如果列表的宽度为 300 个像素，实际上我们可以说：列表的宽度为 300 个设备独立像素。打开 chrome 的开发者工具，我们可以模拟各个手机型号的显示情况，每种型号上面会显示一个尺寸，比如 iPhone X显示的尺寸是 375x812，实际 iPhone X的分辨率会比这高很多，这里显示的就是设备独立像素 DIP。
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

## 适配方案

### flexible

flexible 核心代码非常简单

```js
function setRemUnit () {
    var rem = document.documentElement.clientWidth / 10
    document.documentElement.style.fontSize = rem + 'px'
}
setRemUnit();

```

