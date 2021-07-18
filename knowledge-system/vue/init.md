# 初始化

问：new Vue() 的时候都发生了什么？

* 需要去看源码中的 `src\core\instance\init.js` 文件

<details>
<summary>点击查看代码</summary>


```js
// 负责 Vue 的初始化过程
  Vue.prototype._init = function (options?: Object) {
    // vue 实例
    const vm: Component = this
    // a uid
    // 每个 vue 实例都有一个 _uid，并且是依次递增的
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    // 处理组件配置项
    if (options && options._isComponent) { // 组件的情况下 合并options
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      /**
       * 每个子组件初始化时走这里，这里只做了一些性能优化
       * 将组件配置对象上的一些深层次属性放到 vm.$options 选项中，以提高代码的执行效率
       */
      // 性能优化， 减少原型链的动态查找，提高执行效率
      initInternalComponent(vm, options)
    } else {

      /**
       * 初始化根组件时走这里，合并 Vue 的全局配置到根组件的局部配置，比如 Vue.component 注册的全局组件会合并到 根实例的 components 选项中
       *
       * 组件选项合并,发生在三个地方：
       * 1. Vue.component(CompName, Comp) 做了选项合并，合并的 Vue 内置的全局组件和用户自己注册的全局组件，最终都会放到全局的 components 选项
       * 2. {components: xxx} 局部注册，执行编译生成的 render 函数时做了选项合并，会合并全局配置项到组件局部配置项上
       * 3. 这里的根组件的情况
       *
       */
      // 当 new 一个 vue 实例的时候，如果用户传入了自定义的 option，则最终会使用默认的合并策略，被合并到 $options 上
      /**
       *new Vue({
          customOption: 'foo',
          created: function () {
            console.log(this.$options.customOption) // => 'foo'
          }
        })
       */
      // 另外，我们可以在 Vue.config.optionMergeStrategies 中设置针对自定义 option 的自定义合并策略
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {}, // 用户 new Vue 的时候传入的 options
        vm
      )
      // 第一次 new Vue 的时候会调用 mergeOptions 合并配置
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      // 设置代理，将 vm 实例上的属性代理到 vm._renderProxy
      // initProxy 的目的，就是设置渲染函数的作用域代理，其目的是为我们提供更好的提示信息
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化组件实例关系属性，比如 $parent、$children、$root、$refs 等
    initLifecycle(vm)
    /**
     * 初始化自定义事件，这里需要注意一点，所以我们在 <comp @click="handleClick" /> 上注册的事件，监听者不是父组件，
     * 而是子组件本身，也就是说事件的派发和监听者都是子组件本身，和父组件无关。最后触发和监听会变成 this.$emit() 和 this.$on() 的形式
     */
    initEvents(vm)
    // 1. 解析组件的插槽信息，得到 vm.$slot，2. 处理渲染函数，定义 this._c  就是 createElement 方法，即 h 函数 3. vm.$attrs vm.listeners
    initRender(vm)
    callHook(vm, 'beforeCreate') // 调用 beforeCreate 生命周期函数
    // 初始化组件的 inject 配置项，得到 result[key] = val 形式的配置对象，然后对结果数据进行响应式处理，并代理每个 key 到 vm 实例
    initInjections(vm) // resolve injections before data/props
    initState(vm) // 数据响应式的重点，处理 props、methods、data、computed、watch
    // 解析组件配置项上的 provide 对象，将其挂载到 vm._provided 属性上
    // 总结 provide inject 实现原理
    // inject 并没有将属性真正注入子组件，而是子组件向上一层层去找到对应的key
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created') // 调用 created 生命周期函数

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) { // 如果发现配置项上有 el 选项，则自动调用 $mount 方法，也就是说有了 el 选项，就不需要再手动调用 $mount，反之，没有 el 则必须手动调用 $mount
      vm.$mount(vm.$options.el)
    }
  }
```
</details>
<br><br>


* 初始化组件实例关系属性，比如 $parent、$children、$root、$refs 等
* 初始化自定义事件
  1. 解析组件的插槽信息，得到 vm.$slot
  2. 处理渲染函数，定义 this._c  就是 createElement 方法，即 h 函数
  3. vm.$attrs vm.listeners
* 调用 beforeCreate 生命周期函数
* 初始化组件的 inject 配置项
* 处理数据响应式， props、methods、data、computed、watch
* 解析组件配置项上的 provide 对象
* 用 created 生命周期函数