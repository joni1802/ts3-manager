<template>
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-list two-line>
            <v-subheader>Theme</v-subheader>
            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="darkMode"></v-switch>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Dark Mode</v-list-tile-title>
                <v-list-tile-sub-title>Enables the dark theme</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    computed: {
      darkMode: {
        get() {
          return this.$store.state.settings.darkMode
        },
        set(value) {
          this.$store.commit('setDarkMode', value)
        }
      }
    }
  }
</script>
