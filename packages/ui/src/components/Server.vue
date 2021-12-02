<template>
  <div>
    <router-view v-if="joined"></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      serverId: Number(this.$route.params.sid),
      joined: false,
      drawer: null,
    };
  },
  methods: {
    async useServer() {
      await this.$TeamSpeak.execute("use", { sid: this.serverId });

      this.$store.dispatch("saveServerId", this.serverId);
    },
    getServerInfo() {
      return this.$TeamSpeak.execute("serverinfo").then((res) => res[0]);
    },
    registerServerNotifications() {
      return this.$TeamSpeak.registerAllEvents();
    },
    async setServerHostBanner() {
      let { virtualserver_hostbanner_gfx_url: hostBannerUrl } =
        await this.getServerInfo();

      this.$store.dispatch("setServerHostBanner", hostBannerUrl);
    },
    async setServerList() {
      let serverList = await this.$TeamSpeak.execute("serverlist");

      this.$store.commit("setServerList", serverList);
    },
  },
  async created() {
    try {
      // to-do: check selected server id with whoami and set whoami in vuex
      await this.setServerList();

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
  async beforeRouteUpdate(to, from, next) {
    try {
      if (from.params.sid !== to.params.sid) {
        this.joined = false;

        this.serverId = to.params.sid;

        await this.useServer();

        await this.registerServerNotifications();

        this.joined = true;

        if (to.name === "server") {
          next({
            name: "dashboard",
            replace: true,
            params: { sid: this.serverId },
          });
        }

        next();
      }
    } catch (err) {
      this.$toast.error(err.message);
    }

    next();
  },
};
</script>
