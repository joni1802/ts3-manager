<template></template>

<script>
export default {
  methods: {
    async leaveServer() {
      await this.$TeamSpeak.execute("use", { sid: 0 });

      this.$store.dispatch("saveServerId", 0);
    },
  },
  async created() {
    try {
      await this.leaveServer();

      this.$router.push({ name: "servers" });
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
};
</script>
