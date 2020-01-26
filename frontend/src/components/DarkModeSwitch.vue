<template>
<v-btn icon @click="toggleDarkMode">
  <v-icon v-if="$store.state.settings.darkMode">mdi-white-balance-sunny</v-icon>
  <v-icon v-else>mdi-weather-night</v-icon>
</v-btn>
</template>

<script>
export default {
  methods: {
    toggleDarkMode() {
      let darkModeState = !this.$store.state.settings.darkMode

      this.$store.commit('setDarkMode', darkModeState)
    }
  }
}
</script>
