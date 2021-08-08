# 值与单位

## 数字长度和百分比

### 数字

css 中的值使用数字的时候，分以下四种：

* 整数 integer 例如 10
* 数字 number 例如 10.5
* 尺寸 dimention 例如 10px
* 百分比 例如 50%

### 长度

绝对长度

|   单位   |  名称  |  等价换算  |
|  ----  | ----  | ----  |
|  cm  |  厘米   |  1cm = 96px/2.54   |
|  mm  |  毫米  |  1mm = 1/10th of 1cm  |
|  Q  |  四分之一毫米  |  1Q = 1/40th of 1cm  |
|  in  |  英寸  |  1in = 2.54cm = 96px  |
|  pc  |  十二点活字  |  1pc = 1/16th of 1in  |
|  pt  |  点  |  1pt = 1/72th of 1in  |
|  px  |  像素  |  1px = 1/96th of 1in  |

1in = 2.54cm = 25.4 mm = 101.6q = 72pt = 6pc = 96px

相对长度

|   单位   |  相对于  |
|  ----  | ----  |
|  em  |  在 font-size 中使用是相对于父元素的字体大小，在其他属性中使用是相对于自身的字体大小，如 width  |
|  ex  |  字符 x 的高度  |
|  ch  |  数字 0 的宽度  |
|  rem  |  根元素的字体大小  |
|  lh  |  元素的 line-height  |
|  vw  |  视窗宽度的1%  |
|  vh  |  视窗高度的1%  |
|  vmin  |  视窗较小尺寸的1%  |
|  vmax  |  视图大尺寸的1%  |

### 百分比

如果将元素的字体大小设置为百分比，那么它将是元素父元素字体大小的百分比。如果使用百分比作为宽度值，那么它将是父值宽度的百分比。

### calc()

calc() 此 CSS 函数允许在声明 CSS 属性值时执行一些计算。

```css
div {
    width: calc(100% - 80px);
}
```

## 颜色

* 颜色关键字
* transparent 关键字
* currentColor 关键字
* RGB RGBA 颜色
* HSL HSLA 颜色

### 颜色关键字

用英文单词表示的颜色，例如 white black。

### transparent 关键字

表示一个完全透明的颜色，即该颜色看上去将是背景色。从技术上说，它是带有 alpha 通道为最小值的黑色，是 rgba(0,0,0,0) 的简写。

补充：css 画三角形

```css
    div {
        border-top-color: #ffc107;
        border-right-color: #00bcd4;
        border-bottom-color: #e26b6b;
        border-left-color: #cc7cda;
        border-width: 50px;
        border-style: solid;
        width: 0px;
    }
```

这样画出来如下：

![正方形](../img/square.png)

```css
/*等腰三角形*/
div {
    border-left: 30px solid #cc7cda;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    width: 0px;
}
```

![等腰三角形](../img/triangle.png)

```css
div {
    border-left: 30px solid #cc7cda;
    border-bottom: 30px solid transparent;
    width: 0px;
}
```

![直角三角形](../img/triangle2.png)

### currentColor 关键字

取当前元素继承父级元素的文本颜色值或声明的文本颜色值，即 computed 后的 color 值。

```css
/*该元素的边框颜色会是 red*/
.btn {
    color: red;
    border: 1px solid currentColor;
}
```

### RGB RGBA 颜色

R(red)-G(green)-B(blue)-A(alpha) 组成的色彩空间。在 CSS 中，它有两种表示形式：

* 十六进制符号；

RGB 中的每种颜色的值范围是 00~ff，值越大表示颜色越深。所以一个颜色正常是 6 个十六进制字符加上 # 组成，比如红色就是 #ff0000。

2 个十六进制表示一个颜色，如果这 2 个字符相同，还可以缩减成只写 1 个，比如，红色 #f00

* 函数符；

当 RGB 用函数表示的时候，每个值的范围是 0~255 或者 0%~100%，所以红色是 rgb(255, 0, 0)， 或者 rgb(100%, 0, 0)。

如果需要使用函数来表示带不透明度的颜色值，值的范围是 0~1 及其之间的小数或者 0%~100%，比如带 67% 不透明度的红色是 rgba(255, 0, 0, 0.67) 或者 rgba(100%, 0%, 0%, 67%)

### HSL HSLA 颜色

由色相(hue)-饱和度(saturation)-亮度(lightness)-不透明度组成的颜色体系。

* 色相（H）是色彩的基本属性，值范围是 0 ~ 360 或者 0deg ~ 360deg， 0 (或 360) 为红色, 120 为绿色, 240 为蓝色；
* 饱和度（S）是指色彩的纯度，越高色彩越纯，低则逐渐变灰，取 0~100% 的数值；0% 为灰色， 100% 全色；
* 亮度（L），取 0~100%，0% 为暗，100% 为白；
* 不透明度（A），取 0~100%，或者 0~1 及之间的小数；


设置不透明度为 67% 的红色的 color 的写法：

```css
button {
    color: #ff0000aa;
    color: #f00a;
    color: rgba(255, 0, 0, 0.67);
    color: rgb(100% 0% 0% / 67%);
    color: hsla(0, 100%, 50%, 67%);
    color: hsl(0deg 100% 50% / 67%);
}

```

