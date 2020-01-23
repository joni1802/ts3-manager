<template>
<v-app :dark="$store.state.settings.darkMode">
  <side-menu v-if="validPage"></side-menu>
  <v-content>
    <router-view></router-view>
  </v-content>
</v-app>
</template>

<script>
export default {
  components: {
    SideMenu: () => import('@/components/SideMenu')
  },
  computed: {
    validPage() {
      if (this.$route.name === 'login' || this.$route.name === '404') {
        return false
      } else {
        return true
      }
    }
  },
}
</script>
