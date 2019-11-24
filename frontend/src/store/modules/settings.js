const state = {
  darkMode: false
}

const mutations = {
  setDarkMode(state, status) {
    state.darkMode = status
  }
}

const actions = {
  enableDarkMode({commit}) {
    commit('setDarkMode', true)
  }
}

export default {
  state,
  mutations,
  actions
}
