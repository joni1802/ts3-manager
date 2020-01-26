<template>
<v-app :dark="$store.state.settings.darkMode">
  <app-shell></app-shell>
  <v-content>
    <router-view></router-view>
  </v-content>
</v-app>
</template>

<script>
export default {
  components: {
    AppShell: () => import('@/components/AppShell')
  }
}
</script>
