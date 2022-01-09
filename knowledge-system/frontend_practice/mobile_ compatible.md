# 移动端兼容问题

## ios

1. ios 下系统自带输入法在输入框输入的时候，不能只监听 input 事件处理输入内容，还需要监听 `onCompositionStart` 和 `onCompositionEnd` 事件，它们的含义是监听输入法软件开始输入和结束输入，在 onCompositionStart 时设置一个 flag 为 true，onCompositionEnd 时 flag 为 false，这样在 input 里只有 flag 为 false 的时候再作处理，否则使用输入法的时候会将一些原本的字母带入最终输入结果中而产生 bug。

## android

1. 安卓系统下的 chrome 浏览器在打开新标签页的时候会出现一个透明的类似玻璃效果的层从小到大的动画，任意打开新标签页的操作都会出现这个动画，包括 a 链接 `target=“_blank”` 和 `window.open()`，这个动画效果是浏览器自带的，通过代码无法控制，所以不想有这个动画，只能改成改变当前页面的地址。

## IE

1. IE 11 下定位元素默认 left 不会是 0，需要你显式地直接设置 `left: 0`，否则位置会错乱。
