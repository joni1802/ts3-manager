import Vue from 'vue'
import router from '../../router'

const state = {
  connected: false,
  token: '',
  serverId: null
}

const mutations = {
  saveToken(state, token) {
    state.token = token
  },
  isConnected(state, status) {
    state.connected = status
  },
  setServerId(state, id) {
    state.serverId = id
  }
}

const actions = {
  clearConnection({commit}) {
    commit('isConnected', false)
    commit('saveToken', '')
    commit('setServerId', undefined)
  }
}

export default {
  state,
  mutations,
  actions
}
