import io from "socket.io-client";
import Vue from "vue";
import store from "./store";
import router from "./router";

let connectErrorToast = {};
let connectErrorShown = false;

// Socket connection to the backend
const socket = io(process.env.VUE_APP_WEBSOCKET_URI, {
  withCredentials: true,
  autoConnect: false,
});

// Go to login screen and set connection state to false
const handleLogout = () => {
  store.commit("isConnected", false);

  if (router.currentRoute.name !== "login") {
    router.push({ name: "login" });
  }
};

socket.on("connectError", (err) => {
  if (!connectErrorShown) {
    connectErrorToast = Vue.prototype.$toast.error(err.message, {
      duration: 0,
    });

    connectErrorShown = true;

    handleLogout();
  }
});

socket.on("connect", () => {
  if (connectErrorShown) {
    connectErrorToast.dismiss();

    Vue.prototype.$toast.success("Reconnected");

    connectErrorShown = false;
  }
});

socket.on("disconnect", handleLogout);

export default socket;
