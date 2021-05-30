<template lang="html">
  <v-card>
    <v-card-title>Client Connections History</v-card-title>
    <v-card-text>
      <canvas v-if="loaded" ref="chart" height="200"></canvas>
      <span v-else>Loading Data...</span>
    </v-card-text>
  </v-card>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  props: {
    logView: Array,
    loaded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    clientConnections() {
      let obj = {};
      let regex =
        /^client connected \'(?<clientNickname>.*)\'\(id:(?<clientDbId>.*)\).*$/;

      let temp = this.logView
        .reverse()
        // filters all "client connected" log messages
        .filter(({ msg }) => regex.test(msg))
        // parse log messages into an object {clientDbId, clientNickname, timestamp}
        .map(({ msg, timestamp }) => ({
          ...msg.match(regex).groups,
          timestamp,
        }))
        // // order log messages by date {2021-03-21: [{clientDbId, clientNickname, timestamp}]}
        .reduce((acc, log) => {
          let dateString = `${log.timestamp.getFullYear()}-${
            log.timestamp.getMonth() + 1
          }-${log.timestamp.getDate()}`;

          if (!acc[dateString]) {
            acc[dateString] = [];
          }

          let foundClient = acc[dateString].find(
            (log2) => log2.clientDbId === log.clientDbId
          );

          if (!foundClient) {
            acc[dateString].push(log);
          }

          return acc;
        }, {});

      for (let prop in temp) {
        obj[prop] = temp[prop].length;
      }

      return obj;
    },
  },
  methods: {
    renderChart() {
      let chart = new Chart(this.$refs.chart, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Unique Client Connections",
              backgroundColor: "#ff79c6",
              borderColor: "#ff79c6",
              data: this.clientConnections,
              cubicInterpolationMode: "monotone",
              color: "rgb(255, 99, 132)",
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              grid: {
                // color: "#282a36",
              },
              // beginAtZero: true,
            },
            x: {
              grid: {
                // color: "#282a36",
              },
            },
          },
        },
      });
    },
  },
  mounted() {
    let watchLogView = this.$watch(
      "loaded",
      (loaded) => {
        if (loaded) {
          this.renderChart();
        }
      },
      {
        immediate: true,
      }
    );
  },
};
</script>

<style lang="css" scoped></style>
