const state = {
  darkMode: false,
  rememberLogin: true,
  notifications: true
};

const mutations = {
  setDarkMode(state, status) {
    state.darkMode = status;
  },
  setRememberLogin(state, status) {
    state.rememberLogin = status;
  },
  setNotifications(state, status) {
    state.notifications = status
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
