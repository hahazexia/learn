# @rule

CSS 的顶层样式表由两种规则组成的规则列表构成，一种被称为 at-rule，也就是 at 规则，另一种是 qualified rule，也就是普通规则。

## @charset

@charset 用于提示 CSS 文件使用的字符编码方式，它如果被使用，必须出现在最前面。这个规则只在给出语法解析阶段前使用，并不影响页面上的展示效果。

```css
@charset "utf-8";
```

## @import

@import 用于引入一个 CSS 文件，除了 @charset 规则不会被引入，@import 可以引入另一个文件的全部内容。

```css
@import "mystyle.css";
@import url("mystyle.css");
```

## @media

基于一个或多个媒体查询的结果来应用样式表的一部分。

```css
@media all and (min-width: 1280px) {
    /* 宽度大于1280干嘛干嘛嘞... */ 
}
@media (-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 2dppx) { 
    /* Retina屏幕干嘛干嘛嘞... */ 
}
@media print {
    /* 闪开闪开，我要打印啦！ */ 
}
@media \0screen\,screen\9 {
    /* IE7,IE8干嘛干嘛嘞... */ 
}
@media screen\9 {
    /* IE7干嘛干嘛嘞... */ 
}
```

## @keyframes

用来声明 CSS3 animation 动画关键帧

```css
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
```

## @fontface

fontface 用于定义一种字体，icon font 技术就是利用这个特性来实现的。

```css

@font-face {
  font-family: Gentium;
  src: url(http://example.com/fonts/Gentium.woff);
}

p { font-family: Gentium, serif; }
```

## 其他

* @support support 检查环境的特性，它与 media 比较类似。
* @namespace 用于跟 XML 命名空间配合的一个规则，表示内部的 CSS 选择器全都带上特定命名空间。
* @viewport 用于设置视口的一些特性，不过兼容性目前不是很好，多数时候被 HTML 的 meta 代替。

