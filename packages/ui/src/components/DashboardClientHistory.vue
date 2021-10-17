<template lang="html">
  <v-card>
    <v-card-title>
      <v-row>
        <v-col>Client Connections History</v-col>
        <v-col
          ><v-btn color="primary" @click="updateChart">Hey</v-btn
          ><v-btn @click="stop = true">stop</v-btn></v-col
        >
        <v-col cols="12" sm="4" md="3">
          <v-select
            :value="selectedDays"
            :items="days"
            @change="changeDays"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text>
      <canvas v-if="loaded" ref="chart" height="200"></canvas>
      <span v-else>Loading Data...</span>
    </v-card-text>
  </v-card>
</template>

<script>
import chart from "@/mixins/chart";

export default {
  mixins: [chart],
  props: {
    logView: Array,
    loaded: {
      type: Boolean,
      default: false,
    },
    days: Array,
  },
  data() {
    return {
      selectedDays: 30,
      stop: false, // testing
    };
  },
  methods: {
    changeDays(days) {
      this.selectedDays = days; // to-do: used for filtering in clientConnections

      this.$emit("change-days", days);
    },
    sleep(milliseconds) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, milliseconds);
      });
    },
    getEndDate() {
      let startDate = new Date();

      return new Date(
        startDate.getTime() - this.selectedDays * 24 * 60 * 60 * 1000
      );
    },
    updateChart() {
      let endDate = this.getEndDate();

      let filteredClientConnections = this.clientConnections.filter(
        ({ date }) => {
          return date.getTime() > endDate.getTime();
        }
      );

      this.chart.data.labels = [];

      this.chart.data.datasets[0].data = filteredClientConnections.reverse(); //[...this.clientConnections].reverse();

      this.chart.update();
    },
  },
  computed: {
    // endDate() {
    //   let startDate = new Date();

    //   return new Date(
    //     startDate.getTime() - this.selectedDays * 24 * 60 * 60 * 1000
    //   );
    // },
    clientConnections() {
      let obj = {};
      let regex =
        /^client connected \'(?<clientNickname>.*)\'\(id:(?<clientDbId>.*)\).*$/;

      return (
        this.logView
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
                localeDateString: currentTimestamp.toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }
                ),
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
  mounted() {
    let watchLogView = this.$watch(
      "loaded",
      (loaded) => {
        if (loaded) {
          this.renderChart(this.$refs.chart, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "Unique Client Connections",
                  // see below
                  data: [...this.clientConnections].reverse(),
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
              scales: {
                x: {
                  // reverse order to be able to add older dates to the dataset
                  // chart.js acts weird when you unshift data to the data array of a dataset
                  reverse: true,
                },
              },
            },
          });
        }
      },
      {
        immediate: true,
      }
    );
  },
  watch: {
    logView(logs) {
      if (logs.length) {
        console.log("fired");
        this.updateChart();
      }
    },
  },
};
</script>

<style lang="css" scoped></style>
