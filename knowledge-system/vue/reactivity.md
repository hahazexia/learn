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

<details>
<summary>点击查看代码</summary>

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
</details>
<br><br>

以下是 defineReactive 源码 `src\core\observer\index.js`

<details>
<summary>点击查看代码</summary>


```js
/**
 * 拦截 obj[key] 的读取和设置操作：
 *   1、在第一次读取时收集依赖，比如执行 render 函数生成虚拟 DOM 时会有读取操作
 *   2、在更新时设置新值并通知依赖更新
 */
// shallow 参数，是否深度监测
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 实例化 dep，一个 key 一个 dep
  const dep = new Dep()

  // 获取 obj[key] 的属性描述符，发现它是不可配置对象的话直接 return
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 记录原始 getter 和 setter，获取 val 值
  //一个对象的属性很可能已经是一个访问器属性了，所以该属性很可能已经存在 get 或 set 方法。由于接下来会使用 Object.defineProperty 函数重新定义属性的 setter/getter，这会导致属性原有的 set 和 get 方法被覆盖，所以要将属性原有的 setter/getter 缓存，并在重新定义的 set 和 get 方法中调用缓存的函数，从而做到不影响属性的原有读写操作。

  const getter = property && property.get
  const setter = property && property.set

  // https://github.com/vuejs/vue/pull/7302
  // 为什么要这样判断：(!getter || setter)
  // 因为有可能用户定义的 data 中的属性原本就是拥有 getter 的，如下：
  /**
   *  const data = {}
      Object.defineProperty(data, 'getterProp', {
        enumerable: true,
        configurable: true,
        get: () => {
          return {
            a: 1
          }
        }
      })

      const ins = new Vue({
        data,
        watch: {
          'getterProp.a': () => {
            console.log('这句话不会输出')
          }
        }
      })

      属性 getterProp 是一个拥有 get 拦截器函数的访问器属性，而当 Vue 发现该属性拥有原本的 getter 时，是不会深度观测的。

      那么为什么当属性拥有自己的 getter 时就不会对其深度观测了呢？有两方面的原因，
      第一：由于当属性存在原本的 getter 时在深度观测之前不会取值，所以在深度观测语句执行之前取不到属性值从而无法深度观测。
      第二：之所以在深度观测之前不取值是因为属性原本的 getter 由用户定义，用户可能在 getter 中做任何意想不到的事情，这么做是出于避免引发不可预见行为的考虑。

   */
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 递归调用，处理 val 即 obj[key] 的值为对象的情况，保证对象中的所有 key 都被观察
  let childOb = !shallow && observe(val)

  /**
   *
    const data = {
      a: {
        b: 1
      }
    }
    observe(data)

    经过处理后变成如下数据：

    const data = {
      a: {
        b: 1
        __ob__: {a, dep, vmCount}
      }
      __ob__: {data, dep, vmCount}
    }

    // 属性 a 通过 setter/getter 通过闭包引用着 dep 和 childOb
    // 属性 b 通过 setter/getter 通过闭包引用着 dep 和 childOb
    // 这里需要注意 a 通过闭包引用的 childOb 就是 data.a.__ob__
    // 而 b 通过闭包引用的 childOb 是 undefined

   */
  // 响应式核心
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    // get 拦截对 obj[key] 的读取操作，做两件事：1.返回正确的属性值，2.收集依赖
    get: function reactiveGetter () {
      // 正确地返回属性值
      const value = getter ? getter.call(obj) : val
      /**
       * Dep.target 为 Dep 类的一个静态属性，值为 watcher，在实例化 Watcher 时会被设置
       * 实例化 Watcher 时会执行 new Watcher 时传递的回调函数（computed 除外，因为它懒执行）
       * 而回调函数中如果有 vm.key 的读取行为，则会触发这里的 读取 拦截，进行依赖收集
       * 回调函数执行完以后又会将 Dep.target 设置为 null，避免这里重复收集依赖
       */
      if (Dep.target) {
        // 依赖收集，在 dep 中添加 watcher，也在 watcher 中添加 dep
        dep.depend()
        // 对于上面举的例子，对于属性 a 来说，childOb 就是 data.a.__ob__
        // 所以 childOb.dep 就是 data.a.__ob__.dep
        // 也就是说依赖不仅要收集到 a 自己的 dep 里，也要收集到 a.__ob__.dep 里
        // 这样做的原因是因为 a.dep 和 a.__ob__.dep 里的依赖，触发更新的时机是不同的
        // 第一个触发的时机就是当 a 属性的值被改变的时候，即触发 a 的 setter 的 dep.notify()
        // 而第二个触发的时机是 $set 或 Vue.set 给对象添加新属性时触发

        /**
         * Vue.set(data.a, 'c', 1)
         * 这样设置新的属性 c 后，之所以可以触发更新，是因为其中触发了 data.a.__ob__.dep.notify()，Vue.set 代码简化后如下：
         *
         * Vue.set = function (obj, key, val) {
            defineReactive(obj, key, val)
            obj.__ob__.dep.notify()
          }

          所以 __ob__ 属性以及 __ob__.dep 的主要作用是为了添加、删除属性时有能力触发依赖更新，而这就是 Vue.set 或 Vue.delete 的原理。
         */
        if (childOb) {
          childOb.dep.depend()
          // 如果是 obj[key] 是 数组，则触发数组响应式
          if (Array.isArray(value)) {
            // 为数组项为对象的项添加依赖
            dependArray(value)
          }
        }
      }
      return value
    },
    // set 拦截对 obj[key] 的设置新值的操作，做了两件事：1.设置新值，2.触发依赖更新
    set: function reactiveSetter (newVal) {
      // 旧的 obj[key]
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      // 如果新老值一样，则直接 return，不触发响应式更新过程（判断了新老值都是 NaN 的情况）
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        // customSetter 用来打印辅助信息
        // initRender 中在定义 vm.$attrs 和 vm.$listeners 这两个属性的时候传递了这个参数
        customSetter()
      }
      // setter 不存在说明该属性是一个只读属性，直接 return
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      // 设置新值
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // 需要深度监测的时候，对新值进行观察，让新值也是响应式的，并且覆盖 childOb 为新的 __ob__ 对象
      childOb = !shallow && observe(newVal)
      // 当响应式数据更新时，依赖通知更新
      dep.notify()
    }
  })
}
```
</details>
<br><br>

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

