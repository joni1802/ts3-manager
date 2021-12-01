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
import Clipboard from "v-clipboard";

import TeamSpeak from "./api/TeamSpeak";
import "./registerServiceWorker";

import store from "./store";
import router from "./router";
import socket from "./socket";

(async () => {
  Vue.use(Clipboard);

  Vue.use(VueToast, {
    position: "top",
    duration: 4000,
  });

  Vue.config.productionTip = false;

  // Connect to websocket server
  socket.open();

  if (store.state.query.connected) {
    try {
      await TeamSpeak.reconnect();
      await TeamSpeak.init();
    } catch (err) {
      Vue.prototype.$toast.error(err.message);
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
  }).$mount("#app");
})();
