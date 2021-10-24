<template lang="html">
  <v-container>
    <v-row justify="center">
      <v-col cols="3">
        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-icon size="48">info</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>Version</v-list-item-title>
                <v-list-item-subtitle>3.6.7</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-icon size="48">info</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>Version</v-list-item-title>
                <v-list-item-subtitle>3.6.7</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-icon size="48">info</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>Version</v-list-item-title>
                <v-list-item-subtitle>3.6.7</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" xl="9">
        <dashboard-client-history
          :logView="logView"
          :loaded="logViewLoaded"
          :days="days"
          @change-days="changeDays"
        ></dashboard-client-history>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" xl="6">
        <dashboard-connection-time
          :logView="logView"
          :loaded="logViewLoaded"
          :days="days"
          @change-days="changeDays"
        ></dashboard-connection-time>
      </v-col>
      <v-col cols="12" xl="3">
        <dashboard-clients-online
          :clientList="clientList"
          :serverInfo="serverInfo"
        ></dashboard-clients-online>
      </v-col>
      <!-- <v-col cols="12" xl="3" lg="4" md="6">
        <dashboard-server-info :serverInfo="serverInfo"></dashboard-server-info>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script>
/**
 * The dashboard is a work in progress and maybe will be replaced by another solution.
 * The following problems need to be addressed:
 * - flooding issues when downloading all logs files
 * - long loading times
 * - logs are removed when restarten the server */

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
      lastPosition: undefined,
      selectedDays: 30, // to-do: sync with both child components
      currentDate: new Date(),
      clientDbList: [],
      clientDbListLoaded: false,
      clientList: [],
      serverInfo: {},
      days: [
        { text: "Last 30 Days", value: 30 },
        { text: "Last 60 Days", value: 60 },
        { text: "Last 90 Days", value: 90 },
      ],
    };
  },
  computed: {
    // endDate() {
    //   // start date can be replaced by new Date()
    //   return new Date(
    //     this.startDate.getTime() - this.selectedDays * 24 * 60 * 60 * 1000
    //   );
    // },
  },
  methods: {
    async changeDays(days, fn) {
      let endDate = new Date(
        this.currentDate.getTime() - days * 24 * 60 * 60 * 1000
      );
      // save the last (current) position in the log file
      let lastPosition = this.lastPosition;

      let parsedLogView = await this.getParsedLogView(endDate);

      if (parsedLogView.length) {
        this.logView = [...this.logView, ...parsedLogView];
      } else {
        // reset the position to the save one
        this.lastPosition = lastPosition;
      }

      // send new log view to the child component
      fn(this.logView);
    },
    getLocaleDate(timestamp) {
      let localeDate = new Date(timestamp);
      let milliseconds =
        localeDate.getTime() + -localeDate.getTimezoneOffset() * 60 * 1000;

      localeDate.setTime(milliseconds);

      return localeDate;
    },
    getParsedLogEntry(line) {
      let [timestamp, level, channel, sid, ...msg] = line.split("|");

      return {
        timestamp: this.getLocaleDate(timestamp),
        level: level.trim(),
        channel: channel.trim(),
        sid: parseInt(sid),
        msg: msg.join("|"),
      };
    },
    async getParsedLogView(endDate) {
      let parsedLogView = [];
      let stop = false;

      try {
        while (!stop) {
          let rawLogView = await this.$TeamSpeak.execute("logview", {
            instance: 0,
            reverse: 1,
            lines: 100,
            begin_pos: this.lastPosition,
          });

          for (let { l } of rawLogView) {
            let parsedLogEntry = this.getParsedLogEntry(l);

            if (endDate.getTime() > parsedLogEntry.timestamp.getTime()) {
              stop = true;
            } else {
              parsedLogView.push(parsedLogEntry);
            }
          }

          this.lastPosition = rawLogView[0].last_pos;

          if (this.lastPosition === 0) stop = true;
        }
      } catch (err) {
        this.$toast.error(err.message);
      }

      return parsedLogView;
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

      let endDate = new Date(
        this.currentDate.getTime() - this.selectedDays * 24 * 60 * 60 * 1000
      );

      this.logView = await this.getParsedLogView(endDate);

      this.logViewLoaded = true;

      // await sleep(1000);

      // this.clientList = await this.getClientList();

      // this.serverInfo = await this.getServerInfo();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
  async mounted() {},
};
</script>

<style lang="css" scoped></style>
