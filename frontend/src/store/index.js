import Vuex from 'vuex'
import Vue from 'vue'
import VuexPersistence from 'vuex-persist'
import connection from './modules/connection'
import settings from './modules/settings'

// Vuex with VuexPersistence. The state gets saved as an json object inside localStorage.
// See "https://github.com/championswimmer/vuex-persist#readme"
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    connection,
    settings
  },
  plugins: [new VuexPersistence().plugin]
})
