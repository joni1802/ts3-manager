<template>
  <v-menu bottom left>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        v-bind="attrs"
        v-on="on"
        :title="$t('settings.language')"
      >
        <v-icon>mdi-translate</v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="language in availableLanguages"
        :key="language.code"
        @click="changeLanguage(language.code)"
        :class="{ 'v-list-item--active': currentLanguage === language.code }"
      >
        <v-list-item-avatar>
          <v-icon>{{ language.icon }}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ language.name }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="currentLanguage === language.code">
          <v-icon color="primary">mdi-check</v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: 'LanguageSwitcher',
  data() {
    return {
      availableLanguages: [
        {
          code: 'en',
          name: 'English',
          icon: 'mdi-flag'
        },
        {
          code: 'zh',
          name: '中文',
          icon: 'mdi-flag'
        }
      ]
    }
  },
  computed: {
    currentLanguage() {
      return this.$i18n.locale
    }
  },
  methods: {
    changeLanguage(languageCode) {
      this.$i18n.locale = languageCode
      localStorage.setItem('language', languageCode)
      
      // Emit event for other components that might need to react to language change
      this.$emit('language-changed', languageCode)
    }
  }
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
