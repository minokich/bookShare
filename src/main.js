// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase'
import Vuex from 'vuex'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.use(Vuex)
Vue.config.productionTip = false

const config = {
//そのままじゃ動かんで
//YOU の 値を 入れちゃいなYO
};
firebase.initializeApp(config);

const firestore = firebase.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

const store = new Vuex.Store({
  state: {
    count: 0,
    msg: 'mogeeeeeeee',
    isLogin: false,
  },
  mutations: {
    increment (state) {
      state.count++
    },
    updateState (state, bool){
      state.isLogin = bool;
    },
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
