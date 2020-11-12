<template>
<v-btn icon @click="toggleDarkMode">
  <v-icon v-if="$vuetify.theme.dark">mdi-white-balance-sunny</v-icon>
  <v-icon v-else>mdi-weather-night</v-icon>
</v-btn>
</template>

<script>
export default {
  methods: {
    toggleDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    }
  }
}
</script>
