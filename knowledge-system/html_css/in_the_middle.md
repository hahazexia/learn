# 居中问题

## 宽高已知

1. absolute + margin auto

父元素与当前元素的高度要设置。通过将各个方向的距离都设置为 0，此时将 margin 设置为 auto，就可以实现垂直居中显示了；

2. absolute + 负 margin

利用绝对定位百分比 50% 来实现，因为当前元素的百分比是基于相对定位（也就是父元素）来定位的;

然后再用负的 margin-top 和 margin-left 来进行简单的位移即可，因为现在的负 margin 是基于自身的高度和宽度来进行位移的。

3. absolute + calc

使用 CSS3 的一个计算函数来进行计算即可；方法与上面类似

## 宽高未知

1. absolute + transform

利用 CSS3 的新特性 transform；因为 transform 的 translate 属性值如果是一个百分比，那么这个百分比将是基于自身的宽高计算出来的。

2. line-height + vertical-align

把当前元素设置为 inline-block，然后通过设置父元素的 text-align: center; 实现水平居中；同时通过设置当前元素的 vertical-align: middle; 来实现垂直居中；

最后设置当前元素的 line-height: initial; 来继承父元素的 line-height。

3. table 表格元素

通过最经典的 table 元素来进行水平垂直居中，不过代码看起来会很冗余，不推荐使用；

4. css-table 表格样式

如果一定要使用 table 的特性，但是不想写 table 元素的话，那么css-table 就很适合你；

5. flex

在 flex 容器设置 justify-content 和 align-items

6. flex + margin auto

7. grid 网格布局 (一)

8. grid 网格布局 (二)
