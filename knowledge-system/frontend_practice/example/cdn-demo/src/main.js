const Vue = window.Vue;
import App from './App.vue'
import VueI18n from 'vue-i18n';
import { parseParam } from './util'

// cdn 引入写法，iview 在 window 上
Vue.use(window.iview);
const mergeZH = Object.assign({}, window.iview.langs['zh-CN']);
const mergeEN = Object.assign({}, window.iview.langs['en-US']);
const mergeTW = Object.assign({}, window.iview.langs['zh-TW']);

Vue.use(VueI18n);
Vue.locale = () => {};

const params = parseParam(location.href);
const lang = params ? params.lang : 'zh-CN';

const i18n = new VueI18n({
  locale: lang,
  messages: {
    'zh-CN': mergeZH,
    'en-US': mergeEN,
    'zh-TW': mergeTW,
  },
});
Vue.config.lang = lang;

Vue.config.productionTip = false

new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')
