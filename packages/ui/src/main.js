/****************************************************
  !!! THE ORDER OF THE IMPORTED MODULES MATTERS !!! *
      The TeamSpeak instance needs to be imported   *
      before the store, router and socket.          *
 ****************************************************/
import "./assets/css/style.css";

import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import "nprogress/nprogress.css";
import NProgress from "nprogress";
import Clipboard from "v-clipboard";

import TeamSpeak from "./api/TeamSpeak";
import "./registerServiceWorker";
import i18n from "./i18n";

import store from "./store";
import router from "./router";
import socket from "./socket";

(async () => {
  NProgress.configure({
    showSpinner: false,
  });

  Vue.use(Clipboard);

  Vue.use(VueToast, {
    position: "top",
    duration: 4000,
  });

  Vue.config.productionTip = false;

  // Connect to websocket server
  socket.open();

  if (!store.state.query.loggedOut) {
    try {
      await TeamSpeak.reconnect();
    } catch (err) {
      console.log(err);
    }
  }

  // Adding instance properties which are often used in components
  Vue.prototype.$socket = socket;
  Vue.prototype.$TeamSpeak = TeamSpeak;

  // Render app
  new Vue({
    render: (h) => h(App),
    router,
    store,
    vuetify,
    i18n,
  }).$mount("#app");
})();
