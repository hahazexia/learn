# 组件化

## 组件注册

### 全局组件注册

全局组件注册会调用 Vue.component，其内部其实是调用 Vue.extend。

```js
Vue.component('my-component', { /* ... */ })
```

`src\core\global-api\assets.js`

<details>
<summary>点击查看代码</summary>

```js
/**
 * 定义 Vue.component、Vue.filter、Vue.directive 这三个方法
 * 这三个方法所做的事情是类似的，就是在 this.options.xx 上存放对应的配置
 * 比如 Vue.component(compName, {xx}) 结果是 this.options.components.compName = 组件构造函数
 * ASSET_TYPES = ['component', 'directive', 'filter']
 */
  ASSET_TYPES.forEach(type => {
      /**
   * 比如：Vue.component(name, definition)
   * @param {*} id name
   * @param {*} definition 组件构造函数或者配置对象 
   * @returns 返回组件构造函数
   */
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') { // 开发环境下对组件名做校验
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
        // 如果组件配置中存在 name，则使用，否则直接使用 id
          definition.name = definition.name || id
           // extend 就是 Vue.extend，所以这时的 definition 就变成了 组件构造函数，使用时可直接 new Definition()
          definition = this.options._base.extend(definition) // 调用 Vue.extend 生成组件构造函数
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        // this.options.components[id] = definition
        // 在实例化时通过 mergeOptions 将全局注册的组件合并到每个组件的配置对象的 components 中
        this.options[type + 's'][id] = definition // 在 Vue.options 上加入对应的定义
        return definition
      }
    }
  })
```
</details>
<br><br>

`src\core\global-api\extend.js`

<details>
<summary>点击查看代码</summary>


```js
/**
 * 基于 Vue 去扩展子类，该子类同样支持进一步的扩展
 * 扩展时可以传递一些默认配置，就像 Vue 也会有一些默认配置
 * 默认配置如果和基类有冲突则会进行选项合并（mergeOptions)
 */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this // Vue 构造函数
    const SuperId = Super.cid
    
  /**
   * 利用缓存，如果存在则直接返回缓存中的构造函数
   * 什么情况下可以利用到这个缓存？
   *   如果你在多次调用 Vue.extend 时使用了同一个配置项（extendOptions），这时就会启用该缓存
   */
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})

    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    // 验证组件名称
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }

      // 定义 Sub 构造函数，和 Vue 构造函数一样
    const Sub = function VueComponent (options) {
      // 初始化
      this._init(options)
    }
      // 通过原型继承的方式继承 Vue
    Sub.prototype = Object.create(Super.prototype)
    // 设置构造函数
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    // 选项合并，合并 Vue 的配置项到 自己的配置项上来
    // 可以通过 Vue.extend 定义一个子类，预设一些配置项
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    // 记录自己的基类
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 初始化 props，将 props 配置代理到 Sub.prototype._props 对象上
    // 在组件内通过 this._props 方式可以访问
    if (Sub.options.props) {
      initProps(Sub)
    }
    
  // 初始化 computed，将 computed 配置代理到 Sub.prototype 对象上
  // 在组件内可以通过 this.computedKey 的方式访问
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
  // 定义 extend、mixin、use 这三个静态方法，允许在 Sub 基础上再进一步构造子类
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
  // 定义 component、filter、directive 三个静态方法
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    
  // 递归组件的原理，如果组件设置了 name 属性，则将自己注册到自己的 components 选项中
    /**
     * {
     *  name: 'Comp',
     *  components: { 'Comp': Comp }
     * }
     */
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    
  // 在扩展时保留对基类选项的引用。
  // 稍后在实例化时，我们可以检查 Super 的选项是否具有更新
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    cachedCtors[SuperId] = Sub // 将 Sub 构造函数缓存
    return Sub
  }
```
</details>
<br><br>

Vue.component 其实就是调用 Vue.extend 生成组件的构造函数，这个构造函数继承自 Vue，是 Vue 的子类。得到子类后，将子类放入 Vue.options.components 全局 options 中，这样项目中所有组件在初始化的时候，都会调用 mergeOptions 将 Vue.options 这个全局 options 合并入自己的 option 中，这就是为什么全局组件可以在任何组件中使用的原因。

### 局部组件注册

