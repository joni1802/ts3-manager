const state = {
  serverId: undefined,
  token: "",
  loading: false,
  connected: false,
  queryUser: {},
  rememberLogin: true
};

const mutations = {
  isLoading(state, status) {
    state.loading = status;
  },
  saveUserInfo(state, userData) {
    state.queryUser = userData;
  },
  saveToken(state, token) {
    state.token = token;
  },
  isConnected(state, status) {
    state.connected = status;
  },
  setServerId(state, id) {
    state.serverId = id;
  }
};

const actions = {
  clearConnection({commit, rootState}) {
    commit("isConnected", false);
    commit("setServerId", null);
    commit("saveUserInfo", {});

    if (!rootState.settings.rememberLogin) commit("saveToken", "");
  },
  saveConnection({commit}, {serverId, queryUser, token}) {
    commit("isConnected", true);

    if (serverId) commit("setServerId", serverId);
    if (queryUser) commit("saveUserInfo", queryUser);
    if (token) commit("saveToken", token);
  }
};

export default {
  state,
  mutations,
  actions
};
