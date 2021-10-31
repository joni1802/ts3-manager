<template>
  <div>
    <h1>Server {{ serverId }}</h1>
    <router-view v-if="joined"></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      serverId: Number(this.$route.params.sid),
      joined: false,
    };
  },
  methods: {
    async useServer() {
      await this.$TeamSpeak.execute("use", { sid: this.serverId });

      this.$store.dispatch("saveServerId", this.serverId);
    },
    registerServerNotifications() {
      return this.$TeamSpeak.registerAllEvents();
    },
  },
  async created() {
    try {
      await this.useServer();

      await this.registerServerNotifications();

      this.joined = true;

      if (this.$route.name === "server") {
        this.$router.replace({ name: "dashboard" });
      }
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
};
</script>