局部组件其实是单文件组件，然后写在另外一个组件 option 中的 components 中：

```js
// 组件 A.vue
<script>
export default {
    name: 'A'
}
</script>

// 组件 B.vue
<template>
    <A></A>
</template>
<script>
import A from './A.vue'
export default {
    name: 'B',
    components: {
        A
    }
}
</script>
```

单文件组件会被 webpack 的 vue-loader 处理，会编译 template 为 render 函数，最终导出的依然是组件配置对象。

通过打印 vue 实例的 $options.render 属性，可以查看编译后的 render 函数：

```js
const app = new Vue({
    el: '#demo'
});
console.log(app.$options.render)


"with(this){return _c('div',{attrs:{"id":"demo"}},[
 _c('h1',[_v("虚拟DOM")]),_v(" "),
 _c('p',[_v(_s(foo))]),_v(" "),
 _c('comp') // 对于组件的处理并⽆特殊之处
],1)}"

```

通过 render 函数可以知道组件的解析是 _c 函数做的。

### 组件的解析

下面是 initRender 源码 `src\core\instance\render.js`

<details>
<summary>点击查看代码</summary>

```js
export function initRender (vm: Component) { // Vue.prototype._init 调用的时候会执行 initRender
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
  // 当用户手写 render 函数传入 options 时，就调用 vm.$createElement，如果 render 函数是从 template 编译而来，就使用 vm._c

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  // vm.$attrs 和 vm.$listeners 定义为响应式的属性，shallow 参数是 true，表示非深度监测
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}
```
</details>
<br><br>

_c 函数最后其实执行的是 createElement 函数，而 createElement 里调用了 _createElement 函数。

下面是 _createElement 源码 `src\core\vdom\create-element.js`


<details>
<summary>点击查看代码</summary>

```js
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (isDef(data) && isDef((data: any).__ob__)) { // 判断 data 参数对象是否是响应式的，如果是响应式的就报错
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) { // 判断如果使用了动态组件，给component绑定了is属性，那么 tag 就是 is 属性指向的组件标签名
    tag = data.is
  }
  if (!tag) { // 如果没有 tag，创建空 vnode 返回
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) { // 如果 data.key 不是简单类型数据报错
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    // children 期望是一个数组，每个元素是一个 vnode ，调用 normalizeChildren 方法将嵌套的数组展平
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  if (typeof tag === 'string') { // 如果 tag 是字符串
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // 保留标签 例如 div 或 p，直接创建 vnode
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // 如果是 component
      // resolveAsset 从 options 中拿到组件的构造函数
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else { // 如果不认识的标签名
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {// 否则创建 component
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```

</details>
<br><br>

_createElement 中判断 tag 如果是保留标签，就创建对应的 vnode，如果不是就可能是组件，会去从 vm.$options.components 中拿到对应的构造函数，如果这个组件是全局组件，那么这时候获取到的就是子类构造函数，如果是局部组件，这时候获取到的就是组件对应的 option，然后调用 createComponent

下面是 createComponent 源码 `src\core\vdom\create-component.js`

<details>
<summary>点击查看代码</summary>

```js
// 生成自定义组件的 vnode
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void { // 此方法用于创建 component 的 vnode
  if (isUndef(Ctor)) {
    return
  }

  const baseCtor = context.$options._base
  // baseCtor 就是 Vue 构造函数
  // 在 src/core/global-api/index 中定义了 Vue.options._base = Vue
  // 在 Vue.prototype._init 中会把 Vue.options 合并到 vm.$options 中


  // plain options object: turn it into a constructor
  // 如果 Ctor 是对象，说明这个组件不是全局组件，而是局部组件
  // 全局组件这里传进来的 Ctor 就已经是 Vue.extend 处理后的子类构造函数了，因为全局组件总是在 new Vue 根组件实例初始化之前就注册了
  if (isObject(Ctor)) {
    // 如果 Ctor 是个对象，说明是局部注册组件，为其构造⼦类构造函数。Vue.extend 定义在 src/core/global-api/extend 中
    Ctor = baseCtor.extend(Ctor)
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') { // 如果子构造器生成失败，报错
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }

  // async component
  // 异步组件逻辑
  let asyncFactory
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor)
    if (Ctor === undefined) {

      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  // 组件数据 事件 指令处理
  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // extract props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  // install component management hooks onto the placeholder node
  // 安装组件钩⼦函数 用于组件初始化或更新或销毁
  installComponentHooks(data)

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  ) // 实例化 vnode

  // Weex specific: invoke recycle-list optimized @render function for
  // extracting cell-slot template.
  // https://github.com/Hanks10100/weex-native-directive/tree/master/component
  /* istanbul ignore if */
  if (__WEEX__ && isRecyclableComponent(vnode)) {
    return renderRecyclableComponentTemplate(vnode)
  }

  return vnode
}
```

