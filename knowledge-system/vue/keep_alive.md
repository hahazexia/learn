# keep-alive

keep-alive 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在父组件链中；使用 keep-alive 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。

用户在某个列表页面选择筛选条件过滤出一份数据列表，由列表页面进入数据详情页面，再返回该列表页面，我们希望：列表页面可以保留用户的筛选（或选中）状态。keep-alive 就是用来解决这种场景。当然 keep-alive 不仅仅是能够保存页面/组件的状态这么简单，它还可以避免组件反复创建和渲染，有效提升系统性能。
总的来说，keep-alive 用于保存组件的渲染状态。

## 源码分析

keep-alive.js `src/core/components/keep-alive.js`

```js
/* @flow */

import { isRegExp, remove } from 'shared/util'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

type VNodeCache = { [key: string]: ?VNode };

function getComponentName (opts: ?VNodeComponentOptions): ?string {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      const name: ?string = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}

function pruneCacheEntry (
  cache: VNodeCache,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    // 删除缓存 VNode 执行对应组件实例的 destory 钩子函数。
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}

const patternTypes: Array<Function> = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  abstract: true, // 判断当前组件虚拟 dom 是否渲染成真实 dom 的关键

  props: {
    include: patternTypes, // 缓存白名单
    exclude: patternTypes, // 缓存黑名单
    max: [String, Number] // 缓存的组件实例数量上限
  },

  created () {
    this.cache = Object.create(null) // 缓存虚拟 dom
    this.keys = [] // 缓存的虚拟 dom 的 key 集合
  },

  destroyed () {
    for (const key in this.cache) { // 删除所有的缓存
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    // 实时监听黑白名单的变动
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render () {
    // 通过 $slots 获取 keep-alive 包裹着的第一个子组件对象及其组件名
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot)
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        // 根据设定的黑白名单（如果有）进行条件匹配，决定是否缓存
        // 这里的条件判断的是不匹配的情况，直接返回当前子组件的 vnode
        return vnode
      }

      const { cache, keys } = this
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
        // 如果 vnode 有 key ，直接使用 vnode.key，否则根据组件 cid 和 tag 生成缓存 key
        // 在缓存对象中查找是否已缓存过该组件 vnode。如果存在，直接取出缓存值并更新该 key 在 this.keys 中的位置（更新 key 的位置是实现 LRU 置换策略的关键）
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      } else {
        // 在 this.cache 对象中存储该组件 vnode 并保存 key 值，之后检查缓存的 vnode 数量是否超过 max 的设置值，超过则根据 LRU 置换策略删除最近最久未使用的 vnode（即是下标为 0 的那个 key）。
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      // 这一步很重要，将该组件 vnode 的 keepAlive 属性值设置为 true
      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}

```

主要看这个组件最后的导出。keep-alive 在它生命周期内定义了三个钩子函数：

* created 初始化两个对象分别缓存 vnode 和 vnode 对应的 key 集合
* destroyed 删除 this.cache 中缓存的 vnode 。这里不是简单地将 this.cache 置为 null，而是遍历调用 pruneCacheEntry 函数删除。因为需要调用 vnode.componentInstance.$destroy() 执行组件实例的 destroy 流程（销毁一个实例。清理它与其它实例的连接，解绑它的全部指令及事件监听器。）
* mounted 在 mounted 中对 include 和 exclude 参数进行监听，然后实时地更新（删除）this.cache 对象数据。pruneCache 函数的核心也是去调用pruneCacheEntry。
* render
    1. 通过 $slots 获取 keep-alive 包裹着的第一个子组件对象及其组件名
    2. 根据设定的黑白名单（如果有）进行条件匹配，决定是否缓存。如果不需要缓存直接返回 vnode
    3. 如果 vnode 有 key ，直接使用 vnode.key，否则根据组件 cid 和 tag 生成缓存 key。在缓存对象中查找是否已缓存过该组件 vnode。如果存在，直接取出缓存值并更新该 key 在 this.keys 中的位置（更新 key 的位置是实现 LRU 置换策略的关键）
    4. 如果缓存中不存在，在 this.cache 对象中存储该组件 vnode 并保存 key 值，之后检查缓存的 vnode 数量是否超过 max 的设置值，超过则根据 LRU 置换策略删除最近最久未使用的 vnode（即是下标为 0 的那个 key）。
    5. 最后一步很重要，将该组件 vnode 的 keepAlive 属性值设置为 true

