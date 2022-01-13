# 找到滚动元素

```js
function findScroll(element) {
  element.onscroll = function() {
    console.log(element);
  }
  Array.from(element.children).forEach(findScroll);
}
findScroll(document.body);
```
