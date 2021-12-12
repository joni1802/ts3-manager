import Cookies from "js-cookie";

const state = {
  serverId: 0,
  serverList: [],
  serverHostBannerUrls: {},
  token: Cookies.get("token"),
  loading: 0,
  connected: false,
  queryUser: {},
};

const mutations = {
  setLoading(state, val) {
    state.loading = val;
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
  setServerList(state, list) {
    state.serverList = list;
  },
  setServerHostBannerUrl(state, { sid, bannerUrl }) {
    // to do
  },
};

const actions = {
  startLoading({ commit, state }) {
    commit("setLoading", state.loading + 1);
  },
  stopLoading({ commit, state }) {
    setTimeout(() => {
      commit("setLoading", state.loading - 1);
    }, 0);
  },
  saveToken({ commit, rootState }, token) {
    Cookies.set("token", token, {
      expires: rootState.settings.rememberLogin
        ? new Date(2147483647 * 1000)
        : "",
    });

    commit("setToken", token);
  },
  removeToken({ commit }) {
    Cookies.remove("token");

    commit("setToken", null);
  },
  saveServerId({ commit, rootState }, sid) {
    Cookies.set("serverId", sid, {
      expires: rootState.settings.rememberLogin
        ? new Date(2147483647 * 1000)
        : "",
    });

    commit("setServerId", sid);
  },
  removeServerId({ commit }) {
    Cookies.remove("serverId");

    commit("setServerId", null);
  },
  clearConnection({ commit, rootState, dispatch }) {
    commit("isConnected", false);
    dispatch("removeServerId");
    commit("saveUserInfo", {});

    if (!rootState.settings.rememberLogin) dispatch("removeToken");
  },
  saveConnection({ commit, dispatch }, { serverId, queryUser, token }) {
    commit("isConnected", true);

    if (serverId) dispatch("saveServerId", serverId);
    if (queryUser) commit("saveUserInfo", queryUser);
    if (token) dispatch("saveToken", token);
  },
};

export default {
  state,
  mutations,
  actions,
};