<details>
<summary>点击查看代码</summary>


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
</details>
<br><br>


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

<details>
<summary>点击查看代码</summary>

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
</details>
<br><br>

### 总结

分析下面这个例子


```html
<div id="demo">
    <p>{{obj.foo}}</p>
    <div v-for="a in arr" :key="a">
        {{ a }}
    </div>
</div>
<script>
    const app = new Vue({
        el: '#demo',
        data: {
            obj: {
                foo: 'foo'
            },
            arr: ['foo', 'bar']
        },
        mounted() {
            setTimeout(() => {
                this.obj.foo = 'fooooo'
            }, 1000);
            
            setTimeout(() => {
                this.arr.push('baz')
            }, 2000);
        }
    });
</script>
```

1. new Vue 后执行初始化流程，Vue.prototype._init（`src\core\instance\init.js`）中会执行这一句：
    ```js
    Vue.prototype._init = function () {
        initState(vm) // 数据响应式的重点，处理 props、methods、data、computed、watch
    }
    ```

2. initState（`src\core\instance\state.js`）中会执行 initData(vm) 来处理 data

3. initData 做了三件事：
    1. 判重处理，data 对象上的属性不能和 props、methods 对象上的属性相同；
    2. 代理 data 对象上的属性到 vm 实例；
    3. 为 data 对象的上数据设置响应式

    ```js
        /**
         * 做了三件事
        *   1、判重处理，data 对象上的属性不能和 props、methods 对象上的属性相同
        *   2、代理 data 对象上的属性到 vm 实例
        *   3、为 data 对象的上数据设置响应式
        */
        function initData (vm: Component) {
        let data = vm.$options.data
        // 保证后续处理的 data 是一个对象
        // 如果 data 是个函数，就调用它获取到定义的属性
        // 如果 data 的值是用 props 初始化的，所以 getData 里调用了 pushTarget() 和 popTarget() 防止收集冗余的依赖
        data = vm._data = typeof data === 'function'
            ? getData(data, vm)
            : data || {}
        if (!isPlainObject(data)) { // 如果 data 是个对象就报一个警告
            data = {}
            process.env.NODE_ENV !== 'production' && warn(
            'data functions should return an object:\n' +
            'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
            vm
            )
        }
            /**
        * 两件事
        *   1、判重处理，data 对象上的属性不能和 props、methods 对象上的属性相同
        *   2、代理 data 对象上的属性到 vm 实例
        */
        /**
        * 根据 vm.$options.data 选项获取真正想要的数据（注意：此时 vm.$options.data 是函数）
            校验得到的数据是否是一个纯对象
            检查数据对象 data 上的键是否与 props 对象上的键冲突
            检查 methods 对象上的键是否与 data 对象上的键冲突
            在 Vue 实例对象上添加代理访问数据对象的同名属性
            最后调用 observe 函数开启响应式之路
        */
        // 因为 data props methods 都可以通过 vm 代理直接访问，所以它们需要判重处理
        // proxy data on instance
        const keys = Object.keys(data)
        const props = vm.$options.props
        const methods = vm.$options.methods
        let i = keys.length
        while (i--) {
            // 判重处理，data 中的属性不能和 props 和 methods 中的属性重复
            const key = keys[i]
            if (process.env.NODE_ENV !== 'production') {
            if (methods && hasOwn(methods, key)) {
                warn(
                `Method "${key}" has already been defined as a data property.`,
                vm
                )
            }
            }
            if (props && hasOwn(props, key)) {
            process.env.NODE_ENV !== 'production' && warn(
                `The data property "${key}" is already declared as a prop. ` +
                `Use prop default value instead.`,
                vm
            )
            } else if (!isReserved(key)) {
            // 代理 data 中的属性到 vm._data 上，例如 vm.a 其实访问的是 vm._data.a
            proxy(vm, `_data`, key)
            }
        }
        // observe data
        // 为 data 对象上的数据设置响应式
        observe(data, true /* asRootData */)
        }
    ```

