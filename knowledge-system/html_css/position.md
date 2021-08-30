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


## inset 值同时设置的策略

inset 是 top right bottom left 的简写形式。

* 当 relative 定位时，不论是否设置了元素的 width，left/right 同时设置，如果父级 direction 是 ltr，则 left 生效；如果 rtl，则 right 生效。
* absolute 定位时，如果设置了元素的 width，left/right 同时设置，如果父级 direction 是 ltr，则 left 生效；如果 rtl，则 right 生效。如果没有设置元素 width ，left/right 同时设置都生效，元素的 width 会被扩展以适应。如果设置元素的 height，top/bottom 同时设置，top 生效 bottom 被忽略。如果没设置元素 height，top/bottom 同时设置都生效。


## 规范中对于 sticky 的讲解

规范文档 [CSS Positioned Layout Module Level 3](https://drafts.csswg.org/css-position-3/#stickypos-insets) 的 3.4. Sticky positioning 章节的原文这样描述：

* Sticky positioning is similar to relative positioning except the offsets are automatically calculated in reference to the nearest scrollport.

sticky 定位类似于 relative 定位，除了它的偏移是参考最近的滚动视口进行自动计算出的结果。

* For a sticky positioned box, the inset properties represent insets from the respective edges of the nearest scrollport, defining the sticky view rectangle used to constrain the box’s position. (For this purpose an auto value represents a zero inset.) If this results in a sticky view rectangle size in any axis less than the size of the border box of the sticky box in that axis, then the effective end-edge inset in the affected axis is reduced (possibly becoming negative) to bring the sticky view rectangle’s size up to the size of the border box in that axis.

对于一个 sticky 定位的盒子，inset 属性（也就是 top right bottom left 的 另外一种速记写法，具体查看 [MDN 讲解](https://developer.mozilla.org/en-US/docs/Web/CSS/inset)）代表了距离各自最近的滚动视口边缘的 insets 值，并定义了粘性视图矩形（sticky view rectangle）用来限制盒子的位置。（基于这个目的，如果值是 auto ，那就代表 inset 值为 0）如果任意一个坐标轴的粘性视图矩形的大小在此坐标轴中比 sticky 盒子的 border box 要小，那么在这个被影响的坐标轴中生效的 end-edge inset 就会被减少（可能变成负值），这是为了让粘性视图矩形的大小能够包含 border box 的大小。

* For example, if the nearest scrollport is 300px tall, the sticky box’s border box is 200px tall, and it has top: 20px, then the top-edge inset of the nearest scrollport is 20px, and the bottom-edge inset is 0px, yielding a sticky view rectangle that is 280px tall.
But if the nearest scrollport were only 100px tall, then the effective bottom-edge inset becomes -120px, resulting in a sticky view rectangle that’s 200px tall, enough to fully contain the margin box of the sticky box.

一个例子，如果最近的滚动视口是 300px 高，sticky 盒子的 border box 是 200px 高，它设置了 top:20px，那么最近的滚动视口的 top-edge inset 就是 20px，那么 bottom-edge inset 就是 0，这样产生的粘性视图矩形就是 280px 高。

但是如果最近的滚动视口只有 100px 高，然后能够生效的 bottom-edge inset 就变成 -120px，这样粘性视图矩形就是 200px 高，足以包含 sticky 盒子的 margin 盒子。

* For each side of the box, if the corresponding inset property is not auto, and the corresponding border edge of the box would be outside the corresponding edge of the sticky view rectangle, then the box must be visually shifted (as for relative positioning) to be inward of that sticky view rectangle edge, insofar as it can while its position box remains contained within its containing block. The position box is its margin box, except that for any side for which the distance between its margin edge and the corresponding edge of its containing block is less than its corresponding margin, that distance is used in place of that margin.

对于盒子的每一边，如果相应的 inset 属性值不是 auto，并且盒子的相应的 border 边缘会在相应的粘性视图矩形的边缘之外，那么盒子必须在视觉上被移动（例如绝对定位）为了在粘性视图矩形边缘的内部，只要它的 position box 保持被包含在它的包含块中就可以。position box 就是它的 margin box，不同的是对于任意一边，它的 margin edge 和对应的它的包含块的边缘的距离比它对应的 margin 要小，那个距离被用来替代这个 margin。

* Note: A sticky positioned element with a non-auto top value and an auto bottom value will only ever be pushed down by sticky positioning; it will never be offset upwards.

如果 top 不是 auto ，但 bottom 是 auto，那么 position:sticky 元素只会向下偏移(相对其初始位置)，永远不会向上偏移 。

* Note: Multiple sticky positioned boxes in the same container are offset independently, and therefore might overlap.

同一个容器中的多个粘性定位盒子是独立偏移的，因此可能会重叠。

* 3.4.1. Scroll Position of Sticky-Positioned Boxes
For the purposes of any operation targetting the scroll position of a sticky positioned element (or one of its descendants), the sticky positioned element must be considered to be positioned at its initial (non-offsetted) position.

对于以粘性定位元素（或其后代之一）的滚动位置为目标的任何操作，粘性定位元素必须被视为位于其初始（非偏移）位置。

## 对 sticky 的理解

粘性定位的元素是依赖于用户的滚动，在 position:relative 与 position:fixed 定位之间切换。它的行为就像 position:relative; 而当页面滚动超出目标区域时，它的表现就像 position:fixed;，它会固定在目标位置。元素定位表现为在跨越特定阈值前为相对定位，之后为固定定位。这个特定阈值指的是 top, right, bottom 或 left 之一，换言之，指定 top, right, bottom 或 left 四个阈值其中之一，才可使粘性定位生效。否则其行为与相对定位相同。

## 如何查找最近的滚动祖先

一般而言只要往父级查找，遇到的第一个 overflow 不是 visible 的元素就是最近滚动祖先(scrollport)。找不到时，viewport 就是最近滚动祖先。

[css-overflow-3](https://www.w3.org/TR/css-overflow-3/#overflow-propagation) 的 3.5. Overflow Viewport Propagation 中有这样一句：If visible is applied to the viewport, it must be interpreted as auto. 

如果 overflow:visible 被应用于 viewport，那么要被解释为 overflow:auto。所以 viewport 始终是可以滚动的，它会作为最终的滚动祖先。