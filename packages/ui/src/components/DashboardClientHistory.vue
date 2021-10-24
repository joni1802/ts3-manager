<template lang="html">
  <div>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col md="9">
            <div class="text-h6">Client Connections Per Day</div>
            <div class="text-subtitle-1">Since last restart</div>
          </v-col>

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

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title
          >Client Connections ({{
            selectedData.localeDateString
          }})</v-card-title
        >
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="client in selectedData.clients"
              :key="client.clientDbId"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ client.clientNickname }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ client.clientDbId }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
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
      clientConnectionsPerDay: [],
      dialog: false,
      selectedData: {},
    };
  },
  computed: {
    endDate() {
      let startDate = new Date();

      return new Date(
        startDate.getTime() - this.selectedDays * 24 * 60 * 60 * 1000
      );
    },
  },
  methods: {
    changeDays(days) {
      this.selectedDays = days;

      // Emit the selected days  as the first argument to the parent component.
      // The second argument is a callback function, which will be executed after
      // the asynchronous task in the parent component is completed.
      this.$emit("change-days", days, (logView) => {
        this.clientConnectionsPerDay = this.getClientConnectionsPerDay(logView);

        this.updateChart();
      });
    },
    updateChart() {
      this.chart.data.labels = [];

      this.chart.data.datasets[0].data = this.clientConnectionsPerDay.reverse(); //[...this.clientConnections].reverse();

      this.chart.update();
    },
    getClientConnectionsPerDay(logView) {
      let regex =
        /^client connected \'(?<clientNickname>.*)\'\(id:(?<clientDbId>.*)\).*$/;

      return (
        // filters all "client connected" log messages
        logView
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
          .filter(({ date }) => date.getTime() > this.endDate.getTime())
      );
    },
  },
  mounted() {
    this.$watch(
      "loaded",
      (loaded) => {
        if (loaded) {
          this.clientConnectionsPerDay = this.getClientConnectionsPerDay(
            this.logView
          );

          this.renderChart(this.$refs.chart, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "Unique Client Connections",
                  // see below
                  data: this.clientConnectionsPerDay.reverse(),
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
              onClick: (e, arr) => {
                if (arr.length) {
                  let index = arr[0].index;

                  this.selectedData = this.clientConnectionsPerDay[index];

                  this.dialog = true;
                }
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
