import Vuex from "vuex";
import Vue from "vue";
import VuexPersistence from "vuex-persist";
// import connection from "./modules/connection";
import settings from "./modules/settings";
import query from "./modules/query";
import chat from "./modules/chat";
import TeamSpeak from "../api/TeamSpeak";

// Vuex with VuexPersistence. The state gets saved as an json object inside localStorage.
// See "https://github.com/championswimmer/vuex-persist#readme"
Vue.use(Vuex);

const options = {
  modules: ["query", "settings", "chat"] // Modules which are stored in localStorage
};

const store = new Vuex.Store({
  modules: {
    // connection,
    settings,
    query,
    chat
  },
  plugins: [new VuexPersistence(options).plugin]
});

export default store;