4. initData 最后调用了 observe（`src\core\observer\index.js`）。observe 为数据对象创建 Observer 实例

    ```js
    /**
     * 响应式处理的真正入口
    * 为对象创建观察者实例，如果对象已经被观察过，则返回已有的观察者实例，否则创建新的观察者实例
    * @param {*} value 对象 => {}
    * @param asRootData 是否是根上的数据，所谓的根数据对象就是 data 对象
    */
    export function observe (value: any, asRootData: ?boolean): Observer | void {
        if (!isObject(value) || value instanceof VNode) {
            // 非对象和 VNode 实例不做响应式处理
            return
        }
        let ob: Observer | void

        // 如果 value 对象上存在 __ob__ 属性，则表示已经做过观察了，直接返回 __ob__ 属性
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            ob = value.__ob__
        } else if (
            shouldObserve &&
            !isServerRendering() &&
            (Array.isArray(value) || isPlainObject(value)) &&
            Object.isExtensible(value) &&
            !value._isVue
        ) {
            // 这些条件都满足的情况下才会创建 Observer 实例
            // shouldObserve 开关打开
            // !isServerRendering() 不是服务端渲染
            // (Array.isArray(value) || isPlainObject(value)) value 是对象或者数组
            // Object.isExtensible(value) value 必须是可扩展的。三个方法都可以使得一个对象变得不可扩展：Object.preventExtensions()、Object.freeze() 以及 Object.seal()
            // !value._isVue value不是 vue 实例

            // 创建观察者实例
            ob = new Observer(value)
        }
        if (asRootData && ob) {
            ob.vmCount++
        }
        return ob
    }
    ```

