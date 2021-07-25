# data

组件的 data 为什么必须设置成一个函数？而根组件却没有这个限制？

```html
<!DOCTYPE html>
<html>
<body>
    <div id="demo">
        <comp></comp>
        <comp></comp>
    </div>
    <script src="./vue.js"></script>
    <script>
        Vue.component('comp', {
            template:'<div @click="counter++">{{counter}}</div>',
            data: {counter: 0}
        })
        const app = new Vue({
            el: '#demo',
        });
    </script>
</body>
</html>
```

上面的例子运行后会报错：

```js
vue.js:634 [Vue warn]: The "data" option should be a function that returns a per-instance value in component definitions.
```

Vue 组件可能存在多个实例，如果使用对象形式定义 data，则会导致它们共用一个 data 对象，那么状态变更将会影响所有组件实例，这是不合理的；采用函数形式定义，在 initData 时会将其作为工厂函数返回全新 data 对象，有效规避多实例之间状态污染问题。而在Vue 根实例创建过程中则不存在该限制，也是因为根实例只能有一个，不需要担心这种情况。