<template>
  <v-app>
    <app-shell></app-shell>
    <v-main>
      <!-- Reload current route when another server is selected -->
      <router-view :key="$store.state.query.serverId"></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  components: {
    AppShell: () => import("@/components/AppShell"),
  },
  methods: {
    handleReceivedMessages(e) {
      this.$store.dispatch("handleReceivedMessages", e.detail);
    },
    async updateQueryUserData(e) {
      let { client } = e.detail;

      try {
        if (client.clid === this.$store.state.query.queryUser.client_id) {
          let queryUser = await this.$TeamSpeak
            .execute("whoami")
            .then((list) => list[0]);

          this.$store.commit("saveUserInfo", queryUser);
        }
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    addNotificationListeners() {
      this.$TeamSpeak.on("textmessage", this.handleReceivedMessages);
      this.$TeamSpeak.on("clientmoved", this.updateQueryUserData);
    },
  },
  created() {
    this.addNotificationListeners();
  },
  watch: {
    "$store.getters.unreadMessages": {
      immediate: true,
      handler(number) {
        document.title = number ? `(${number}) TS3 Manager` : "TS3 Manager";
      },
    },
  },
};
</script>
