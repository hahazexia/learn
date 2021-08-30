# block 和 inline

## block

div p table h1 h2 h3 h4 h5 h6 ol ul li dl dd form hr

article header footer section

## inline

span img a b i strong label

video audio canvas

## inline-block

button input select textarea

## block 元素和 inline 元素区别

1. 默认情况下，行内元素不会以新的一行开始，而块级元素会新起一行
2. 块级元素可以设置 width/height 属性，注意：块级元素即使设置了宽度，仍然是独占一行的。而行内元素设置 width/height 无效。（除了某些可替换元素，例如 img）
3. 行内元素的 padding/margin 水平方向有效，垂直方向无效（对元素自己来说垂直方向能设置成功，，但是对其他元素的布局不产生影响）。块元素没这个限制。
4. 块级元素可以包含行内元素和块级元素。行内元素不能包含块级元素
5. img 并不是 inline-block 元素，它默认是 inline 元素。它可以设置宽高的原因是因为它是特殊的替换元素。