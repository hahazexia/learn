# 导航守卫

主要分为三种守卫：

1. 全局守卫：beforeEach beforeResolve afterEach
2. 路由独享守卫：beforeEnter
3. 组件守卫：beforeRouteEnter beforeRouteUpdate beforeRouteLeave


* 一般情况下，传递给守卫的回调函数接收三个参数：to 目标路由，from 离开的路由，next 用来 resolve 当前钩子。
* 如果想要在守卫中使用组件实例，只能使用组件守卫，beforeRouteUpdate 和 beforeRouteLeave 中可以直接访问 this。beforeRouteEnter 不能直接访问 this，需要给 next 函数传递一个回调函数，回调函数会接收一个参数，这个参数是 this。
* afterEach 的回调没有 next 参数。

## 完整的导航解析流程

1. 导航被触发。
2. 在失活的组件里调用 beforeRouteLeave 守卫。
3. 调用全局的 beforeEach 守卫。
4. 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
5. 在路由配置里调用 beforeEnter。
6. 解析异步路由组件。
7. 在被激活的组件里调用 beforeRouteEnter。
8. 调用全局的 beforeResolve 守卫 (2.5+)。
9. 导航被确认。
10. 调用全局的 afterEach 钩子。
11. 触发 DOM 更新。
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。