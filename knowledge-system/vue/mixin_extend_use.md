# use extend mixin

## Vue.use

Vue.use 用于安装插件。可以传对象或者函数，如果是对象，必须有名为 install 的方法。如果是函数，函数本身就会被作为 install 方法。插件安装后会被缓存，多次安装同一个插件只会被安装一次。

下面是源码 `src\core\global-api\use.js`

```js
/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  /**
 * 定义 Vue.use，负责为 Vue 安装插件，做了以下两件事：
 *   1、判断插件是否已经被安装，如果安装则直接结束
 *   2、安装插件，执行插件的 install 方法
 * @param {*} plugin install 方法 或者 包含 install 方法的对象
 * @returns Vue 实例
 */
  // 本质就是在执行插件的 install 方法
  Vue.use = function (plugin: Function | Object) {
    // 不会重复注册同一个组件
    // 已经安装过的插件列表
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 判断 plugin 是否已经安装，保证不重复安装
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
  // 将 Vue 实例放到第一个参数位置，然后将这些参数传递给 install 方法
    const args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      // plugin 是一个对象，则执行其 install 方法安装插件
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // 执行直接 plugin 方法安装插件
      plugin.apply(null, args)
    }
    // 在 已安装插件列表中 添加新安装的插件
    installedPlugins.push(plugin)
    return this
  }
}

```

## Vue.extend

Vue.extend 使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。

其实注册全局组件 Vue.component() 或者注册局部组件（在组件选项中设置 components 属性，值是局部组件组成的对象）其内部都调用了 Vue.extend。

下面是源码 `src\core\global-api\extend.js`

```js
/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
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
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}

```

* Vue.component 其实就是调用 Vue.extend 生成组件的构造函数，这个构造函数继承自 Vue，是 Vue 的子类。得到子类后，将子类放入 Vue.options.components 全局 options 中，这样项目中所有组件在初始化的时候，都会调用 mergeOptions 将 Vue.options 这个全局 options 合并入自己的 option 中，这就是为什么全局组件可以在任何组件中使用的原因。

* 对于局部注册的组件，当走 $mount 流程的时候，生成 vnode 时会调用 render 函数，然后执行 _createElement， _createElement 中判断 tag 如果是保留标签，就创建对应的 vnode，如果不是就可能是组件，会去从 vm.$options.components 中拿到对应的构造函数，如果这个组件是全局组件，那么这时候获取到的就是子类构造函数，如果是局部组件，这时候获取到的就是组件对应的 option，然后调用 createComponent。createComponent 中用 Vue.extend 创建了局部注册组件的子类构造函数（全局组件在 Vue.component 调用的时候就已经生成子类构造函数了，这里处理的是局部组件）。然后安装了组件钩子函数，这些钩子函数用于组件的初始化，更新和销毁

## Vue.mixin mixins

* Vue.mixin 全局注册一个混入，影响注册之后所有创建的每个 Vue 实例。
* mixins 选项接收一个混入对象的数组。这些混入对象可以像正常的实例对象一样包含实例选项，这些选项将会被合并到最终的选项中。mixins 钩子按照传入顺序依次调用，并在调用组件自身的钩子之前被调用。


`src\core\global-api\mixin.js`

```js
/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  /**
 * 定义 Vue.mixin，负责全局混入选项，影响之后所有创建的 Vue 实例，这些实例会合并全局混入的选项
 * @param {*} mixin Vue 配置对象
 * @returns 返回 Vue 实例
 */
  Vue.mixin = function (mixin: Object) {
    // 在 Vue 的默认配置项上合并 mixin 对象
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}

```

init 初始化阶段会调用 mergeOptions 将组件自己的选项和 Vue.options 基础选项合并

`src\core\util\options.js`

```js
// mergeOptions 中有这样一句
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {


  // 处理原始 child 对象上的 extends 和 mixins，分别执行 mergeOptions，将这些继承而来的选项合并到 parent
  // mergeOptions 处理过的对象会含有 _base 属性
  if (!child._base) {
    // { extend } 和 mixin 很类似，让你基于一个组件去扩展另外一个，不需要使用 Vue.extend
    // 任何写在 mixins 中的选项，都会使用 mergeOptions 中相应的合并策略进行处理，这就是 mixins 的实现方式
    // 对于 extends 选项，与 mixins 相同，甚至由于 extends 选项只能是一个对象，而不能是数组，反而要比 mixins 的实现更为简单，连遍历都不需要。
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

}
```

这就是 mixins 钩子在调用组件自身的钩子之前被调用的原因，因为 mergeOptions 先处理了 mixins，然后才去处理选项中其他值。