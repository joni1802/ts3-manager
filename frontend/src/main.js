/****************************************************
  !!! THE ORDER OF THE IMPORTED MODULES MATTERS !!! *
      The TeamSpeak instance needs to be imported   *
      before the store, router and socket.          *
 ****************************************************/

import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import VuetifyToast from 'vuetify-toast-snackbar'
import 'nprogress/nprogress.css'
import NProgress from 'nprogress'

import TeamSpeak from './api/TeamSpeak'
import './registerServiceWorker'

import store from './store'
import router from './router'
import socket from './socket'

NProgress.configure({
  showSpinner: false
})

// More infos => https://github.com/eolant/vuetify-toast-snackbar
Vue.use(VuetifyToast, {
  classes: ['toast'], // to enable Roboto font (see public/index.html)
})

Vue.config.productionTip = false

// Connect to websocket server
socket.open()

// Adding instance properties which are often used in components
Vue.prototype.$socket = socket
Vue.prototype.$TeamSpeak = TeamSpeak

// Render app
new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
