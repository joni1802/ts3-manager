import io from "socket.io-client";
import Vue from "vue";
import store from "./store";
import router from "./router";

// Socket connection to the backend
const socket = io(process.env.VUE_APP_WEBSOCKET_URI, {
  autoConnect: false,
  query: store.state.query.connected && {
    token: store.state.query.token,
    // Send an empty string instead of null because null is converted to a string by the websocket
    serverId: store.state.query.serverId ? store.state.query.serverId : ""
  }
});

// When a connection error occurs logout and redirect to login page
const handleSocketError = err => {
  Vue.prototype.$toasted.error(err.message || err, {
    timeout: 0,
    dismissable: false,
    queueable: true, // toast is not getting overwritten
    icon: "error_outline"
  });

  // Do not clear token to make reconnection possible
  store.commit("isConnected", false);

  router.push({name: "login"});
};

// Register socket.io events
socket.on("reconnect", () => {
  Vue.prototype.$toasted.clearQueue();

  let currentToast = Vue.prototype.$toasted.getCmp();

  if (currentToast) currentToast.close(); // Removes the error toast
});

socket.on("error", handleSocketError);
socket.on("connect_error", handleSocketError);

export default socket;
