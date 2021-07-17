# 响应式

## 什么是数据响应式？

所谓数据响应式就是能够使数据变化可以被监测并对这种变化作出响应的机制。

## 为什么 vue 需要数据响应式？

vue 是 mvvm 框架。mvvm 框架需要解决的一个问题是连接数据层和视图层，通过数据驱动应用，一旦数据变化，视图就需要更新，要做到这点就需要数据响应式。

## 它给我们带来了什么好处？

vue 通过数据响应式再加上虚拟 DOM 和 patch 算法，让开发者可以只操作数据，完全不用接触繁琐的 DOM 操作，大大提升开发效率，降低开发难度。

## vue 中数据响应式怎么实现的？

vue 中数据响应式根据不同数据类型做不同处理。如果是对象，采用 Object.defineProperty() 的方式定义数据拦截，当数据被访问或者发生改变的时候，我们感知并且作出响应；如果是数组，通过覆盖 7 个会改变数组自身的原型方法，扩展这 7 个方法，使这些方法可以额外地做更新通知，从而做出响应。

但是实际中也有一些缺点：初始化时需要遍历递归对象和数组造成性能损失；新增或者删除属性需要使用 Vue.set/delete 这种特殊的 api 才能生效；对于 ES6 中新数据结构 Map Set 不支持。

## vue3 中响应式的变化

为了解决上面提到的问题，vue3 使用 ES6 的 Proxy 机制代理要响应式的数据，有很多好处，它会劫持整个对象，这样不论是新增还是删除属性的操作都能监测到；当深层的属性在真正访问到的时候才去变成响应式的，使得初始化性能和内存消耗都得到大幅改善；响应式的实现代码抽取为独立的 reactivity 包，可以更灵活地使用。

## 详解 vue 响应式原理

### Observer

Observer 类将 data 中的数据的属性变成 getter/setter。

* 对于数组，覆盖数组的七个原生方法（push pop shift unshift splice sort reverse），做了两件事：对新加入数组的元素做响应式处理，并且通知依赖更新。
* 对于对象，使用 Object.defineProperty() 将对象上所有属性变成 getter/setter。
* 不论是数组还是对象，都递归向内层遍历所有的对象和数组，将它们变成响应式的。

以下是源码 `src\core\observer\index.js`

```js
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    // 这个 dep 负责对象变更通知，新增或删除属性，也就是 $set 和 $delete 之后手动调用 ob.dep.notify()
    this.dep = new Dep()
    this.vmCount = 0
    // 在 value 对象上设置 __ob__ 属性，enumerable 为 false，保证这个私有属性不会被 this.walk 遍历到
    def(value, '__ob__', this)

    if (Array.isArray(value)) {
      /**
       * value 为数组
       * hasProto = '__proto__' in {}
       * 用于判断对象是否存在 __proto__ 属性，通过 obj.__proto__ 可以访问对象的原型链
       * 但由于 __proto__ 不是标准属性，所以有些浏览器不支持，比如 IE6-10，Opera10.1
       * 为什么要判断，是因为一会儿要通过 __proto__ 操作数据的原型链
       * 覆盖数组默认的七个原型方法，以实现数组响应式
       */
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      // value 为对象，调用 this.walk 为对象的每个属性（包括嵌套对象）设置响应式
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  /**
   * 遍历对象上的每个可枚举的 key，为每个 key 设置响应式
   * 仅当值为对象时才会走这里
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
    /**
   * 遍历数组，为数组的每一项设置观察，处理数组元素为对象的情况
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

处理之后，每个对象都会有一个 `__ob__` 属性，也就是 Observer 实例

```js
    const data = {
      a: {
        b: 1
      }
    }
    observe(data)

    // 经过处理后变成如下数据：

    const data = {
      a: {
        b: 1
        __ob__: {a, dep, vmCount}
      }
      __ob__: {data, dep, vmCount}
    }

```

### Dep

Dep 类用于收集依赖。当响应式数据的 getter 被触发的时候，Dep 会将 watcher 实例收集到 dep.subs 数组中。


以下是源码 `src\core\observer\dep.js`

```js
/**
 * 一个 dep 对应一个 obj.key
 * 在读取响应式数据时，负责收集依赖，每个 dep（或者说 data.key）依赖的 watcher 有哪些
 * 在响应式数据更新时，负责通知 dep 中那些 watcher 去执行 update 方法
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

    // 在 dep 中添加 watcher
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  // 向 watcher 中添加 dep
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  /**
   * 通知 dep 中的所有 watcher，执行 watcher.update() 方法
   */
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)  // 升序排列
    }
    // 遍历 dep 中存储的 watcher，执行 watcher.update()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
