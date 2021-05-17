const state = {
  rememberLogin: true,
  notifications: true,
  darkMode: true,
};

const mutations = {
  setRememberLogin(state, status) {
    state.rememberLogin = status;
  },
  setNotifications(state, status) {
    state.notifications = status;
  },
  setDarkMode(state, status) {
    state.darkMode = status;
  },
};

export default {
  state,
  mutations,
};
