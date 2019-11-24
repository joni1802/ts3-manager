import Vue from 'vue'
import Vuetify, {VSnackbar, VIcon, VBtn} from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify, {
  iconfont: 'mdi',
  // md = material icons from google
  // mdi = material icons from google and the community
  components: {
    // the components which Toast.vue used
    // See https://github.com/eolant/vuetify-toast-snackbar/issues/6
    VIcon,
    VSnackbar,
    VBtn
  }
})