## 关键问题

* keep-alive 不会生成真正的DOM节点，这是怎么做到的？

`src/core/instance/lifecycle.js`

```js 
export function initLifecycle (vm: Component) {
  const options = vm.$options
  // 找到第一个非abstract的父组件实例
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }
  vm.$parent = parent
  // ...
}
```

Vue 在初始化生命周期的时候，为组件实例建立父子关系会根据 abstract 属性决定是否忽略某个组件。在 keep-alive 中，设置了 abstract: true，那 Vue 就会跳过该组件实例。

最后构建的组件树中就不会包含 keep-alive 组件，那么由组件树渲染成的 DOM 树自然也不会有 keep-alive 相关的节点了。

* keep-alive 包裹的组件是如何使用缓存的？

看这样一个例子：

```js
let A = {
  template: '<div class="a">' +
  '<p>A Comp</p>' +
  '</div>',
  name: 'A'
}

let B = {
  template: '<div class="b">' +
  '<p>B Comp</p>' +
  '</div>',
  name: 'B'
}

let vm = new Vue({
  el: '#app',
  template: '<div>' +
  '<keep-alive>' +
  '<component :is="currentComp">' +
  '</component>' +
  '</keep-alive>' +
  '<button @click="change">switch</button>' +
  '</div>',
  data: {
    currentComp: 'A'
  },
  methods: {
    change() {
      this.currentComp = this.currentComp === 'A' ? 'B' : 'A'
    }
  },
  components: {
    A,
    B
  }
})
```

1. 组件的 patch 过程会执行 createComponent 方法，它的定义在 `src/core/vdom/patch.js`

```js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    // after calling the init hook, if the vnode is a child component
    // it should've created a child instance and mounted it. the child
    // component also has set the placeholder vnode's elm.
    // in that case we can just return the element and be done.
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```

第一次渲染的时候，vnode.componentInstance 为 undefined，vnode.data.keepAlive 为 true，因此 isReactivated 为 false，走正常的 init 的钩子函数执行组件的 mount。

2. 当 vnode 已经执行完 patch 后，执行 initComponent 函数

```js
function initComponent (vnode, insertedVnodeQueue) {
  if (isDef(vnode.data.pendingInsert)) {
    insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
    vnode.data.pendingInsert = null
  }
  vnode.elm = vnode.componentInstance.$el
  if (isPatchable(vnode)) {
    invokeCreateHooks(vnode, insertedVnodeQueue)
    setScope(vnode)
  } else {
    // empty component root.
    // skip all element-related modules except for ref (#3455)
    registerRef(vnode)
    // make sure to invoke the insert hook
    insertedVnodeQueue.push(vnode)
  }
}
```

这里会有 vnode.elm 缓存了 vnode 创建生成的 DOM 节点。所以对于首次渲染而言，除了在 <keep-alive> 中建立缓存，和普通组件渲染没什么区别。

3. 当我们从 B 组件再次点击 switch 切换到 A 组件，就会命中缓存渲染。当数据发送变化，在 patch 的过程中会执行 patchVnode 的逻辑，它会对比新旧 vnode 节点。patchVnode 在做各种 diff 之前，会先执行 prepatch 的钩子函数，它的定义在 `src/core/vdom/create-component`

```js
const componentVNodeHooks = {
  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },
  // ...
}
```

prepatch 核心逻辑就是执行 updateChildComponent 方法，它的定义在 `src/core/instance/lifecycle.js 中`：

```js
export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  const hasChildren = !!(
    renderChildren ||          
    vm.$options._renderChildren ||
    parentVnode.data.scopedSlots || 
    vm.$scopedSlots !== emptyObject 
  )

  // ...
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }
}
```

