// import Vue from 'vue'
// import App from './App.vue'
// import router from './router'
// import store from './store'

// Vue.config.productionTip = false

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
// import store from './store'

export function createApp () {
  const router = createRouter();
  const app = new Vue({
    router,
    render: h => h(App)
  })
  return { app, router }
}
