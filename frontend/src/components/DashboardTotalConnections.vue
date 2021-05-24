<template lang="html">
  <v-card>
    <v-card-title>Most Total Connections</v-card-title>
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
    clientDbList: Array,
    loaded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    mostActiveClients() {
      return this.clientDbList.sort(
        (a, b) => b.client_totalconnections - a.client_totalconnections
      );
    },
  },
  methods: {
    renderChart() {
      console.log("render chart");

      let chart = new Chart(this.$refs.chart, {
        type: "bar",
        data: {
          datasets: [
            {
              label: "Total Connections",
              backgroundColor: "#ff79c6",
              borderColor: "#ff79c6",
              data: this.mostActiveClients,
              // cubicInterpolationMode: "monotone",
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          indexAxis: "y",
          parsing: {
            yAxisKey: "client_nickname",
            xAxisKey: "client_totalconnections",
          },
          elements: {
            bar: {
              borderRadius: "4",
            },
          },
          // plugins: {
          //   legend: {
          //     position: "right",
          //   },
          // },
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
