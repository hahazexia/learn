import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from './x-vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    counter: 0
  },
  mutations: {
    add(state) {
      state.counter++
    }
  },
  actions: {
    add({ commit }) {
      setTimeout(() => {
        commit('add')
      }, 1000)
    }
  },
  modules: {
  },
  getters: {
    counter: state => state.counter
  }
})
