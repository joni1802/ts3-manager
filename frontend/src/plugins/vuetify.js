// import Vue from 'vue'
// import Vuetify, {VSnackbar, VIcon, VBtn} from 'vuetify/lib'
// import 'vuetify/src/stylus/app.styl'
// import '@mdi/font/css/materialdesignicons.css'
//
// Vue.use(Vuetify, {
//   iconfont: 'mdi',
//   // md = material icons from google
//   // mdi = material icons from google and the community
//   components: {
//     // the components which Toast.vue used
//     // See https://github.com/eolant/vuetify-toast-snackbar/issues/6
//     VIcon,
//     VSnackbar,
//     VBtn
//   }
// })

//
// import Vue from 'vue'
// import Vuetify, {VSnackbar, VIcon, VBtn} from 'vuetify/lib'
//
// const opts = {
//   // md = material icons from google
//   // mdi = material icons from google and the community
//   iconfont: 'mdi',
//
//   // the components which Toast.vue used
//   // See https://github.com/eolant/vuetify-toast-snackbar/issues/6
//   components: {
//     VIcon,
//     VSnackbar,
//     VBtn
//   }
// }
//
// Vue.use(Vuetify)
//
// export default new Vuetify(opts)
//
//


import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});
