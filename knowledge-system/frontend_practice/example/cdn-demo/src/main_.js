import Vue from 'vue'
import App from './App.vue'
import VueI18n from 'vue-i18n';
import { parseParam } from './util'

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import twLocale from 'view-design/src/locale/lang/zh-TW';
import zhLocale from 'view-design/src/locale/lang/zh-CN';
import enLocale from 'view-design/src/locale/lang/en-US';


Vue.use(ViewUI);

const mergeZH = Object.assign({}, zhLocale);
const mergeEN = Object.assign({}, enLocale);
const mergeTW = Object.assign({}, twLocale);


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
