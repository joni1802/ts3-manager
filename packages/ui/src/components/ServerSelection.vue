<template lang="html">
  <v-col cols="6" sm="4" md="3">
    <v-select
      outlined
      :items="serverList"
      item-value="virtualserverId"
      :item-disabled="checkServerStatus"
      hide-details
      :value="selectedSid"
      @click="setServerList"
      @change="switchServer"
      item-text="virtualserverName"
      placeholder="Select A Server"
    >
      <template #item="{ item }">
        {{ item.virtualserverName }} (sid: {{ item.virtualserverId }})
      </template>
    </v-select>
  </v-col>
</template>

<script>
export default {
  data() {
    return {
      serverList: [],
    };
  },
  computed: {
    selectedSid() {
      // Server Id is always a string because it comes from the cookie
      return parseInt(this.$store.state.query.serverId);
    },
  },
  methods: {
    checkServerStatus(server) {
      if (server.virtualserverStatus === "online") {
        return false;
      } else {
        return true;
      }
    },
    getServerList() {
      return this.$TeamSpeak.execute("serverlist");
    },
    // Update serverList on every v-select click because a server status could have been changed in the mean time
    async setServerList() {
      try {
        this.serverList = await this.getServerList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    useServer(sid) {
      return this.$TeamSpeak.execute("use", { sid });
    },
    async switchServer(sid) {
      try {
        // The change event gets fired with the value NaN even if the selected value is disabled
        if (sid) {
          await this.useServer(sid);

          this.$store.dispatch("saveServerId", sid);
        }
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    addServerListener() {
      // Update server list when something changed
      // E.g. when the server name got edited
      this.$TeamSpeak.on("serveredit", this.setServerList);
    },
    removeServerLister() {
      this.$TeamSpeak.__proto__.removeEventListener(
        "serveredit",
        this.setServerList
      );
    },
  },
  async created() {
    this.setServerList();

    this.addServerListener();
  },
  beforeRouteLeave(from, to, next) {
    this.removeServerLister();

    next();
  },
};
</script>

<style lang="css" scoped></style>