</details>
<br><br>

createComponent 需要特别注意的有两点：
1. 用 Vue.extend 创建了局部注册组件的子类构造函数（全局组件在 Vue.component 调用的时候就已经生成子类构造函数了，这里处理的是局部组件）
2. 安装了组件钩子函数，这些钩子函数用于组件的初始化，更新和销毁

## 组件解析和挂载完整流程

```js
// main.js
import Vue from 'vue'
import App from './App.vue'
import ComponentA from './ComponentA.vue'

Vue.component('ComponentA', ComponentA)

new Vue({
  ...App
}).$mount('#app')

// App.vue
<template>
  <div>
    <ComponentA></ComponentA>
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

// ComponentA.vue
<template>
  <div>
    ComponentA
  </div>
</template>

<script>

export default {
  name: 'ComponentA'
}
</script>

```

上面这个例子关于组件的流程如下（省略 Vue.component 注册全局组件流程，之前已经分析过了）

1. 父组件（App.vue）初始化
2. 父组件（App.vue）执行 $mount 挂载流程，调用 mountComponent （`src\core\instance\lifecycle.js`）
3. mountComponent 中对当前组件（App.vue）新建一个对应的渲染 watcher，传入 updateComponent 方法作为参数

    ```js
        // 此处只给出关键代码
        function mountComponent() {
            updateComponent = function () {
                vm._update(vm._render(), hydrating);
            };

            new Watcher(vm, updateComponent, noop, {
                before: function before () {
                    if (vm._isMounted && !vm._isDestroyed) {
                        callHook(vm, 'beforeUpdate');
                    }
                }
            }, true /* isRenderWatcher */);
        }
    ```
3. new Wacher() 初始化 watcher 实例的时候，最后会调用刚才传入的 updateComponent，于是会先执行 vm._render()，然后再执行 vm._update
4. vm._render() 也就是 Vue.prototype._render （`src\core\instance\render.js`）执行。Vue.prototype._render 中会去调用当前组件 $options 中的 render 函数，这里例子中的 App.vue 已经被 vue-loader 编译后产生了 render 函数

    下面是 Vue.prototype._render（`src\core\instance\render.js`）

    ```js
        // 此处只给出关键代码
        Vue.prototype._render = function() {
            const vm = this
            const { render, _parentVnode } = vm.$options
            
            vnode = render.call(vm._renderProxy, vm.$createElement)
            return vnode
        }
    ```

    下面是 App.vue 的 render 函数

    ```js
        var render = function() {
            var _vm = this
            var _h = _vm.$createElement
            var _c = _vm._self._c || _h
            return _c("div", [_c("ComponentA")], 1)
        }
    ```
    这里调用后会执行 _c("ComponentA")。

5. _c 最后调用的是 _createElement (`src\core\vdom\create-element.js`)。_createElement 会判断字符串 "ComponentA" 是否是保留标签，发现不是，说明是组件名称，于是获取到之前 Vue.extend 生成的全局组件的子类构造函数，然后调用 createComponent 去生成 vnode。createComponent 调用的时候，第一个参数是 resolveAsset 从 this.$options 中找到的 Ctor，如果是全局组件 Ctor 就是子类构造函数，如果是局部组件，这时候 Ctor 是局部组件的配置对象。局部组件的配置对象传递给 createComponent 后会调用 Vue.extend 创建子类构造函数，然后作为 componentOptions 的一部分传递给 Vnode 构造函数。

    ```js
        function _createElement() {
            if (typeof tag === 'string') {
                if (config.isReservedTag(tag)) {
                    // 省略
                } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
                    vnode = createComponent(Ctor, data, context, children, tag)
                }
            }
            return vnode
        }
    ```
