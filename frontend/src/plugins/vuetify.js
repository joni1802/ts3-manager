import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import '@mdi/font/css/materialdesignicons.css';
import store from '@/store';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    dark: store.state.settings.darkMode,
    themes: {
      light: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
      dark: {
        primary: '#bd93f9',
        secondary: '#44475a',
        accent: '#6272a4',
        error: '#ff5555',
        info: '#8be9fd',
        success: '#50fa7b',
        warning: '#f1fa8c',
      }
    }
  }
});
