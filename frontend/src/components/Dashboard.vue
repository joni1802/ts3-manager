<template lang="html">
  <v-container>
    <v-row>
      <v-col cols="12">
        <dashboard-client-history :logView="logView"></dashboard-client-history>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  components: {
    DashboardClientHistory: () => import("@/components/DashboardClientHistory"),
  },
  data() {
    return {
      logView: [],
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
      let lastDate = new Date();

      try {
        while (date.getTime() < lastDate.getTime()) {
          let logs = await this.$TeamSpeak.execute("logview", {
            instance: 0,
            reverse: 1,
            lines: 100,
            begin_pos: lastPosition,
          });

          let parsedLogs = this.getParsedLogs(logs);

          lastPosition = logs[0].last_pos;

          lastDate = parsedLogs[parsedLogs.length - 1].timestamp;

          logView.push(...parsedLogs);
        }
      } catch (err) {
        this.$toast.error(err.message);
      }

      let index = logView.findIndex(
        (log) => log.timestamp.getTime() <= date.getTime()
      );

      return logView.slice(0, index);
    },
  },
  async mounted() {
    try {
      let date = new Date();

      date.setDate(date.getDate() - 30);

      this.logView = await this.getLogView(date);
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
};
</script>

<style lang="css" scoped></style>
