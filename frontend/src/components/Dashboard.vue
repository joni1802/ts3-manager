<template lang="html">
  <v-container>
    <v-row>
      <v-col cols="12">
        <dashboard-client-history
          :logView="logView"
          :loaded="logViewLoaded"
        ></dashboard-client-history>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <dashboard-clients-online
          :clientDbList="clientDbList"
          :loaded="clientDbListLoaded"
        ></dashboard-clients-online>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import sleep from "@/utils/sleep";

export default {
  components: {
    DashboardClientHistory: () => import("@/components/DashboardClientHistory"),
    DashboardClientsOnline: () => import("@/components/DashboardClientsOnline"),
  },
  data() {
    return {
      logView: [],
      logViewLoaded: false,
      clientDbList: [],
      clientDbListLoaded: false,
    };
  },
  methods: {
    getLocaleDate(timestamp) {
      let localeDate = new Date(timestamp);
      let milliseconds =
        localeDate.getTime() + -localeDate.getTimezoneOffset() * 60 * 1000;

      localeDate.setTime(milliseconds);

      return localeDate;
    },
    getParsedLogs(logs) {
      return logs.map(({ l }) => {
        let [timestamp, level, channel, sid, ...msg] = l.split("|");

        return {
          timestamp: this.getLocaleDate(timestamp),
          level: level.trim(),
          channel: channel.trim(),
          sid: parseInt(sid),
          msg: msg.join("|"),
        };
      });
    },
    async getLogView(date) {
      let logView = [];
      let lastPosition = undefined;
      let lastDate = undefined;
      let stop = false;

      try {
        while (!stop) {
          let logs = await this.$TeamSpeak.execute("logview", {
            instance: 0,
            reverse: 1,
            lines: 100,
            begin_pos: lastPosition,
          });

          let parsedLogs = this.getParsedLogs(logs);

          logView.push(...parsedLogs);

          lastPosition = logs[0].last_pos;
          lastDate = parsedLogs[parsedLogs.length - 1].timestamp;

          if (logs[0].last_pos === 0) stop = true;
          if (lastDate.getTime() < date.getTime()) stop = true;
        }
      } catch (err) {
        this.$toast.error(err.message);
      }

      let index = logView.findIndex(
        (log) => log.timestamp.getTime() <= date.getTime()
      );

      return logView.slice(0, index);
    },
    getClientDbList() {
      return this.$TeamSpeak.fullClientDBList();
    },
  },
  async created() {
    try {
      // await sleep(1000); // just for debuging

      let date = new Date();

      // Show log messages of the last 30 days
      date.setDate(date.getDate() - 30);

      this.logView = await this.getLogView(date);

      this.logViewLoaded = true;

      // await sleep(1000);

      this.clientDbList = await this.getClientDbList();

      this.clientDbListLoaded = true;
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
  async mounted() {},
};
</script>

<style lang="css" scoped></style>
