import Cookies from "js-cookie"

const state = {
  serverId: Cookies.get("serverId"),
  token: Cookies.get("token"),
  loading: false,
  connected: false,
  loggedOut: true,
  queryUser: {},
};

const mutations = {
  isLoading(state, status) {
    state.loading = status;
  },
  saveUserInfo(state, userData) {
    state.queryUser = userData;
  },
  setToken(state, token) {
    state.token = token;
  },
  isConnected(state, status) {
    state.connected = status;
  },
  setServerId(state, id) {
    state.serverId = id;
  },
  isLoggedOut(state, status) {
    state.loggedOut = status
  }
};

const actions = {
  saveToken({commit, rootState}, token) {
    Cookies.set("token", token, {
      expires: rootState.settings.rememberLogin ? new Date(2147483647 * 1000) : ""
    })

    commit("setToken", token)
  },
  removeToken({commit}) {
    Cookies.remove("token")

    commit("setToken", null)
  },
  saveServerId({commit, rootState}, sid) {
    Cookies.set("serverId", sid, {
      expires: rootState.settings.rememberLogin ? new Date(2147483647 * 1000) : ""
    })

    commit("setServerId", sid)
  },
  removeServerId({commit}) {
    Cookies.remove("serverId")

    commit("setServerId", null)
  },
  clearConnection({commit, rootState, dispatch}) {
    commit("isConnected", false);
    dispatch("removeServerId");
    commit("saveUserInfo", {});

    if (!rootState.settings.rememberLogin) dispatch("removeToken");
  },
  saveConnection({commit, dispatch}, {serverId, queryUser, token}) {
    commit("isConnected", true);

    if (serverId) dispatch("saveServerId", serverId);
    if (queryUser) commit("saveUserInfo", queryUser);
    if (token) dispatch("saveToken", token);
  }
};

export default {
  state,
  mutations,
  actions
};
