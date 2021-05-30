<template lang="html">
  <v-card>
    <v-card-title>Most Active Clients</v-card-title>
    <v-card-text>
      <canvas v-if="loaded" ref="chart"></canvas>
      <span v-else>Loading Data...</span>
    </v-card-text>
  </v-card>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  props: {
    logView: Array,
    numberOfClients: {
      type: Number,
      default: 10,
    },
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
      let regex =
        /^client (?<action>connected|disconnected) \'(?<clientNickname>.*)\'\(id:(?<clientDbId>.*)\).*$/;

      return this.logView
        .filter(({ msg }) => regex.test(msg))
        .map(({ msg, timestamp }) => {
          let { clientDbId, clientNickname, action } = msg.match(regex).groups;

          return {
            timestamp,
            clientDbId,
            clientNickname,
            action,
          };
        })
        .reduce((acc, { timestamp, clientDbId, clientNickname, action }) => {
          let index = acc.findIndex((arr) => arr.clientDbId === clientDbId);

          if (index === -1) {
            let arrLength = acc.push({
              clientDbId,
              clientNickname,
              totalConnectionTime: 0,
              connectionLogs: [],
            });

            index = arrLength - 1;
          }

          acc[index].connectionLogs.push({ timestamp, action });

          if (
            action === "disconnected" &&
            acc[index].connectionLogs.length > 1
          ) {
            let lastIndex = acc[index].connectionLogs.length - 1;

            let lastConnectedTime =
              acc[index].connectionLogs[lastIndex - 1].timestamp;
            let lastDisconnectedTime =
              acc[index].connectionLogs[lastIndex].timestamp;
            let lastConnectionDuration =
              lastDisconnectedTime.getTime() - lastConnectedTime.getTime();

            acc[index].totalConnectionTime += Math.round(
              lastConnectionDuration / 1000 / 60 / 60
            );
          }

          return acc;
        }, [])
        .sort((a, b) => b.totalConnectionTime - a.totalConnectionTime)
        .slice(0, this.numberOfClients);
    },
  },
  methods: {
    renderChart() {
      Chart.defaults.color = "white";
      Chart.defaults.backgroundColor = "#ff79c6";
      Chart.defaults.borderColor = "#ff79c6";

      let chart = new Chart(this.$refs.chart, {
        type: "bar",
        data: {
          datasets: [
            {
              label: "Time spent (hours)",
              // backgroundColor: "orange", //this.primaryColor,
              // borderColor: this.primaryColor,
              data: this.clientConnections,
            },
          ],
        },
        options: {
          responsive: true,
          indexAxis: "y",
          parsing: {
            xAxisKey: "totalConnectionTime",
            yAxisKey: "clientNickname",
          },
          elements: {
            bar: {
              borderRadius: "4",
            },
          },
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
    let watchClientDbList = this.$watch(
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
