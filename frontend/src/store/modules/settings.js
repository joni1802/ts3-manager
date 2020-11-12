const state = {
  rememberLogin: true,
  notifications: true
};

const mutations = {
  setRememberLogin(state, status) {
    state.rememberLogin = status;
  },
  setNotifications(state, status) {
    state.notifications = status
  }
};

export default {
  state,
  mutations,
};
