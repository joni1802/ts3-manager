<template lang="html">
  <v-container>
    <v-layout>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-row align="center">
              <v-col cols="3" xl="1">
                <v-checkbox
                  v-model="levels.critical"
                  label="Critical"
                ></v-checkbox>
              </v-col>
              <v-col cols="3" xl="1">
                <v-checkbox v-model="levels.errors" label="Errors"></v-checkbox>
              </v-col>
              <v-col cols="3" xl="1">
                <v-checkbox
                  v-model="levels.warning"
                  label="Warning"
                ></v-checkbox>
              </v-col>
              <v-col cols="3" xl="1">
                <v-checkbox v-model="levels.info" label="Info"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6" xl="3">
                <v-select
                  :items="timezones"
                  v-model="selectedTimezone"
                  label="Timestamp"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" xl="4">
                <v-text-field label="Filter" v-model="filter"></v-text-field>
              </v-col>
              <v-col cols="12" xl="1">
                <v-btn color="primary">Reload</v-btn>
              </v-col>
            </v-row>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :items="parsedLogView"
              :headers="headers"
              :no-data-text="
                $store.state.query.loading ? '...loading' : $vuetify.noDataText
              "
              hide-default-footer
              :search="filter"
              :items-per-page="itemsPerPage"
            >
              <!-- <template #item.level="{ item }">
                <v-chip :color="levelColors[item.level.toLowerCase()]">{{
                  item.level
                }}</v-chip>
              </template> -->
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-row justify="center">
              <v-btn color="primary" @click="loadMoreLogs">Load More</v-btn>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      logView: [],
      lastPosition: undefined,
      itemsPerPage: -1,
      filter: "",
      headers: [
        {
          text: "Timestamp",
          value: "timestamp",
          sortable: false,
        },
        {
          text: "Level",
          value: "level",
          sortable: false,
        },
        {
          text: "Channel",
          value: "channel",
          sortable: false,
        },
        {
          text: "Message",
          value: "msg",
          sortable: false,
        },
      ],
      levels: {
        critical: true,
        errors: true,
        warnings: true,
        info: true,
      },
      levelColors: {
        critical: "error",
        errors: "error",
        warnings: "#ffb86c",
        info: "info",
      },
      selectedTimezone: "local",
      timezones: [
        {
          text: "UTC Time",
          value: "utc",
        },
        {
          text: "Locale Time",
          value: "local",
        },
      ],
    };
  },
  computed: {
    /**
     * Parse original log string into a javascript object.
     * @return {Array}
     */
    parsedLogView() {
      let parsedLogView = this.logView.map(({ l }) => {
        let [timestamp, level, channel, sid, ...msg] = l.split("|");

        return {
          timestamp:
            this.selectedTimezone === "utc"
              ? this.getUTCDateString(timestamp)
              : this.getLocaleDateString(timestamp),
          level: level.trim(),
          channel: channel.trim(),
          sid: parseInt(sid),
          /** @see {@link https://github.com/joni1802/ts3-manager/issues/26} */
          msg: msg.join("|"),
        };
      });

      // Filter array by level#
      return parsedLogView.filter((log) => {
        switch (log.level.toLowerCase()) {
          case "critical":
            return this.levels.critical;
          case "errors":
            return this.levels.errors;
          case "warnings":
            return this.levels.warnings;
          case "info":
            return this.levels.info;
        }
      });
    },
  },
  methods: {
    /**
     * Get max. 100 lines from the log. Start at the last returned position.
     * @return {Array} 100 log lines
     */
    async getLogView() {
      return this.$TeamSpeak.execute("logview", {
        instance: 0,
        reverse: 1,
        lines: 100,
        begin_pos: this.lastPosition,
      });
    },

    /**
     * Load the next 100 logs lines.
     */
    async loadMoreLogs() {
      try {
        let moreLogs = await this.getLogView();

        this.logView.push(...moreLogs);
      } catch (err) {
        this.$toast.error(err.message);
      }
    },

    /**
     * Add the local timezone offset to the Javascript date object.
     * The TeamSpeak timestamp is always the UTC time.
     * The problem is that the constructor of the Javascript date object always creates date in the locale time.
     * This method adds the timezone offset to the date object and returns it.
     * @param  {string} timestamp UTC timestamp from TeamSpeak
     * @return {Object}           Javascript Date object
     */
    getLocaleDate(timestamp) {
      let localeDate = new Date(timestamp);
      let milliseconds =
        localeDate.getTime() + -localeDate.getTimezoneOffset() * 60 * 1000;

      localeDate.setTime(milliseconds);

      return localeDate;
    },
    getUTCDateString(timestamp) {
      let date = this.getLocaleDate(timestamp);

      let year = date.getUTCFullYear();
      let month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
      let day = date.getUTCDate().toString().padStart(2, "0");

      let hours = date.getUTCHours().toString().padStart(2, "0");
      let minutes = date.getUTCMinutes().toString().padStart(2, "0");
      let seconds = date.getUTCSeconds().toString().padStart(2, "0");

      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
    },
    getLocaleDateString(timestamp) {
      let date = this.getLocaleDate(timestamp);

      let year = date.getFullYear();
      let month = (date.getMonth() + 1).toString().padStart(2, "0");
      let day = date.getDate().toString().padStart(2, "0");

      let hours = date.getHours().toString().padStart(2, "0");
      let minutes = date.getMinutes().toString().padStart(2, "0");
      let seconds = date.getSeconds().toString().padStart(2, "0");

      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
    },
  },
  async created() {
    try {
      this.logView = await this.getLogView();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
  watch: {
    /**
     * Save the last returned log position.
     */
    logView(logView) {
      this.lastPosition = logView[logView.length - 1].last_pos;
    },
  },
};
</script>

<style lang="css" scoped></style>
