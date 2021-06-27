<template lang="html">
  <v-container>
    <v-row>
      <v-col cols="12">
        <dashboard-client-history
          :logView="logView"
          :loaded="logViewLoaded"
          :days="daysPicker"
          @change-days="testEvent"
        ></dashboard-client-history>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" xl="6" lg="8">
        <dashboard-connection-time
          :logView="logView"
          :loaded="logViewLoaded"
        ></dashboard-connection-time>
      </v-col>
      <v-col cols="12" xl="3" lg="4" md="6">
        <dashboard-clients-online
          :clientList="clientList"
          :serverInfo="serverInfo"
        ></dashboard-clients-online>
      </v-col>
      <v-col cols="12" xl="3" lg="4" md="6">
        <dashboard-server-info :serverInfo="serverInfo"></dashboard-server-info>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import sleep from "@/utils/sleep";

export default {
  components: {
    DashboardClientHistory: () => import("@/components/DashboardClientHistory"),
    DashboardConnectionTime: () =>
      import("@/components/DashboardConnectionTime"),
    DashboardClientsOnline: () => import("@/components/DashboardClientsOnline"),
    DashboardServerInfo: () => import("@/components/DashboardServerInfo"),
  },
  data() {
    return {
      logView: [],
      logViewLoaded: false,
      clientDbList: [],
      clientDbListLoaded: false,
      clientList: [],
      serverInfo: {},
      daysPicker: [
        { text: "Last 30 Days", value: 30 },
        { text: "Last 60 Days", value: 60 },
        { text: "Last 90 Days", value: 90 },
        { text: "All Days", value: 0 },
      ],
    };
  },
  methods: {
    testEvent(e) {
      console.log(e);
    },
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

      return logView;

      let index = logView.findIndex(
        (log) => log.timestamp.getTime() <= date.getTime()
      );

      return logView.slice(0, index);
    },
    getClientList() {
      return this.$TeamSpeak.execute("clientlist", {}, ["-voice", "-away"]);
    },
    getServerInfo() {
      return this.$TeamSpeak.execute("serverinfo").then((res) => res[0]);
    },
  },
  async created() {
    try {
      // await sleep(1000); // just for debuging

      let date = new Date();

      // Show log messages of the last 30 days
      // date.setDate(date.getDate() - 30);
      date.setDate();

      this.logView = await this.getLogView(date);
      // this.logView = await this.getLogView();

      this.logViewLoaded = true;

      // await sleep(1000);

      this.clientList = await this.getClientList();

      this.serverInfo = await this.getServerInfo();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
  async mounted() {},
};
</script>

<style lang="css" scoped></style>
