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

## 具名插槽和作用域插槽

```js
<body>
  <div id="app">
    <test>
      <template v-slot:test="slotData">
        <p>test content {{slotData.testData}}</p>
      </template>
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
        template: "<div><slot name='test' :testData='count' ></slot></div>",
        data () {
          return {
            count: 1
          }
        }
      }
    }
  })
</script>
```

1. 父组件 render 函数：

```js
(function anonymous() {
    with (this) {
        return _c('div', {
            attrs: {
                "id": "app"
            }
        }, [_c('test', {
            scopedSlots: _u([{
                key: "test",
                fn: function(slotData) {
                    return [_c('p', [_v("test content " + _s(slotData.testData))])]
                }
            }])
        })], 1)
    }
}
)

```

其中 _u 就是 resolveScopedSlots 方法，用于将子组件占位符 vnode 的 scopedSlots 参数转换成对象的形式。

```js
[
    {
        key: 'test',
        fn: function(slotData) {
            return [_c('p', [_v("test content " + _s(slotData.testData))])]
        }
    }
]

// 转换为
{
    test: function(slotData) {
        return [_c('p', [_v("test content " + _s(slotData.testData))])]
    }
    // 可能还有其他的具名插槽，或者 default 插槽
}
```

转换成对象形式后 scopedSlots 对象将作为子组件占位符 vnode 的 data 属性。

生成的 vnode：

```js
{
    tag: 'div',
    children: [
        {
            tag: "vue-component-1-test",
            componentOptions: {
                Ctor: f(),
                tag: "test"
            }，
            data：{
                scopedSlots: {
                    test: function(slotData) {
                        return [_c('p', [_v("test content " + _s(slotData.testData))])]
                    }
                }
            }
        }
    ]
}
```


3. 父组件走 $mount 流程时 patch 的时候会走子组件的初始化流程，然后子组件初始化。然后走到子组件的 $mount 流程。

在 updateComponent 调用 _render 时，调用子组件的 render 方法之前先会去调用 normalizeScopedSlots 将 _parentVnode （子组件占位符 vnode） 上的 data.scopedSlots 标准化，然后加入到子组件实例的 vm.$scopedSlots 上，以供之后 render 函数调用的时候使用。

这样处理之后子组件实例  vm.$scopedSlots 就变成了如下：

```js
{
    test:  function(slotData) {
        return [_c('p', [_v("test content " + _s(slotData.testData))])]
    }
}
```

然后调用子组件的 render 函数

```js
(function anonymous() {
    with (this) {
        return _c('div', [_t("test", null, {
            "testData": count
        })], 2)
    }
})

```

_t 是 renderSlot，它会去判断是否存在 `this.$scopedSlots[name]`，也就是这里对应的 this.$scopedSlots.test，如果没有就说明是普通插槽，如果有就说明是具名插槽或作用域插槽。注意 _t 也就是 renderSlot 传递的第三个参数，形参是 bindObject 也就是绑定的子组件的作用域，这里是 {testData: count}，也就是 {testData: 1}。将 bindObject 浅复制了一下生成一个新对象，然后传给 this.$scopedSlots.test 这个函数，然后将其调用结果返回。然后 _t 也就是 renderSlot 的作用就完成了。render 函数会变成下面的样子：

```js
(function anonymous() {
    with (this) {
        return _c('div', [_c('p', [_v("test content " + _s(1))])], 2)
    }
})
```

这样就把引用的子组件作用域的数据给替换进去了。

下面是 _render 生成的子组件的 vnode

```js
{
    tag: "div",
    children: [
        {
            tag: "p",
            children: [
                {
                    text: "test content 1"
                }
            ]
        }
    ]
}
```

之后的流程就是生成 patch 了，和 slot 无关了。

## 总结

1. 普通插槽
    1. render 方法生成的 vnode，子组件的占位符标签会有 componentOptions.children，children 的内容就是插槽的内容
    2. 子组件初始化的时候会将子组件的占位符 vnode 的 componentOptions 属性中的 children 设置到子组件对象 vm.$options._renderChildren 上
    3. 子组件初始化接下来走到 initRender 方法，会将刚才的 vm.$options._renderChildren 加入到子组件 vm.$slots 中的 default 属性中，因为它是普通插槽，没有起名字，所以 default。
    4. 然后子组件实例化结束，开始走 $mount 流程，先根据 render 方法生成子组件的 vnode，然后再去 patch。生成子组件 vnode 的时候会调用 _t 也就是 renderSlot 函数获取到 vm.$slots.default 返回
    5. 之后就是 patch 流程了
 
普通插槽简化解释：编译器解析 template 的生成的 render 函数在生成子组件占位符 vnode 的时候，将插槽内容生成为占位符 vnode 的 componentOptions.children，然后子组件初始化的时候会将占位符 vnode 的 componentOptions.children 的内容转移到 vm.$options._renderChildren 上，后续又转移到 vm.$slots.default 上。等到子组件真的去生成 vnode 的时候，从 vm.$slots.default 取出对应内容，然后生成 vnode，后续走 patch 流程

2. 具名插槽和作用域插槽

编译器解析 template 生成的 render 函数会为生成的子组件占位符 vnode 生成 data.scopedSlots，data.scopedSlots 对象的 key 就是具名插槽的名字，value 是一个函数，用于获取到子组件作用域的数据后生成子组件 vnode。子组件 $mount 流程的时候会将 data.scopedSlots 转移到 vm.$scopedSlots 上，之后子组件的 render 方法中插槽的部分会用 _t 方法找到 vm.$scopedSlots 替换进去，然后生成 vnode，后续走 patch 流程