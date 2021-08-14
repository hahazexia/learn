# 手写题

实现基础操作

* 实现 new
* 实现 instanceOf
* 实现 call apply bind
* 实现 Object.create
* 实现 Object.assign
* 实现 Array.prototype.flat
* 实现 String.prototype.trim
* 实现 map filter forEach find reduce some every
* 用 setTimeout 实现 setInterval
* 实现数组去重
* 类数组转数组
* 解析 url params 为对象

其他 js 题

* 实现 a == 1 && a == 2 && a == 3 的结果为 true
* 洗牌算法
* 判断字符串中的括号是否是合法闭合的括号

## 题目

#### 实现 new

<details>
<summary>答案</summary>

```js
function _new(constructor) {
    const args = [].slice.call(arguments, 1);
    const context = Object.create(constructor.prototype);
    const res = constructor.apply(context, args);
    return (typeof res === 'object' && res !== null) ? res : context;
}
```
</details>
<br><br>

