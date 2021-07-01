let Vue

class VueRouter {
  constructor(options) {
    // 保存路由选项
    this.$options = options
    // 给 current 一个初始值
    // this.current = window.location.hash.slice(1) || '/'
    // 将 current 变成一个响应式数据
    Vue.util.defineReactive(
      this,
      'current',
      window.location.hash.slice(1) || '/'
    )
    // 监控 hash 变化
    window.addEventListener('hashchange', () => {
      this.current = window.location.hash.slice(1)
    }, false)
  }
}

// 参数一 Vue 构造函数
VueRouter.install = function (_Vue) {
  Vue = _Vue
  // 注册 $router 所有组件都可以访问它
  // 混入 Vue.mixin()
  Vue.mixin({
    beforeCreate() {
      // 延迟执行： 延迟到 router 实例和 Vue 实例都创建完毕
      if (this.$options.router) {
        // 如果存在说明是跟实例
        Vue.prototype.$router = this.$options.router
      }
    }
  })

  // 注册两个全局组件 router-link router-view

  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render(h) {
      // <a href="#/home"></a>
      return h('a', {
        attrs: {
          href: '#' + this.to
        }
      },
      this.$slots.default)
    }
  })
  Vue.component('router-view', {
    render(h) {
      let component
      // 获取当前 url 的 hash 部分
      const route = this.$router.$options.routes.find(route => route.path === this.$router.current)
      if (route) {
        component = route.component
      }
      // 根据 hash 获取对应组件
      return h(component)
    }
  })
}

export default VueRouter