5. Observer (`src\core\observer\index.js`) 会分别对对象和数组做处理，并且递归地调用 oberve 对深层的对象或数组做处理。

    ```js
    /**
     * const data = {
         a: 1
        }

        这样的对象被 Observer 处理后，变成如下

        const data = {
        a: 1,
        // __ob__ 是不可枚举的属性
        __ob__: {
            value: data, // value 属性指向 data 数据对象本身，这是一个循环引用
            dep: dep实例对象, // new Dep()
            vmCount: 0
        }
        }

    */
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

6. 其中对于数组，会生成继承自 Array.prototype 的新原型，然后在新原型上添加增强后的 7 个可以改变原数组的变异方法（push pop shift unshift splice sort reverse），然后将数据的原型修改为这个新原型，这样对于这个数组来说，它的 7 个数组方法就被增强方法覆盖了。

    下面是 `src\core\observer\array.js`


    ```js
    // 复写增强数组原型方法，使其具有依赖通知更新的能力
    // 数组 原型对象
    const arrayProto = Array.prototype
    // 通过继承的方式创建新的 arrayMethods
    export const arrayMethods = Object.create(arrayProto)

    // 操作数组的七个方法，这七个方法可以改变数组自身
    const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
    ]

    /**
     * Intercept mutating methods and emit events
     */
    /**
     * 拦截变异方法并触发事件
     */
    methodsToPatch.forEach(function (method) {
    // cache original method
    const original = arrayProto[method]

    // def 就是 Object.defineProperty，拦截 arrayMethods.method 的访问
    def(arrayMethods, method, function mutator (...args) {
        // 先执行原生方法拿到结果，比如 push.apply(this, args)
        const result = original.apply(this, args)
        const ob = this.__ob__
        let inserted
        // 如果 method 是以下三个之一 push unshift splice，说明是新插入了元素
        switch (method) {
        case 'push':
        case 'unshift':
            inserted = args
            break
        case 'splice':
            inserted = args.slice(2)
            break
        }
        // 如果新增了元素，对新插入的元素做响应式处理
        if (inserted) ob.observeArray(inserted)
        // notify change
        ob.dep.notify() // 手动触发更新
        return result
    })
    })

    ```

    下面是 protoAugment 和 copyAugment （`src\core\observer\index.js`）


    ```js
        // 用增强的数组原型方法覆盖默认的原型方法，之后再执行那七个改变数组自身的方法时就具有了依赖通知更新的能力，以达到数组响应式的目的
        function protoAugment (target, src: Object) {
            /* eslint-disable no-proto */
            target.__proto__ = src
            /* eslint-enable no-proto */
        }

        /**
         * Augment a target Object or Array by defining
         * hidden properties.
         */
        /* istanbul ignore next */
        //将增强的数组方法直接用 Object.defineProperty定义到数组上
        function copyAugment (target: Object, src: Object, keys: Array<string>) {
            for (let i = 0, l = keys.length; i < l; i++) {
                const key = keys[i]
                def(target, key, src[key])
            }
        }
    ```

7. 对于对象，会调用 defineReactive （`src\core\observer\index.js`） 针对对象的每一个属性设置 getter 和 setter。

    ```js
    /**
     * 拦截 obj[key] 的读取和设置操作：
    *   1、在第一次读取时收集依赖，比如执行 render 函数生成虚拟 DOM 时会有读取操作
    *   2、在更新时设置新值并通知依赖更新
    */
    // shallow 参数，是否深度监测
    export function defineReactive (
    obj: Object,
    key: string,
    val: any,
    customSetter?: ?Function,
    shallow?: boolean
    ) {
        // 实例化 dep，一个 key 一个 dep
        const dep = new Dep()

        // 获取 obj[key] 的属性描述符，发现它是不可配置对象的话直接 return
        const property = Object.getOwnPropertyDescriptor(obj, key)
        if (property && property.configurable === false) {
            return
        }

        // cater for pre-defined getter/setters
        // 记录原始 getter 和 setter，获取 val 值
        //一个对象的属性很可能已经是一个访问器属性了，所以该属性很可能已经存在 get 或 set 方法。由于接下来会使用 Object.defineProperty 函数重新定义属性的 setter/getter，这会导致属性原有的 set 和 get 方法被覆盖，所以要将属性原有的 setter/getter 缓存，并在重新定义的 set 和 get 方法中调用缓存的函数，从而做到不影响属性的原有读写操作。

        const getter = property && property.get
        const setter = property && property.set

        // https://github.com/vuejs/vue/pull/7302
        // 为什么要这样判断：(!getter || setter)
        // 因为有可能用户定义的 data 中的属性原本就是拥有 getter 的，如下：
        /**
        *  const data = {}
            Object.defineProperty(data, 'getterProp', {
                enumerable: true,
                configurable: true,
                get: () => {
                return {
                    a: 1
                }
                }
            })

            const ins = new Vue({
                data,
                watch: {
                'getterProp.a': () => {
                    console.log('这句话不会输出')
                }
                }
            })

            属性 getterProp 是一个拥有 get 拦截器函数的访问器属性，而当 Vue 发现该属性拥有原本的 getter 时，是不会深度观测的。

            那么为什么当属性拥有自己的 getter 时就不会对其深度观测了呢？有两方面的原因，
            第一：由于当属性存在原本的 getter 时在深度观测之前不会取值，所以在深度观测语句执行之前取不到属性值从而无法深度观测。
            第二：之所以在深度观测之前不取值是因为属性原本的 getter 由用户定义，用户可能在 getter 中做任何意想不到的事情，这么做是出于避免引发不可预见行为的考虑。

        */
        if ((!getter || setter) && arguments.length === 2) {
            val = obj[key]
        }
        // 递归调用，处理 val 即 obj[key] 的值为对象的情况，保证对象中的所有 key 都被观察
        let childOb = !shallow && observe(val)

        /**
        *
            const data = {
            a: {
                b: 1
            }
            }
            observe(data)

            经过处理后变成如下数据：

            const data = {
            a: {
                b: 1
                __ob__: {a, dep, vmCount}
            }
            __ob__: {data, dep, vmCount}
            }

            // 属性 a 通过 setter/getter 通过闭包引用着 dep 和 childOb
            // 属性 b 通过 setter/getter 通过闭包引用着 dep 和 childOb
            // 这里需要注意 a 通过闭包引用的 childOb 就是 data.a.__ob__
            // 而 b 通过闭包引用的 childOb 是 undefined

        */
        // 响应式核心
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            // get 拦截对 obj[key] 的读取操作，做两件事：1.返回正确的属性值，2.收集依赖
            get: function reactiveGetter () {
            // 正确地返回属性值
            const value = getter ? getter.call(obj) : val
            /**
            * Dep.target 为 Dep 类的一个静态属性，值为 watcher，在实例化 Watcher 时会被设置
            * 实例化 Watcher 时会执行 new Watcher 时传递的回调函数（computed 除外，因为它懒执行）
            * 而回调函数中如果有 vm.key 的读取行为，则会触发这里的 读取 拦截，进行依赖收集
            * 回调函数执行完以后又会将 Dep.target 设置为 null，避免这里重复收集依赖
            */
            if (Dep.target) {
                // 依赖收集，在 dep 中添加 watcher，也在 watcher 中添加 dep
                dep.depend()
                // 对于上面举的例子，对于属性 a 来说，childOb 就是 data.a.__ob__
                // 所以 childOb.dep 就是 data.a.__ob__.dep
                // 也就是说依赖不仅要收集到 a 自己的 dep 里，也要收集到 a.__ob__.dep 里
                // 这样做的原因是因为 a.dep 和 a.__ob__.dep 里的依赖，触发更新的时机是不同的
                // 第一个触发的时机就是当 a 属性的值被改变的时候，即触发 a 的 setter 的 dep.notify()
                // 而第二个触发的时机是 $set 或 Vue.set 给对象添加新属性时触发

                /**
                * Vue.set(data.a, 'c', 1)
                * 这样设置新的属性 c 后，之所以可以触发更新，是因为其中触发了 data.a.__ob__.dep.notify()，Vue.set 代码简化后如下：
                *
                * Vue.set = function (obj, key, val) {
                    defineReactive(obj, key, val)
                    obj.__ob__.dep.notify()
                }

                所以 __ob__ 属性以及 __ob__.dep 的主要作用是为了添加、删除属性时有能力触发依赖更新，而这就是 Vue.set 或 Vue.delete 的原理。
                */
                if (childOb) {
                childOb.dep.depend()
                // 如果是 obj[key] 是 数组，则触发数组响应式
                if (Array.isArray(value)) {
                    // 为数组项为对象的项添加依赖
                    dependArray(value)
                }
                }
            }
            return value
            },
            // set 拦截对 obj[key] 的设置新值的操作，做了两件事：1.设置新值，2.触发依赖更新
            set: function reactiveSetter (newVal) {
            // 旧的 obj[key]
            const value = getter ? getter.call(obj) : val
            /* eslint-disable no-self-compare */
            // 如果新老值一样，则直接 return，不触发响应式更新过程（判断了新老值都是 NaN 的情况）
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            /* eslint-enable no-self-compare */
            if (process.env.NODE_ENV !== 'production' && customSetter) {
                // customSetter 用来打印辅助信息
                // initRender 中在定义 vm.$attrs 和 vm.$listeners 这两个属性的时候传递了这个参数
                customSetter()
            }
            // setter 不存在说明该属性是一个只读属性，直接 return
            // #7981: for accessor properties without setter
            if (getter && !setter) return
            // 设置新值
            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal
            }
            // 需要深度监测的时候，对新值进行观察，让新值也是响应式的，并且覆盖 childOb 为新的 __ob__ 对象
            childOb = !shallow && observe(newVal)
            // 当响应式数据更新时，依赖通知更新
            dep.notify()
            }
        })
    }
    ```

8. 将 data 中数据变成响应式的到这里就处理结束了。接下来是依赖收集的过程。组件初始化结束后，会执行 $mount 挂载流程。其中会调用 调用 mountComponent （`src\core\instance\lifecycle.js`）。mountComponent 中对当前组件新建一个对应的渲染 watcher，传入 updateComponent 方法作为参数

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

9. new Wacher() 初始化 watcher 实例的时候，首先会将 Dep.target 设置为当前渲染 watcher 以便于后续收集依赖的时候能够找到当前 watcher 引用，然后会调用刚才传入的 updateComponent，于是会先执行 vm._render() 去生成 vnode。下面是当前组件的 render 函数：

    ```js
    ƒ anonymous(
    ) {
        with(this){return _c('div',{attrs:{"id":"demo"}},[_c('p',[_v(_s(obj.foo))]),_v(" "),_l((arr),function(a){return _c('div',{key:a},[_v("\n            "+_s(a)+"\n        ")])})],2)}
    }
    ```

    render 函数调用的时候就会触发 data 中数据的 getter。

10. 数据的 getter 触发后，收集依赖，dep 会加入到 watcher 的 newDeps 数组中，watcher 会加入到 dep.subs 数组中。

    ```js
    // getter
    {
        get: function () {
            dep.depend()
        }
    }

    // depend

    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }

    // addDep
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
    ```

    这样依赖收集就结束了

11. 接着是触发更新的操作。如果数组调用了 7 个变异方法，或者对象改变了某一个已存在属性的值，那么都会调用这一句：

    ```js
    dep.notify()
    ```

    会通过每个属性的 dep 的 subs 数组找到数据会影响的 watcher ，然后调用 watcher.update 方法，watcher.updata 会调用 queueWatcher

    ```js
        // dep.notify()
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

        // watcher.update()
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
    ```

12. queueWatcher （`src\core\observer\scheduler.js`） 将维护一个存放 watcher 的队列，然后定义了一个 flushSchedulerQueue 函数，flushSchedulerQueue 用于清空 watcher 队列，依次调用 watcher.run 去更新。然后将 flushSchedulerQueue 传递给 nextTick 方法，让其在本轮事件循环结束之前被调用（微任务）

    ```js
    /**
    * 将 watcher 放入 watcher 队列 
    */
    export function queueWatcher (watcher: Watcher) {
        const id = watcher.id
        // 如果 watcher 已经存在，则跳过，不会重复入队
        if (has[id] == null) {
            // 缓存 watcher.id，用于判断 watcher 是否已经入队
            has[id] = true
            // 如果 flushing = false，表示当前 watcher 队列没有被刷新，watcher 直接入队
            if (!flushing) {
                queue.push(watcher)
            } else {
            // watcher 队列已经被刷新了，这时候 watcher 入队就需要特殊操作一下
            // 从队列末尾开始倒序遍历，根据当前 watcher.id 找到它大于的 watcher.id 的位置，然后将自己插入到该位置之后的下一个位置
            // 即将当前 watcher 放入已排序的队列中，且队列仍是有序的
            // if already flushing, splice the watcher based on its id
            // if already past its id, it will be run next immediately.
                let i = queue.length - 1
                while (i > index && queue[i].id > watcher.id) {
                    i--
                }
                queue.splice(i + 1, 0, watcher)
            }
            // queue the flush
            if (!waiting) {
            // waiting 为 false 时，表示当前浏览器异步任务队列中没有 flushSchedulerQueue 函数
            waiting = true

            if (process.env.NODE_ENV !== 'production' && !config.async) {
                // 同步执行，直接刷新调度队列
                // 一般不会走这儿，Vue 默认是异步执行，如果改为同步执行，性能会大打折扣
                flushSchedulerQueue()
                return
            }

            /**
            * 熟悉的 nextTick => vm.$nextTick、Vue.nextTick
            *   1、将 回调函数（flushSchedulerQueue） 放入 callbacks 数组
            *   2、通过 pending 控制向浏览器任务队列中添加 flushCallbacks 函数
            */
            nextTick(flushSchedulerQueue)
            }
        }
    }
    ```

13. nextTick（`src\core\util\next-tick.js`）将 flushSchedulerQueue 用 try catch 包装后加入 callbacks，然后使用 promise 启动一个微任务，将 flushCallbacks 函数放入微任务中，flushCallbacks 在本轮循环结束之前被调用，会去遍历 callbacks 数组，然后调用其中函数，也就是 flushSchedulerQueue 被调用，每一个 watcher.run 被触发，然后重新执行 updateComponent，重新生成 vnode 然后走 patch 流程 

    ```js
    function flushCallbacks () {
      pending = false
      const copies = callbacks.slice(0)
      callbacks.length = 0
      // 遍历 callbacks 数组，执行其中存储的每个 flushSchedulerQueue 函数
      for (let i = 0; i < copies.length; i++) {
        copies[i]()
      }
    }
    
    /**
    * 完成两件事：
    *   1、用 try catch 包装 flushSchedulerQueue 函数，然后将其放入 callbacks 数组
    *   2、如果 pending 为 false，表示现在浏览器的任务队列中没有 flushCallbacks 函数
    *     如果 pending 为 true，则表示浏览器的任务队列中已经被放入了 flushCallbacks 函数，
    *     待执行 flushCallbacks 函数时，pending 会被再次置为 false，表示下一个 flushCallbacks 函数可以进入
    *     浏览器的任务队列了
    * pending 的作用：保证在同一时刻，浏览器的任务队列中只有一个 flushCallbacks 函数
    * @param {*} cb 接收一个回调函数 => flushSchedulerQueue
    * @param {*} ctx 上下文
    * @returns 
    */

    // Vue.nextTick(function () { xxx }) 
    export function nextTick (cb?: Function, ctx?: Object) {
        let _resolve
        // 将传入 nextTick 的回调函数用 try catch 包装一层，方便异常捕获
        // 然后将包装后的函数放到 callbacks 数组里
        callbacks.push(() => {
            if (cb) {
                try {
                    cb.call(ctx)
                } catch (e) {
                    handleError(e, ctx, 'nextTick')
                }
            } else if (_resolve) { // 如果 cb 不是函数，说明是 nextTick().then(() => {}) 的调用形式，调用 _resolve 触发之后的 then 执行
                _resolve(ctx)
            }
        })
        // pending 为 false，执行 timerFunc
        // 在浏览器的任务队列中（首选微任务队列）放入 flushCallbacks 函数
        if (!pending) {
            pending = true
            timerFunc()
        }
        // $flow-disable-line
        if (!cb && typeof Promise !== 'undefined') { // 没有 cb 生成 promise 存下 resolve 供给 callbacks 中的回调去触发 then 执行
            return new Promise(resolve => {
                _resolve = resolve
            })
        }
    }

    ```


### nextTick 的作用和原理

1. nextTick 是 vue 提供的一个全局 API，由于 vue 的异步更新策略导致我们对数据的修改不会立刻体现在 dom 变化上，此时如果想要立即获取更新后的 dom 状态，就需要使用这个方法。
2. vue 在更新 dom 的时候是异步执行的。只要监测到数据变化，vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 dom 操作是非常重要的。nextTick 方法会在队列中加入一个回调函数，确保函数在前面的 dom 操作完后才调用。
3. 所以当我们想在修改数据后立刻看到 dom 执行结果就需要使用 nextTick
4. 使用场景，1. 比如点击一个按钮后，让一个有内容的隐藏的 div 显示，这时候想拿到这个 div 的宽度，就需要把获取宽度的操作放在 nextTick 里；2. 比如点击按钮后，让一个隐藏的 input 输入框显示，然后使它获取焦点，这时候就需要 nextTick



nextTick 函数的作用相当于 setTimeout(fn, 0)，这里有几个概念需要了解一下，即调用栈、任务队列、事件循环，javascript 是一种单线程的语言，它的一切都是建立在以这三个概念为基础之上的。

任务队列并非只有一个队列，可以将其分为 microtask（微任务） 和 task（宏任务）。当调用栈空闲后每次事件循环只会从 task 中读取一个任务并执行，而在同一次事件循环内会将 microtask 队列中所有的任务全部执行完毕，且要先于下一次 task。另外 task 中两个不同的任务之间可能穿插着 UI 的重渲染，那么我们只需要在 microtask 中把所有在 UI 重渲染之前需要更新的数据全部更新，这样只需要一次重渲染就能得到最新的 DOM 了。恰好 Vue 是一个数据驱动的框架，如果能在 UI 重渲染之前更新所有数据状态，这对性能的提升是一个很大的帮助，所有要优先选用 microtask 去更新数据状态而不是 task，这就是为什么不使用 setTimeout 的原因，因为 setTimeout 会将回调放到 task 队列中而不是 microtask 队列，所以理论上最优的选择是使用 Promise，当浏览器不支持 Promise 时再降级为 setTimeout。

vue 代码对微任务的降级兼容处理：

1. 优先使用 Promise，Promise 的 then 回调会被放入浏览器 microtask（微任务） 队列中执行。
2. 如果不支持 Promise，使用 MutationObserver
3. 否则 setImmediate
4. 如果以上都不支持，使用 setTimeout

## update 生命周期更新顺序

如果子组件数据改变影响到了父组件，或者父组件数据改变影响到了子组件，那么它们的渲染 watcher 都入队列，并且按照 id 升序排列，id 小的是父组件，大的是子组件。flushSchedulerQueue 的时候遍历 watcher 队列，先调用父组件的 watcher.before() 触发 beforeUpdate 生命周期钩子，然后再触发子组件的 beforeUpdate。等到遍历调用 watcher.run() 结束了，这时候遍历 watcher 队列数组，注意这里是从队列结尾处往回遍历，所以是先子后父调用 update。

所以父子组件数据都被改变的时候，它们的 update 生命周期顺序：

父 beforeUpdate
子 beforeUpdate
子 updated
父 updated

## 题目

第一题

```html
<div id="demo">
    <p id="p1">{{foo}}</p>
