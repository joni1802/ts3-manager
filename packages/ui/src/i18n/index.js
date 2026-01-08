import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

// Import language files
import en from './locales/en.json'
import zh from './locales/zh.json'

const messages = {
  en,
  zh
}

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem('language') || 'en'

const i18n = new VueI18n({
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages
})

export default i18n
