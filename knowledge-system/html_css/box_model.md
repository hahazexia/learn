# 盒模型

## 定义

* 每个元素都可以被视为是一个盒模型，它由 4 部分组成：content（width height），padding（内边距），border（边框），margin（外边距）。

* 其中 content padding border 这三个合起来是 css 中 background 属性作用的区域，也就是说对元素设置 background 的样式后，作用区域在这三者中。

* 一个盒子的实际占用页面的大小是 content + padding + border

## box-sizing

box-sizing 用来定义 user-agent 如何计算一个元素盒模型的大小。

|  属性值  |  含义  |
|   ----   |   ----   |
|   content-box   |   默认值。 width 与 height 只包括内容的宽和高   |
|   border-box   |    width 和 height 属性包括内容，内边距和边框，不包括外边距。   |

## 外边距折叠

不同的元素盒子之间上下 margin 有时候会合并为单个 margin，大小为其中的最大值。有三种情况会发生外边距折叠：

1. 相邻元素的上下 margin

```html
<style>
    * {
      margin: 0;
    }
    div p:nth-child(1) {
      margin-bottom: 13px;
    }
    div p:nth-child(2) {
      margin-top: 87px;
    }
</style>
<div>
    <p>下边界范围会...</p>
    <p>...会跟这个元素的上边界范围重叠。</p>
</div>
```

2. 没有内容将父元素和后代元素分开

```js
<style type="text/css">
    * {
      margin: 0;
    }
    section    {
        margin-top: 13px;
        margin-bottom: 87px;
    }

    header {
        margin-top: 87px;
    }

    footer {
        margin-bottom: 13px;
    }
</style>

<section>
    <header>上边界重叠 87</header>
    <main></main>
    <footer>下边界重叠 87 不能再高了</footer>
</section>
```

可以看到父元素 section 的 margin-top 和 其后代元素 header 的 margin-top 发生了重叠，并且 header 的 margin-top 溢出到了 section 外面，同样，后代元素 footer 的 margin-bottom 也溢出到了 section 的下面。

有几个方法可以解决这个问题： 为父元素 section 设置 边框 border，内边距 padding，行内内容，或创建块级格式上下文或清除浮动。

3. 空的块级元素

```js
<style>
    * {
      margin: 0;
    }
    div {
      margin-top: 13px;
      margin-bottom: 87px;
    }
</style>
    
<p>上边界范围是 87 ...</p>
<div></div>
<p>... 上边界范围是 87</p>
```

解决办法：为这个没有内容的元素设置 边框 border、内边距 padding、高度 height、最小高度 min-height 、最大高度 max-height 、内容设定为 inline 或是加上 clear-fix