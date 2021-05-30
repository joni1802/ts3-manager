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
  data() {
    return {
      primaryColor: this.$vuetify.theme.currentTheme.primary,
    };
  },
  computed: {
    clientConnections() {
      let obj = {};
      let regex =
        /^client connected \'(?<clientNickname>.*)\'\(id:(?<clientDbId>.*)\).*$/;

      return (
        this.logView
          .reverse()
          // filters all "client connected" log messages
          .filter(({ msg }) => regex.test(msg))
          // parse log messages into an object {clientDbId, clientNickname, timestamp}
          .map(({ msg, timestamp }) => {
            let { clientDbId, clientNickname } = msg.match(regex).groups;

            return {
              clientDbId,
              clientNickname,
              timestamp,
            };
          })
          // // order log messages by date [{date, clients: [{clientDbId, clientNickname}]}]
          .reduce((acc, { clientDbId, clientNickname, timestamp }) => {
            let currentTimestamp = new Date(
              timestamp.getFullYear(),
              timestamp.getMonth(),
              timestamp.getDate()
            );

            let index = acc.findIndex(
              (connection) =>
                connection.date.getTime() === currentTimestamp.getTime()
            );

            if (index === -1) {
              let arrLength = acc.push({
                date: currentTimestamp,
                localeDateString: currentTimestamp.toLocaleDateString(),
                clients: [],
              });

              index = arrLength - 1;
            }

            if (
              !acc[index].clients.find(
                (client) => client.clientDbId === clientDbId
              )
            ) {
              acc[index].clients.push({ clientDbId, clientNickname });
            }

            return acc;
          }, [])
          .sort((a, b) => a.date.getTime() - b.date.getTime())
      );
    },
  },
  methods: {
    renderChart() {
      Chart.defaults.color = "white";
      Chart.defaults.backgroundColor = "#ff79c6";
      Chart.defaults.borderColor = "#ff79c6";

      let chart = new Chart(this.$refs.chart, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Unique Client Connections",
              // backgroundColor: "#ff79c6",
              // borderColor: "#ff79c6",
              data: this.clientConnections,
              cubicInterpolationMode: "monotone",
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          parsing: {
            xAxisKey: "localeDateString",
            yAxisKey: "clients.length",
          },
          // legend: {
          //   labels: {
          //     color: "#282a36",
          //   },
          // },
          scales: {
            y: {
              grid: {
                color: "#4c5067",
              },
            },
            x: {
              grid: {
                color: "#4c5067",
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