</div>
<script>
    const app = new Vue({
        el: '#demo',
        data: { 
            foo: 'ready~~'
        },
        mounted() {
            this.foo = Math.random()
            console.log('1:' + this.foo);
            this.foo = Math.random()
            console.log('2:' + this.foo);
            this.foo = Math.random()
            console.log('3:' + this.foo);

            console.log('p1.innerHTML:' + p1.innerHTML)
            
            this.$nextTick(() => {
                console.log('p1.innerHTML:' + p1.innerHTML)
            })
        }
    });
</script>
```

<details>
<summary>答案</summary>

```js
    const app = new Vue({
        el: '#demo',
        data: { 
            foo: 'ready~~'
        },
        mounted() {
            this.foo = Math.random()
            console.log('1:' + this.foo);
            this.foo = Math.random()
            console.log('2:' + this.foo);
            this.foo = Math.random()
            console.log('3:' + this.foo);

            console.log('p1.innerHTML:' + p1.innerHTML) // 'ready~~'
            
            this.$nextTick(() => {
                console.log('p1.innerHTML:' + p1.innerHTML) // 第三次的随机值
            })
        }
    });
```
</details>
<br><br>

第二题

```html
<div id="demo">
    <p id="p1">{{foo}}</p>
</div>
<script>
    const app = new Vue({
        el: '#demo',
        data: { 
            foo: 'ready~~'
        },
        mounted() {
            this.foo = Math.random()
            console.log('1:' + this.foo);
            this.foo = Math.random()
            console.log('2:' + this.foo);
            
            this.$nextTick(() => {
                console.log('p1.innerHTML:' + p1.innerHTML)
            })

            this.foo = Math.random()
            console.log('3:' + this.foo);

            console.log('p1.innerHTML:' + p1.innerHTML)
            
        }
    });
