import Vuex from "vuex";
import Vue from "vue";

import settings from "./modules/settings";
import query from "./modules/query";
import chat from "./modules/chat";
import avatars from "./modules/avatars";
import uploads from "./modules/uploads";
import TeamSpeak from "../api/TeamSpeak";

import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";

const ls = new SecureLS({ isCompression: false });

// Vuex with VuexPersistence. The state gets saved as an json object inside localStorage.
// See "https://www.npmjs.com/package/vuex-persistedstate"
Vue.use(Vuex);

const store = new Vuex.Store({
  actions: {
    clearStorage({ dispatch, commit }) {
      dispatch("clearConnection");
      commit("removeAllMessages");
    },
  },
  modules: {
    settings,
    query,
    chat,
    avatars,
    uploads,
  },
  plugins: [
    createPersistedState({
      paths: [
        "chat",
        "settings",
        "query.connected",
        "query.queryUser",
        "query.loggedOut",
      ],
      // Encrypt local storage
      storage: process.env.NODE_ENV !== "development" && {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
    }),
  ],
});

export default store;
