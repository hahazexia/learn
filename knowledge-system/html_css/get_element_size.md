# 获取元素尺寸

## offsetHeight offsetWidth

```js
element.offsetWidth
element.offsetHeight
```
* 只读属性，返回一个元素的布局宽度和布局高度。
* 默认返回 width/height + padding + border，如果是 border-box 返回 width/height
* 如果有滚动条，会包含滚动条的宽度或高度。（在 chrome 92 版本下测试，滚动条的宽度或高度被自动加入到元素的宽高中）

## clientWidth clientHeight


```js
element.clientWidth
element.clientHeight
```

* 只读属性，返回元素内部宽度和高度
* 返回 width/height + padding，不包含 border，不包含滚动条
* 如果是 border-box，会用 width/height - border - 滚动条

## scrollWidth scrollHeight

```js
element.scrollWidth
element.scrollHeight
```

* 当元素存在滚动条时，scrollWidth 和 scrollHeight 能获取到元素不使用滚动条时其所有内容的宽高，包含 width/height + padding，不包含 border，不包含滚动条。和 clientWidth clientHeight 计算方式相同
* 滚动条不需要滚动的时候，也就是没有因为滚动条而隐藏的内容时，scrollWidth scrollHeight 等于 clientWidth clientHeight

## scrollTop scrollLeft

* 获取和设置含有滚动条的元素的垂直或者水平滚动距离

## getBoundingClientRect

```js
element.getBoundingClientRect()
```

* getBoundingClientRect 返回的 width/height 和 offsetHeight offsetWidth 一样
* 除了返回 width/height，还返回了 left, top, right, bottom, x, y，这些值基于视口左上角计算。注意这里返回的 right 和 bottom 是元素右边和下边和视口 left 和 top 的距离，和给元素设置的那四个定位属性含义不一样。