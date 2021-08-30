# 书写模式

书写模式会影响文本在元素中的排列方向，最常用的主要有 3 个 css 属性。

先解释一下[概念](https://drafts.csswg.org/css-writing-modes-4/)：

* block flow direction（块流方向）：块级盒子（block-level boxes）堆叠的方向，或者行盒（line boxes）在块容器中堆叠的方向。
* inline base direction（内联基础方向）：一行中的内容的主要方向，还定义了哪一端是行的开始和结束。direction 和 unicode-bidi 属性规定了一个盒子的 inline base direction，还规定了任意文本内容的继承来的方向，决定了一行中的内联级别内容的顺序。
* horizontal writing mode（水平书写模式）：文本是水平的行。例如，向下的块流或者向上的块流。
* vertical writing mode（垂直书写模式）：文本是垂直的行。例如，向左或向右的块流。
* typographic mode （排版印刷模式）：决定是否使用排版印刷时的惯例来指定对垂直脚本使用垂直流（vertical typographic mode 垂直排版印刷模式）或者排版印刷惯例的水平书写模式（horizontal typographic mode 水平排版印刷模式）。这个概念使垂直排版有别于旋转的水平排版。

## writing-mode

|   值   |  含义  |
|  ----  | ----  |
|  horizontal-tb  |  从上到下的块流方向。（Top-to-bottom block flow direction） 书写模式（writing mode）和排版模式（typographic mode）都是水平的。  |
|  vertical-rl  |  从右到左的块流方向。（Right-to-left block flow direction）书写模式（writing mode）和排版模式（typographic mode）都是垂直的。  |
|  vertical-lr  |  从左到右的块流方向。（Left-to-right block flow direction）书写模式（writing mode）和排版模式（typographic mode）都是垂直的。  |
|  sideways-rl |  从右到左的块流方向。（Left-to-right block flow direction） 书写模式（writing mode）是垂直的，排版模式（typographic mode）是水平的。 |
|  sideways-lr |  从右到左的块流方向。（Left-to-right block flow direction） 书写模式（writing mode）是垂直的，排版模式（typographic mode）是水平的。 |


## direction

|   值   |  含义  |
|  ----  | ----  |
|  ltr  |  设置 inline base direction（内联基础方向）为从行左至行右  |
|  rtl  |  设置 inline base direction（内联基础方向）为从行右至行左  |

## text-orientation

指定文本在一行中的方向。目前的值只会对垂直的排版模式有影响，对水平排版模式没有影响。

|   值   |  含义  |
|  ----  | ----  |
|  mixed  |  默认值。顺时针旋转水平书写的字符90°，将垂直书写的文字自然布局。  |
|  upright  |  将水平书写的字符自然布局（直排），包括垂直书写的文字。注意这个关键字会导致所有字符被视为从左到右，也就是 direction 被强制设为 ltr。  |
|  sideways  |  所有字符被布局为与水平方式一样，但是整行文本被顺时针旋转90°。  |