</script>
```

<details>
<summary>答案</summary>

```js
    const app = new Vue({
        el: '#demo',
        data: { 
            foo: 'ready~~'
        },
        mounted() {
            this.foo = Math.random()
            console.log('1:' + this.foo);
            this.foo = Math.random()
            console.log('2:' + this.foo);
            
            this.$nextTick(() => {
                console.log('p1.innerHTML:' + p1.innerHTML) // 第三子的随机值
            })
            
            this.foo = Math.random()
            console.log('3:' + this.foo);

            console.log('p1.innerHTML:' + p1.innerHTML) // 'ready~~'
            
        }
    });
```
</details>
<br><br>

第三题


```html
<div id="demo">
    <p id="p1">{{foo}}</p>
</div>
<script>
    const app = new Vue({
        el: '#demo',
        data: { 
            foo: 'ready~~'
        },
        mounted() {
            this.$nextTick(() => {
                console.log('p1.innerHTML:' + p1.innerHTML)
            })


            this.foo = Math.random()
            console.log('1:' + this.foo);
            this.foo = Math.random()
            console.log('2:' + this.foo);
            this.foo = Math.random()
            console.log('3:' + this.foo);

            console.log('p1.innerHTML:' + p1.innerHTML)
            
        }
    });
</script>
```

<details>
<summary>答案</summary>

```js
    const app = new Vue({
        el: '#demo',
        data: { 
            foo: 'ready~~'
        },
        mounted() {
            this.$nextTick(() => {
                console.log('p1.innerHTML:' + p1.innerHTML) // 'ready~~'
            })


            this.foo = Math.random()
            console.log('1:' + this.foo);
            this.foo = Math.random()
            console.log('2:' + this.foo);
            this.foo = Math.random()
            console.log('3:' + this.foo);

            console.log('p1.innerHTML:' + p1.innerHTML) // 'ready~~'
            
        }
    });
