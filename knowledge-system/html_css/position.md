# position

## 定位元素

不设置 position 时，元素默认处于正常流中，和 position 的 static 值的效果一样，此时 top right bottom left z-index 等属性无效。

如果 position 设置了 static 以外的值，那么元素就变为定位元素，分为以下几种：

* 定位元素（positioned element）是其计算后位置属性为 relative, absolute, fixed 或 sticky 的一个元素（换句话说，除 static 以外的任何值）。
* 相对定位元素（relatively positioned element）是计算后位置属性为 relative 的元素。
* 绝对定位元素（absolutely positioned element）是计算后位置属性为 absolute 或 fixed 的元素。
* 粘性定位元素（stickily positioned element）是计算后位置属性为 sticky 的元素。

## position 取值

|   值   |  描述  |
|  ----  | ----  |
|  static  |  元素使用正常流  |
|  relative  |  相对定位。元素先放在正常流的位置，然后再相对于自己正常流的位置根据 top right bottom left 的值发生偏移，并为原来正常流的位置留下占位的空间，也就是说相对定位元素偏移后不会影响其他元素的位置，其他元素的所在位置就好像这个相对定位元素的位置没有发生改变一样  |
|  absolute  |  绝对定位。元素会脱离流（Out of Flow），不会为它原来正常流的位置留占位空间。相对于它的最近的非 static 定位祖先元素确定位置，偏移由 top right bottom left 的值来决定  |
|  fixed  |  固定定位。元素会脱离流（Out of Flow），不会为它原来正常流的位置留占位空间。相对于屏幕视口（viewport）的位置来指定元素位置，偏移由 top right bottom left 的值来决定。元素的位置在屏幕滚动时不会改变。  |
|  sticky  |  粘性定位。和 relative 一样会为元素原来正常流的位置留下占位空间，偏移后不会影响其他元素的位置。区别是，它的偏移不是相对于自己，而是相对于最近的拥有滚动机制（例如设置了 overflow 属性出现了滚动条）的滚动容器祖先的滚动视口。  |

## 规范中对于 sticky 的讲解

规范文档 [CSS Positioned Layout Module Level 3](https://drafts.csswg.org/css-position-3/#stickypos-insets) 的 3.4. Sticky positioning 章节的原文这样描述：

* Sticky positioning is similar to relative positioning except the offsets are automatically calculated in reference to the nearest scrollport.

sticky 定位类似于 relative 定位，除了它的偏移是参考最近的滚动视口进行自动计算出的结果。

* For a sticky positioned box, the inset properties represent insets from the respective edges of the nearest scrollport, defining the sticky view rectangle used to constrain the box’s position. (For this purpose an auto value represents a zero inset.) If this results in a sticky view rectangle size in any axis less than the size of the border box of the sticky box in that axis, then the effective end-edge inset in the affected axis is reduced (possibly becoming negative) to bring the sticky view rectangle’s size up to the size of the border box in that axis.

对于一个 sticky 定位的盒子，inset 属性（也就是 top right bottom left 的 另外一种速记写法，具体查看 [MDN 讲解](https://developer.mozilla.org/en-US/docs/Web/CSS/inset)）代表了距离各自最近的滚动视口边缘的 insets 值，并定义了粘性视图矩形（sticky view rectangle）用来限制盒子的位置。（因为这个目的，如果值是 auto ，那就代表 inset 值为 0）
