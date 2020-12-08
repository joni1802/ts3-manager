/****************************************************
  !!! THE ORDER OF THE IMPORTED MODULES MATTERS !!! *
      The TeamSpeak instance needs to be imported   *
      before the store, router and socket.          *
 ****************************************************/
import "./assets/css/style.css"

import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import Toasted from 'vue-toasted'
import "nprogress/nprogress.css";
import NProgress from "nprogress";
import Clipboard from "v-clipboard";

import TeamSpeak from "./api/TeamSpeak";
import "./registerServiceWorker";

import store from "./store";
import router from "./router";
import socket from "./socket";

NProgress.configure({
  showSpinner: false
});

Vue.use(Clipboard);

Vue.use(Toasted, {
  singleton: true,
  duration: 4000,
  action: {
   text: 'close',
   onClick: (e, toast) => {
     toast.goAway(0)
   }
 }
})

Vue.config.productionTip = false;

// Connect to websocket server
socket.open();

// Adding instance properties which are often used in components
Vue.prototype.$socket = socket;
Vue.prototype.$TeamSpeak = TeamSpeak;

// Render app
new Vue({
  render: h => h(App),
  router,
  store,
  vuetify
}).$mount("#app");
