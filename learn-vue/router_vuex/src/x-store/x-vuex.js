
let Vue

class Store {
  constructor(options) {
    // 保存选项
    this._mutations = options.mutations
    this._actions = options.actions
    // 暴露一个 state 属性，并对 state 选项做响应式处理
    // Vue.util.defineReactive(this, 'state', this.$options.state)

    // this.state = new Vue({
    //   data() {
    //     return options.state
    //   }
    // })

    this._vm = new Vue({
      data() {
        return {
          // 加上 $$ 避免对该属性做代理
          $$state: options.state
        }
      }
    })

    // 绑定上下文，确保是 store 实例
    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }

  get state() {
    return this._vm._data.$$state
  }

  set state(t) {
    console.error('please use commit to change state')
  }

  // $store.commit(type, payload)
  commit(type, payload) {
    const entry = this._mutations[type]
    if (!entry) console.error(`mutation ${type} is not defined`)

    entry(this.state, payload)
  }

  dispatch(type, payload) {
    const entry = this._actions[type]
    if (!entry) console.error(`actions ${type} is not defined`)

    entry(this, payload)
  }
}

function install(_Vue) {
  Vue = _Vue

  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {
  Store,
  install
}
