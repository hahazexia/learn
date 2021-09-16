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

1. 第一次渲染的时候，keep-alive 标签走正常的 init 的钩子函数生成实例，然后走 $mount 流程， keep-alive 标签生成的 vm 实例有 $slots 属性，vm.$slots.default 就是其内部的 A 组件。keep-alive 组件自己是没有 dom 结构的，所以走到 _render 生成 vnode 的时候，调用的 render 是 keep-alive 的 render 方法。

2. keep-alive 的 render 方法会判断如果有缓存则返回缓存中的被包裹的组件的 vnode，如果是第一次渲染，则通过 vm.$slots.default 拿到被 keep-alive 包裹的组件 vnode 后缓存在 keep-alive 组件实例中，并设置 vnode.data.keepAlive = true 然后返回 vnode。

3. _render 之后就是 patch 流程将组件 A 渲染出来。

4. 点击按钮切换到 B 组件也是第一次渲染 B ，和 A 走同样的逻辑被缓存起来。这时候 keep-alive 组件实例的 cache 里就缓存了两个组件 A 和 B 的 vnode。

5. 再次切换回 A 组件的时候，patch 流程又会走到 init 组件钩子函数，这时候就判断 vnode.data.keepAlive 了，因为是 keepAlive 为 true，所以不会新实例化 A 组件，而是通过缓存的 A 的 vnode 获取到对应的 dom 直接插入页面中。

## 总结

keep-alive 组件是一个抽象组件，它的实现通过自定义 render 函数并且利用了插槽，将它包裹的组件的 vnode 缓存起来。且在 patch 过程中对于已缓存的组件不会执行 mounted，所以不会有一般的组件的生命周期函数但是又提供了 activated 和 deactivated 钩子函数。patch 过程中通过 keep-alive 的 cache 属性获取到之前缓存的组件 vnode 然后拿到 elm 属性，也就是原生 dom 节点，然后直接插入页面中。

keep-alive 也是个组件，它没有 dom 模板，而是实现了 render 方法用来缓存它的插槽内容，它会通过vm.$slots.default 拿到它包裹的子组件的 vnode 然后缓存在自己的 cache 数组中，然后返回这个子组件 vnode 渲染。等到第二次渲染的时候就直接会从 keep-alive 组件的 cache 数组里得到子组件的 vnode.elm 属性，也就是子组件的 dom 节点，然后直接插入页面对应位置。这时候就不再走 mounted 了，只会触发 activated 和 deactivated 钩子函数