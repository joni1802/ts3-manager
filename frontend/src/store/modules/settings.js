const state = {
  darkMode: false,
  rememberLogin: true
};

const mutations = {
  setDarkMode(state, status) {
    state.darkMode = status;
  },
  setRememberLogin(state, status) {
    state.rememberLogin = status;
  }
};

const actions = {
  enableDarkMode({commit}) {
    commit("setDarkMode", true);
  }
};

export default {
  state,
  mutations,
  actions
};