/**
 * 当前正在执行的 watcher，同一时间只会有一个 watcher 在执行
 * Dep.target = 当前正在执行的 watcher
 * 通过调用 pushTarget 方法完成赋值，调用 popTarget 方法完成重置（null)
 */
Dep.target = null
const targetStack = []

// 在需要进行依赖收集的时候调用，设置 Dep.target = watcher
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}
// 依赖收集结束调用，设置 Dep.target = null
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}

```

对象的每个属性都会有一个 Dep 实例的属性，也就是一个 key 一个 dep：

```js
    const data = {
      a: {
        b: 1
      }
    }
    observe(data)

    // 经过处理后变成如下数据：

    const data = {
      a: { // a 属性通过闭包引用着一个 dep
        b: 1 // b 属性通过闭包引用着一个 dep
      }
    }

```

### Watcher

依赖收集以后的 watcher 被保存在 dep.subs 中，数据变动的时候 dep 会通知 watcher 实例，然后触发 watcher 实例的回调 cb 进行视图更新。

`src\core\observer\watcher.js`

```js
/**
 * 一个组件一个 watcher（渲染 watcher）或者一个表达式一个 watcher（用户watcher）
 * 当数据更新时 watcher 会被触发，访问 this.computedProperty 时也会触发 watcher
 */
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // this.getter = function() { return this.xx }
      // 在 this.get 中执行 this.getter 时会触发依赖收集
      // 待后续 this.xx 更新时就会触发响应式
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
    /**
   * 执行 this.getter，并重新收集依赖
   * this.getter 是实例化 watcher 时传递的第二个参数，一个函数或者字符串，比如：updateComponent 或者 parsePath 返回的读取 this.xx 属性值的函数
   * 为什么要重新收集依赖？
   *   因为触发更新说明有响应式数据被更新了，但是被更新的数据虽然已经经过 observe 观察了，但是却没有进行依赖收集，
   *   所以，在更新页面时，会重新执行一次 render 函数，执行期间会触发读取操作，这时候进行依赖收集
   */
  get () {
    // 打开 Dep.target，Dep.target = this
    pushTarget(this)
    // value 为回调函数执行的结果
    let value
    const vm = this.vm
    try {
      // 执行回调函数，比如 渲染watcher 执行 updateComponent，进入 patch 阶段
      // 渲染 watcher 这里调用的是 vm._update(vm._render(), hydrating)
      // computed watcher 这里调用的是用户定义的 computed key 对应的函数
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      // 关闭 Dep.target，Dep.target = null
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
    /**
   * Add a dependency to this directive.
   * 两件事：
   *   1、添加 dep 给自己（watcher）
   *   2、添加自己（watcher）到 dep
   */
  addDep (dep: Dep) {
    // 判重，如果 dep 已经存在则不重复添加
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      // 缓存 dep.id，用于判重
      this.newDepIds.add(id)
      // 添加 dep
      this.newDeps.push(dep)
      // 避免在 dep 中重复添加 watcher，this.depIds 的设置在 cleanupDeps 方法中
      if (!this.depIds.has(id)) {
        // 添加 watcher 自己到 dep
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps () { // 移除不需要的 deps 订阅
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
    /**
   * 根据 watcher 配置项，决定接下来怎么走，一般是 queueWatcher
   */
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      // 懒执行时走这里，比如 computed
      this.dirty = true
      // 将 dirty 置为 true，可以让 computedGetter 执行时重新计算 computed 回调函数的执行结果
      // dirty 设置为 true 后，当组件更新完毕，computedKey 响应式数据再次被获取时，触发 computed getter，重新执行 computed 回调函数，计算新值，缓存到 computed watcher.value
    } else if (this.sync) {
      // 同步执行，在使用 vm.$watch 或者 watch 选项时可以传一个 sync 选项，比如 { sync: true }
      // 当为 true 时在数据更新时该 watcher 就不走异步更新队列，直接执行 this.run
      // 方法进行更新
      // 这个属性在官方文档中没有出现
      this.run()
    } else {
      // 更新时一般都这里，将 watcher 放入 watcher 队列
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
    /**
   * 由 刷新队列函数 flushSchedulerQueue 调用，完成如下几件事：
   *   1、执行实例化 watcher 传递的第二个参数，updateComponent 或者 获取 this.xx 的一个函数(parsePath 返回的函数)
   *   2、更新旧值为新值
   *   3、执行实例化 watcher 时传递的第三个参数，比如用户 watcher 的回调函数
   */
  run () {
    if (this.active) {
      // 调用 this.get 方法
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        // 更新旧值为新值
        const oldValue = this.value
        this.value = value
        if (this.user) {
          // 如果是用户 watcher，则执行用户传递的第三个参数 —— 回调函数，参数为 val 和 oldVal
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          // 渲染 watcher，this.cb = noop，一个空函数
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
    /**
   * 懒执行的 watcher 会调用该方法
   *   比如：computed，在获取 vm.computedProperty 的值时会调用该方法
   * 然后执行 this.get，即 watcher 的回调函数，得到返回值
   * this.dirty 被置为 false，作用是页面在本次渲染中只会一次 computed.key 的回调函数，
   *   这也是大家常说的 computed 和 methods 区别之一是 computed 有缓存的原理所在
   * 而页面更新后会 this.dirty 会被重新置为 true，这一步是在 this.update 方法中完成的
   */
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
```

1. vue 初始化完成后，会执行 $mount 挂载流程。其中会对生成一个 watcher 实例，也就是说，一个组件对应一个渲染 watcher。传给 watcher 的第二个参数是 updateComponent 方法。
    * vm._render 函数的作用是调用 vm.$options.render 函数并返回生成的虚拟节点(vnode)
    * vm._update 函数的作用是把 vm._render 函数生成的虚拟节点渲染成真正的 DOM

updateComponent 函数的作用就是：把渲染函数生成的虚拟 DOM 渲染成真正的 DOM

```js
  updateComponent = () => {
    vm._update(vm._render(), hydrating)
  }

  new Watcher(vm, updateComponent, noop, {
    before () {
        if (vm._isMounted) {
        callHook(vm, 'beforeUpdate')
        }
    }
    }, true /* isRenderWatcher */)
```

watcher 初始化的时候会调用 updateComponent，触发数据属性的 get 拦截器函数，从而收集到了依赖。

2. 数据的 getter 触发后，dep 将当前 watcher 加入到 dep.subs 数组中。
3. 数据的 setter 触发后，遍历 dep.subs 数组，调用每一个 watcher 的 update 方法去更新。
4. 每次修改属性的值之后并没有立即重新求值，而是将需要执行更新操作的 watcher 放入一个队列中，如果同一个 watcher 被多次触发，只会被推入到队列中一次。调用 nextTick 在本次循环结束之前将 watcher 队列清空执行更新操作。


### nextTick 的作用和原理

nextTick 函数的作用相当于 setTimeout(fn, 0)，这里有几个概念需要了解一下，即调用栈、任务队列、事件循环，javascript 是一种单线程的语言，它的一切都是建立在以这三个概念为基础之上的。

任务队列并非只有一个队列，可以将其分为 microtask（微任务） 和 task（宏任务）。当调用栈空闲后每次事件循环只会从 task 中读取一个任务并执行，而在同一次事件循环内会将 microtask 队列中所有的任务全部执行完毕，且要先于下一次 task。另外 task 中两个不同的任务之间可能穿插着 UI 的重渲染，那么我们只需要在 microtask 中把所有在 UI 重渲染之前需要更新的数据全部更新，这样只需要一次重渲染就能得到最新的 DOM 了。恰好 Vue 是一个数据驱动的框架，如果能在 UI 重渲染之前更新所有数据状态，这对性能的提升是一个很大的帮助，所有要优先选用 microtask 去更新数据状态而不是 task，这就是为什么不使用 setTimeout 的原因，因为 setTimeout 会将回调放到 task 队列中而不是 microtask 队列，所以理论上最优的选择是使用 Promise，当浏览器不支持 Promise 时再降级为 setTimeout。

vue 代码对微任务的降级兼容处理：
1. 优先使用 Promise，Promise 的 then 回调会被放入浏览器 microtask（微任务） 队列中执行。
2. 如果不支持 Promise，使用 MutationObserver
3. 否则 setImmediate
4. 如果以上都不知道，使用 setTimeout


