import io from "socket.io-client";
import Vue from "vue";
import store from "./store";
import router from "./router";

// Socket connection to the backend
const socket = io(process.env.VUE_APP_WEBSOCKET_URI, {
  withCredentials: true,
  autoConnect: false,
});

// Go to login screen and set connection state to false
const handleLogout = () => {
  store.commit("isConnected", false);

  router.push({ name: "login" });
};

socket.on("error", (err) => {
  Vue.prototype.$toast.error(err.message);

  handleLogout();
});

socket.on("disconnect", handleLogout);

export default socket;