```
</details>
<br><br>

第四题

```html
<div id="demo">
    <p id="p1">{{foo}}</p>
</div>
<script>
    const app = new Vue({
        el: '#demo',
        data: { 
            foo: 'ready~~'
        },
        mounted() {


            this.foo = Math.random()
            console.log('1:' + this.foo);
            this.foo = Math.random()
            console.log('2:' + this.foo);
            this.foo = Math.random()
            console.log('3:' + this.foo);

            Promise.resolve().then(() => {
                console.log('promise:' + p1.innerHTML)
            })
            
            this.$nextTick(() => {
                console.log('p1.innerHTML:' + p1.innerHTML)
            })
            
        }
    });
</script>
```


<details>
<summary>答案</summary>

```js
const app = new Vue({
    el: '#demo',
    data: { 
        foo: 'ready~~'
    },
    mounted() {


        this.foo = Math.random()
        console.log('1:' + this.foo);
        this.foo = Math.random()
        console.log('2:' + this.foo);
        this.foo = Math.random()
        console.log('3:' + this.foo);

        Promise.resolve().then(() => {
            console.log('promise:' + p1.innerHTML) // 第三次随机值
        })
        
        this.$nextTick(() => {
            console.log('p1.innerHTML:' + p1.innerHTML) // 第三次随机值
        })

        // 先打印 $nextTick 再打印 Promise.resolve().then()
        
    }
});
```
</details>
<br><br>