import io from "socket.io-client";
import Vue from "vue";
import store from "./store";
import router from "./router";
import TeamSpeak from "./api/TeamSpeak";

// Socket connection to the backend
const socket = io(process.env.VUE_APP_WEBSOCKET_URI, {
  autoConnect: false,
  query: {
    token: store.state.query.connected ? store.state.query.token : "",
    serverId: store.state.query.connected ? store.state.query.serverId : ""
  }
});

// Clear all values in local storage and go to the login page
// At login screen the form gets not autofilled.
const logout = () => {
  store.dispatch("clearConnection");

  router.push({name: "login"});
};

// Clear only the connection values in local storage and go to login page.
// At login screen the form gets autofilled.
const resetConnection = () => {
  store.dispatch("resetConnection");

  router.push({name: "login"});
};

// When a connection error occurs logout and redirect to login page
const handleSocketError = err => {
  Vue.prototype.$toast.error(err.message || err);

  resetConnection();
};

const handleTeamSpeakError = message => {
  Vue.prototype.$toast.error(message);

  logout();
};

// Register socket.io events
socket.on("reconnect", () => {
  Vue.prototype.$toast.clearQueue();

  let currentToast = Vue.prototype.$toast.getCmp();

  if (currentToast) currentToast.close(); // Removes the error toast
});

socket.on("disconnect", resetConnection);
socket.on("error", handleSocketError);
socket.on("connect_error", handleSocketError);
socket.on("teamspeak-error", handleTeamSpeakError);
socket.on("teamspeak-reconnected", queryUser => {
  store.dispatch("saveConnection", {queryUser, connected: true});

  TeamSpeak.registerAllEvents();
});

export default socket;
