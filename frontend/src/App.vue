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
  },
  methods: {
    handleReceivedMessages(e) {
      this.$store.dispatch("handleReceivedMessages", e.detail);
    },
    async updateQueryUserData(e) {
      let {client} = e.detail;

      try {
        if (client.clid === this.$store.state.query.queryUser.client_id) {
          let queryUser = await this.$TeamSpeak.execute("whoami").then(list => list[0]);

          this.$store.commit("saveUserInfo", queryUser);
        }
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    addNotificationListeners() {
      this.$TeamSpeak.on("textmessage", this.handleReceivedMessages)
      this.$TeamSpeak.on("clientmove", this.updateQueryUserData)
    }
  },
  created() {
    this.addNotificationListeners()
  },
  watch: {
    "$store.getters.unreadMessages": {
      immediate: true,
      handler(number) {
        document.title = number ? `(${number}) TS3 Manager` : 'TS3 Manager'
      }
    }
  }
}
</script>
