<template lang="html">
  <v-card>
    <v-card-title>
      <v-row>
        <v-col>Client Connections History</v-col>
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
    };
  },
  methods: {
    changeDays(days) {
      this.selectedDays = days; // to-do: used for filtering in clientConnections

      this.$emit("change-days", days);
    },
  },
  computed: {
    clientConnections() {
      let obj = {};
      let regex =
        /^client connected \'(?<clientNickname>.*)\'\(id:(?<clientDbId>.*)\).*$/;
      // copy the original array and reverse it
      let logView = [...this.logView].reverse();

      return (
        logView
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
            },
          });
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