updateChildComponent 方法主要是去更新组件实例的一些属性，这里我们重点关注一下 slot 部分，由于 keep-alive 组件本质上支持了 slot，所以它执行 prepatch 的时候，需要对自己的 children，也就是这些 slots 做重新解析，并触发 keep-alive 组件实例 $forceUpdate 逻辑，也就是重新执行 keep-alive 的 render 方法，这个时候如果它包裹的第一个组件 vnode 命中缓存，则直接返回缓存中的 vnode.componentInstance，在我们的例子中就是缓存的 A 组件，接着又会执行 patch 过程，再次执行到 createComponent 方法，

```js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    // after calling the init hook, if the vnode is a child component
    // it should've created a child instance and mounted it. the child
    // component also has set the placeholder vnode's elm.
    // in that case we can just return the element and be done.
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```

这个时候 isReactivated 为 true，并且在执行 init 钩子函数的时候不会再执行组件的 mount 过程了，相关逻辑在 `src/core/vdom/create-component.js` 中：

```js
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },
  // ...
}
```

这也就是被 keep-alive 包裹的组件在有缓存的时候就不会在执行组件的 created、mounted 等钩子函数的原因了。回到 createComponent 方法，在 isReactivated 为 true 的情况下会执行 reactivateComponent 方法：

```js
function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i
  // hack for #4339: a reactivated component with inner transition
  // does not trigger because the inner node's created hooks are not called
  // again. It's not ideal to involve module-specific logic in here but
  // there doesn't seem to be a better way to do it.
  let innerNode = vnode
  while (innerNode.componentInstance) {
    innerNode = innerNode.componentInstance._vnode
    if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
      for (i = 0; i < cbs.activate.length; ++i) {
        cbs.activate[i](emptyNode, innerNode)
      }
      insertedVnodeQueue.push(innerNode)
      break
    }
  }
  // unlike a newly created component,
  // a reactivated keep-alive component doesn't insert itself
  insert(parentElm, vnode.elm, refElm)
}
```

最后通过执行 insert(parentElm, vnode.elm, refElm) 就把缓存的 DOM 对象直接插入到目标元素中，这样就完成了在数据更新的情况下的渲染过程。

4. 在渲染的最后一步，会执行 invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch) 函数执行 vnode 的 insert 钩子函数，它的定义在 `src/core/vdom/create-component.js` 中：

```js
const componentVNodeHooks = {
  insert (vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      callHook(componentInstance, 'mounted')
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance)
      } else {
        activateChildComponent(componentInstance, true /* direct */)
      }
    }
  },
  // ...
}
```

这里判断如果是被 keep-alive 包裹的组件已经 mounted，那么则执行 queueActivatedComponent(componentInstance) ，否则执行 activateChildComponent(componentInstance, true)。我们先分析非 mounted 的情况，activateChildComponent 的定义在 `src/core/instance/lifecycle.js` 中：

```js
export function activateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}
```

可以看到这里就是执行组件的 acitvated 钩子函数，并且递归去执行它的所有子组件的 activated 钩子函数。

那么再看 queueActivatedComponent 的逻辑，它定义在 `src/core/observer/scheduler.js` 中：

```js
export function queueActivatedComponent (vm: Component) {
  vm._inactive = false
  activatedChildren.push(vm)
}
```

这个逻辑很简单，把当前 vm 实例添加到 activatedChildren 数组中，等所有的渲染完毕，在 nextTick后会执行 flushSchedulerQueue，这个时候就会执行：

```js
function flushSchedulerQueue () {
  // ...
  const activatedQueue = activatedChildren.slice()
  callActivatedHooks(activatedQueue)
  // ...
} 

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true)  }
}
```

也就是遍历所有的 activatedChildren，执行 activateChildComponent 方法，通过队列调的方式就是把整个 activated 时机延后了。


## 总结

keep-alive 组件是一个抽象组件，它的实现通过自定义 render 函数并且利用了插槽，将它包裹的组件的 vnode 缓存起来。且在 patch 过程中对于已缓存的组件不会执行 mounted，所以不会有一般的组件的生命周期函数但是又提供了 activated 和 deactivated 钩子函数。