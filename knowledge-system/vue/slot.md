# slot

## 普通插槽

```html
<body>
  <div id="app">
    <test>
      <p>slot content</p>
    </test>
  </div>
  </div>
</body>
<script src="./vue.js"></script>
<script>
  new Vue({
    name: "App",
    el: '#app',
    components: {
      test: {
        template: "<div><slot></slot></div>"
      }
    }
  })
</script>
```

1. 在 Vue.prototype._render 里打断点，查看父组件生成的 render 函数和用 render 函数生成的 vnode。

```js
    (function anonymous() {
        with (this) {
            return _c('div', {
                attrs: {
                    "id": "app"
                }
            }, [_c('test', [_c('p', [_v("slot content")])])], 1)
        }
    })
```

生成的 vnode 是这样的：

```js
    {
        tag: 'div',
        children: [
            {
                tag: 'vue-component-1-test',
                componentOptions: {
                    Ctor: f(),
                    tag: "test",
                    children: [
                        {
                            tag: 'p',
                            children: [
                                {
                                    text: "slot content"
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
```

2. 接下来父组件会走 $mount 流程，将 _render 生成的 vnode 传递给 _update 然后走 patch 流程。patch 流程中 发现 vue-component-1-test 是一个组件，于是调用它的 componentOptions 中的子类构造函数 Ctor 对子组件进行实例化。子组件实例化会调用 _init 去初始化组件，其中会走到 initInternalComponent 方法。

```js
  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }
```

其中 opts._renderChildren = vnodeComponentOptions.children; 将子组件的占位符 vnode 的 componentOptions 属性中的 children 设置到子组件对象 vm.$options._renderChildren 上。

```js
// vm.$options._renderChildren
[
    {
        tag: 'p',
        children: [
            {
                text: "slot content"
            }
        ]
    }
]
```

3. 子组件初始化接下来走到 initRender 方法，会将刚才的 vm.$options._renderChildren 加入到子组件 vm.$slots 中的 default 属性中，因为它是普通插槽，没有起名字，所以 default。default 属性是一个数组。

```js
//vm.$slots

{
    default: [
        {
            tag: 'p',
            children: [
                {
                    text: "slot content"
                }
            ]
        }
    ]
}
```

4. 然后子组件实例化结束，开始走 $mount 流程，先根据 render 方法生成子组件的 vnode，然后再去 patch。

下面是子组件的 render 方法：

```js
(function anonymous() {
    with (this) {
        return _c('div', [_t("default")], 2)
    }
})
```

可以看到插槽的 vnode 是用 _t 函数生成的，_t 是 renderSlot 函数。renderSlot 拿到 $slots.default 返回，也就是插槽对应的节点。

于是 render 函数就变成下面这样：

```js
(function anonymous() {
    with (this) {
        return _c('div', [{
            tag: 'p',
            children: [
                {
                    text: "slot content"
                }
            ]
        }], 2)
    }
})
```

可以看到插槽对应的 vnode 已经插入到了 render 函数中 _c 的第二个参数中，等到之后调用 _createElement 作为 children 传入，然后去生成 vnode。之后的流程就是生成 vnode 和 patch 了，和 slot 无关了。
