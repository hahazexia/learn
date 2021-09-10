# computed 和 watch

## computed

1. 初始化的时候会调用 initState （src\core\instance\state.js），其中会调用 initComputed

2. initComputed 中遍历 vm 组件实例的配置对象中的 computed 配置项（vm.$options.computed），为每一个 computed key 生成一个 watcher，这些 computed watcher 会存入 vm._computedWatchers 数组中。接着代理 computed 中的 key 到 vm 上，这样就可以通过 this 直接访问到 computed 中的值。new 一个 watcher 的时候第二个参数是 computed key 对应的那个函数，第四个参数是对象 {lazy: true}。

3. 因为设置了 {lazy: true} 惰性求值，所以 new watcher 的时候不会立即触发 computed 的求值函数去计算值。同时 lazy 值在 watcher 初始化的时候赋值给了 this.dirty，this.dirty 表示缓存是否可用，如果为 true，表示缓存脏了，需要重新计算，否则不用。this.dirty 默认为 false。dirty 是真正的控制缓存的关键，而 lazy 只是起到一个开启的作用

4. initComputed 中 defineComputed 除了做代理还做了其他事情。主要做三件事：1. 调用 createComputedGetter 生成一个 getter 函数。 2. 如果 set 为空就设置一个默认 set 函数 3. 把 computed key 代理到 vm 上

5. createComputedGetter 生成的 getter 函数，从 vm._computedWatchers 数组获取到 key 对应的 watcher，然后去判断 watcher.dirty，如果为 true 就调用 watcher.evaluate() 重新计算值。然后调用 watcher.depend() 收集依赖。然后返回值。只有两种情况 dirty 为 true，首次初始化的时候 dirty 是 true，所以会计算值，计算完后 dirty 变成 false，第二种情况就是依赖的值改变了，dirty 会变为 true，会重新计算值。

上面是主要源码的分析下面看一个流程

```js
{
    data() {
        return {
            a: 1,
            b: 2
        }
    },
    computed: {
        c() {
            return a + b
        }
    }
}
```

1. 首先页面里会使用 c ，所以会触发 createComputedGetter 生成的 getter 函数，然后判断 watcher.dirty，首次执行 watcher.evaluate
2. watcher.evaluate 执行 this.get ，this.get 里会执行 pushTarget(this) 把当前的 computed watcher push 到stack 里面去，并设置为 Dep.target
3. 然后运行 this.getter.call 也就是运行 computed 对应的函数 return a + b，这时候就会去获取 a 和 b 的值，触发 a 和 b 的 getter ，它们自己的 dep.depend 会去依赖收集，收集到当前 computed watucer
4. 依赖收集完毕之后执行 popTarget()，把当前 computed watcher 从栈清除，返回计算后的 c 值，然后 this.dirty = false
5. watcher.evaluate() 执行完毕，判断 Dep.target，如果存在，就对 computed watcher 里的 dep 进行依赖收集
6. 此后 a 和 b 的都收集了 computed watcher 的依赖，如果 a 和 b 发生改变，都会触发 watcher.update 然后将 this.dirty 设置为 true，这样下一次渲染时用到 c 时就会重新计算


## watch

1. 首先调用 initWatch，其中会遍历 vm.$options.watch 对象，对每一个 key 调用 createWatcher
2. createWatcher 里调用 Vue.prototype.$watch。$watch 里创建 watcher 实例，传递参数 {user: true}。如果设置了 immediate，则立即执行一次 cb，最后返回 unwatch，unwatch 就是调用 watch.teardown 去移除这个 watcher 和对应的所有依赖
3. 当 new watcher 的时候，第二个参数传的是 vm.$options.watch 中对应的 key 值，watcher 初始化的时候会判断，如果是一个字符串 key ，则为其生成一个函数作为 this.getter，比如 watch 的是 data 里的 a 值，那么生成的 this.getter 就如下：

```js
this.getter = function() { return this.a }
```

接着 watcher 初始化就会调用 this.get，然后设置当前 Dep.target 为当前 user watcher，然后调用 this.getter，这时候 a 就会收集到 user watcher 为依赖
4. 之后只要 a 变化了，都会触发自己的 setter，然后去触发 user.watcher 的 update