6. createComponent 为组件的 data 上安装组件钩子用于初始化更新和卸载

    ```js
        function createComponent() {
            data = data || {}
            installComponentHooks(data)
            const vnode = new VNode(
                `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
                data
            )
            return vnode
        }
    ```
7. _c("ComponentA") 执行完成返回了 ComponentA 组件的占位符 vnode（占位符 vnode 的名字为 vue-component-1-ComponentA），接下来执行 `_c("div", [_c("ComponentA")], 1)`，接着 vm._render() 结束，返回了 App.vue 组件对应的 vnode，传递给 vm._update
    ```js
        updateComponent = function () {
            vm._update(vm._render(), hydrating);
        };
    ```
8. Vue.prototype._update （`src\core\instance\lifecycle.js`） 执行 patch 流程
    ```js
        Vue.prototype._update = function (vnode, hydrating) {
            const vm = this
            const prevEl = vm.$el
            const prevVnode = vm._vnode
            // 设置当前 vm 实例为激活的实例，后面 patch 过程中如果遇到组件实例初始化后，就可以用来建立组件的父子关系
            const restoreActiveInstance = setActiveInstance(vm)
            vm._vnode = vnode

            if (!prevVnode) {
                // initial render
                // 首次渲染，即初始化页面时走这里
                vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
            } else {
                vm.$el = vm.__patch__(prevVnode, vnode)
            }
        }
        
    ```
9. patch （`src\core\vdom\patch.js`） 中会调用 createElm 根据 vnode 生成 dom

    ```js
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm, // 父节点
          nodeOps.nextSibling(oldElm) // 宿主元素的邻居节点
        )
    ```
10. 这个例子中首先去创建 div 对应的 dom 元素，然后再调用 createChildren 递归调用 createElm 创建子节点。这里 div 的子节点就是刚才的  ComponentA 组件的占位符 vnode （vue-component-1-ComponentA）。这时候会走到 createElm 中的这一句判断，这句判断会发现这个 vnode 是一个组件的占位符 vnode ，然后根据这个 vnode 去初始化组件实例

    ```js
        if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        // 如果 vnode 是组件 vnode，则调用组件的 hook.init，就会继续创建子组件
        return
        }
    ```

    createComponent 会调用占位符 vnode 中 data 属性中的钩子函数 init 去初始化组件实例
    ```js
        function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
            let i = vnode.data
            if (isDef(i)) {
            const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
            if (isDef(i = i.hook) && isDef(i = i.init)) {
                // 得到 i 是 init 钩子函数
                // 执行 init 组件钩子，创建组件实例并且执行挂载
                i(vnode, false /* hydrating */)
            }
            if (isDef(vnode.componentInstance)) {
                // 属性 事件 样式初始化
                initComponent(vnode, insertedVnodeQueue)
                // 组件的 dom 插入到父节点中
                insert(parentElm, vnode.elm, refElm)
                if (isTrue(isReactivated)) {
                reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
                }
                return true
            }
            }
        }
    ```
11. 组件钩子中的 init 会找到组件的子类构造函数，创建组件实例，创建成功后手动调用 $mount 去挂载组件

    ```js
        {
            init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
                if (
                vnode.componentInstance &&
                !vnode.componentInstance._isDestroyed &&
                vnode.data.keepAlive
                ) {
                    // 缓存组件，被包在 keep-alive 标签中的组件
                    // kept-alive components, treat as a patch
                    const mountedNode: any = vnode // work around flow
                    componentVNodeHooks.prepatch(mountedNode, mountedNode)
                } else {
                // 正常初始化
                // 调用组件构造函数获取组件实例
                const child = vnode.componentInstance = createComponentInstanceForVnode(
                    vnode,
                    activeInstance
                )
                // 手动调用组件 $mount 走挂载流程
                child.$mount(hydrating ? vnode.elm : undefined, hydrating)
                }
            }
        }

        // 调用组件的子类构造函数，创建组件实例
        export function createComponentInstanceForVnode (
        vnode: any, // we know it's MountedComponentVNode but flow doesn't
        parent: any, // activeInstance in lifecycle state
        ): Component {
            const options: InternalComponentOptions = {
                _isComponent: true, // 表明是一个组件
                _parentVnode: vnode,
                parent
            }
            // check inline-template render functions
            const inlineTemplate = vnode.data.inlineTemplate
            if (isDef(inlineTemplate)) {
                options.render = inlineTemplate.render
                options.staticRenderFns = inlineTemplate.staticRenderFns
            }
            return new vnode.componentOptions.Ctor(options) // 子组件实例
        }
    ```

    注意这里调用组件构造函数的时候传入的 options 中的参数 parent 是 activeInstance，也就是在父组件 App.vue 执行 Vue.prototype._update 的时候设置的当前激活的组件实例，也即是 App.vue 对应的实例，也就是说这个 parent 参数的传入使得 ComponentA 和 App 组件建立起了父子组件关系。

    组件初始化的时候会调用 initLifecycle 去建立子组件和父组件的关系，也就是 vm.$parent 属性和 vm.$children 属性，如下所示

    initLifecycle `src\core\instance\lifecycle.js`

    ```js
        export function initLifecycle (vm: Component) {
            const options = vm.$options

            // locate first non-abstract parent (查找第一个非抽象的父组件)
            let parent = options.parent
            // 如果当前实例有父组件，且当前实例不是抽象的
            // 抽象组件就是不渲染 dom 的组件：例如 keep-alive 或者 transition，他们也不会出现在父子关系的路径上
            // 这里下面循环去找上层的真正父级实例（非抽象的）的原因是要将当前实例添加到父级的 $children 属性里
            if (parent && !options.abstract) {
                // 使用 while 循环查找第一个非抽象的父组件
                while (parent.$options.abstract && parent.$parent) {
                parent = parent.$parent
                }
                // 经过上面的 while 循环后，parent 应该是一个非抽象的组件，将它作为当前实例的父级，所以将当前实例 vm 添加到父级的 $children 属性里
                parent.$children.push(vm)
            }

            // 设置当前实例的 $parent 属性，指向父级
            vm.$parent = parent
            // 设置 $root 属性，有父级就是用父级的 $root，否则 $root 指向自身
            vm.$root = parent ? parent.$root : vm
            // 上面代码的作用：将当前实例添加到父实例的 $children 属性里，并设置当前实例的 $parent 指向父实例


            vm.$children = []
            vm.$refs = {}

            vm._watcher = null
            vm._inactive = null
            vm._directInactive = false
            vm._isMounted = false
            vm._isDestroyed = false
            vm._isBeingDestroyed = false
        }
    ```

    同时注意这一句 
    ```js
        const child = vnode.componentInstance = createComponentInstanceForVnode(
            vnode,
            activeInstance
        )
    ```
    获取到子组件的实例后把它放在了占位符 vnode 的 componentInstance 属性上，也就是说占位符 vnode 的 componentInstance 属性指向了真正的组件实例。

11. 接下来就是走 ComponentA 的 $mount 流程，和之前 App 组件的 $mount 流程差不多。因此从这个整体流程可以看出，父子组件的生命周期是这样执行的：
    1. 父组件的 beforeCreate
    2. 父组件的 created
    3. 父组件的 beforeMount
    4. 子组件的 beforeCreate
    5. 子组件的 created
    6. 子组件的 beforeMount
    7. 子组件的 mounted
    8. 父组件的 mounted

12. 如果父子传给子级一个 props 数据，然后父级改变了这个数据，那么更新的钩子函数是这样的顺序：
    1. 父 beforeUpdate
    2. 子 beforeUpdate
    3. 子 updated
    4. 父 updated


## 题目

你对组件化有什么理解？

1. 组件是独立和可复用的代码组织单元，组件系统是 vue 核心特征，使开发者可以使用小型独立可复用的组件构建大型应用。
2. 组件化开发能够提高开发效率，测试性，复用性。
3. 组件分类：页面组件，业务组件，通用组件
4. 合理划分组件，有利于提高性能。因为一个组件对应一个渲染 watcher，当组件中数据变化时会通知渲染 watcher 重新渲染，重新渲染时会计算新旧两个 vnode 的区别，也就是 diff 算法。如果将组件中频繁改变的地方单独提取成一个组件，diff 算法就可以减少一些无用的比较，提升了速度。
5. 组件应该是高内聚，低耦合的，遵循单向数据流。