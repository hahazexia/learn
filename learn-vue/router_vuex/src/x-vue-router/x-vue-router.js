let Vue

class VueRouter {
  constructor(options) {
    // 保存路由选项
    this.$options = options
    // 给 current 一个初始值
    this.current = window.location.hash.slice(1) || '/'
    // 将 current 变成一个响应式数据
    Vue.util.defineReactive(
      this,
      'matched',
      []
    )
    // match 可以递归路由表，获取匹配关系的数组
    this.match()
    // 监控 hash 变化
    window.addEventListener('hashchange', () => {
      this.current = window.location.hash.slice(1)
      this.matched = []
    }, false)
  }

  match(routes) {
    routes = routes || this.$options.routes

    for (const route of routes) {
      if (route.path === '/' && this.current === '/') {
        this.matched.push(route)
        return
      }

      if (route.path !== '/' && this.current.indexOf(route.path) !== -1) {
        this.matched.push(route)
        if (route.children) {
          this.match(route.children)
        }
        return
      }
    }
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
      // 标记自己是 router-view
      this.$vnode.data.routerView = true

      let depth = 0
      let parent = this.$parent

      while (parent) {
        const vnodeData = parent.$vnode && parent.$vnode.data
        if (vnodeData && vnodeData.routerView) {
          depth++
        }
        parent = parent.$parent
      }

      let component
      // 获取当前 url 的 hash 部分
      const route = this.$router.matched[depth]
      if (route) {
        component = route.component
      }
      // 根据 hash 获取对应组件
      return h(component)
    }
  })
}

export default VueRouter
