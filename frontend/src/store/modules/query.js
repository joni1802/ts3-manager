const state = {
  queryUser: {},
  serverId: null,
  token: "",
  loading: false,
  connected: false
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
  clearConnection({commit}) {
    commit("isConnected", false);
    commit("saveToken", "");
    commit("setServerId", null);
  },
  resetConnection({commit}) {
    commit("isConnected", false);
    commit("setServerId", null);
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
