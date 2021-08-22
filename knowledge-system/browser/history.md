# history

## 基础使用

```js
window.history.back(); // 向后跳转
window.history.forward(); // 向前跳转
window.history.go(-1); // 跳转到相对当前页面的位置，当前页面标志为 0
window.history.length // history 中记录页面的数量
```

## pushState replaceState window.onpopstate

* history.pushState(state, title[, url]) 创建一条新的历史记录
    * state 是一个 JavaScript 对象，它与 pushState() 创建的新历史记录条目相关联。当使用 pushState 添加新的历史记录后，然后再通过其他后退或者前进触发 popstate 事件，popstate 事件回调函数收到的参数 e 的 state 属性就对应了pushState 传的这个第一个参数
    * title 参数会被浏览器忽略，一般传空字符串。
    * url 新的历史记录的 url。pushState 调用后当前 url 会被变为这个参数

* history.replaceState(stateObj, title[, url]) 修改当前历史记录
    * stateObj 一个JavaScript对象，它与传递给 replaceState 方法的历史记录实体相关联
    * title 参数会被浏览器忽略，一般传空字符串。
    * url 当前历史记录的 url 被替换为此 url

* window.onpopstate
    * pushState replaceState 不会触发 popstate 事件，back forward go 会触发 popstate 事件