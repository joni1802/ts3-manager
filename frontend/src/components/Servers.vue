<template>
<v-container>
  <v-layout>
    <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
      <v-card>
        <v-card-text>
          <v-data-table :no-data-text="
                $store.state.query.loading ? '...loading' : $vuetify.noDataText
              " :headers="headers" :items="servers" item-key="virtualserver_id" :rows-per-page-items="rowsPerPage">
            <template slot="items" slot-scope="props">
              <td>
                <v-radio-group v-model="currentServerId" hide-details>
                  <v-radio :value="props.item.virtualserver_id" :disabled="isOffline(props.item.virtualserver_status)"></v-radio>
                </v-radio-group>
              </td>
              <td>{{ props.item.virtualserver_name }}</td>
              <td>{{ props.item.virtualserver_port }}</td>
              <td>
                {{ props.item.virtualserver_clientsonline }}/{{
                    props.item.virtualserver_maxclients
                  }}
              </td>
              <td>{{ calcUptime(props.item.virtualserver_uptime) }}</td>
              <td justify-center align-center layout px-0>
                <v-switch hide-details :input-value="!isOffline(props.item.virtualserver_status)" @click.stop.prevent="changeServerStatus(props.item)"></v-switch>
              </td>
              <td class="justify-center layout px-0">
                <v-icon @click="openDeleteDialog(props.item)">delete</v-icon>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>

  <v-dialog v-model="stopDialog" max-width="500px">
    <v-card>
      <v-card-title>Stop Server</v-card-title>
      <v-card-text>
        Do really want to stop this virtual server instance?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click="stopDialog = false" color="primary">Cancel</v-btn>
        <v-btn flat @click="stopServer" color="primary">Stop</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="500px">
    <v-card>
      <v-card-title>Delete Server</v-card-title>
      <v-card-text>
        Do really want to delete this virtual server instance?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click="deleteDialog = false" color="primary">Cancel</v-btn>
        <v-btn flat @click="deleteServer" color="primary">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-btn fab color="pink" fixed bottom right dark :to="{name: 'server-add'}">
    <v-icon>add</v-icon>
  </v-btn>
</v-container>
</template>

<script>
import {
  secondsToDHMS
} from "@/utils";

export default {
  beforeRouteEnter(to, from, next) {
    next(async vm => {
      try {
        vm.servers = await vm.getServerList()

        // Pick the first virtual server after login
        if(from.name === "login") {
          let onlineServer = vm.servers.find(server => server.virtualserver_status === "online")

          if(onlineServer) await vm.$TeamSpeak.selectServer(onlineServer.virtualserver_id) // vm.selectServer(onlineServer.virtualserver_id)
        }

        vm.startUptimeCounters();
      } catch(err) {
        vm.$toast.error(err.message)
      }
    })
  },
  data() {
    return {
      headers: [{
          text: "Selection",
          align: "left",
          value: "selection",
          sortable: false
        },
        {
          text: "Name",
          align: "left",
          value: "virtualserver_name",
          sortable: false
        },
        {
          text: "Port",
          align: "left",
          value: "virtualserver_port",
          sortable: false
        },
        {
          text: "Clients",
          align: "left",
          value: "virtualserver_clientsonline_maxclients",
          sortable: false
        },
        {
          text: "Uptime (d:h:m:s)",
          align: "left",
          value: "virtualserver_uptime",
          sortable: false
        },
        {
          text: "Status",
          align: "left",
          value: "virtualserver_status",
          sortable: false
        },
        {
          text: "Actions",
          align: "right",
          value: "delete",
          sortable: false
        }
      ],
      servers: [],
      stopDialog: false,
      deleteDialog: false,
      counterIds: [],
      rowsPerPage: [
        25,
        50,
        75,
        {
          text: "$vuetify.dataIterator.rowsPerPageAll",
          value: -1
        }
      ],
      selectedServer: {}
    };
  },
  computed: {
    currentServerId: {
      get() {
        return this.$store.state.query.serverId;
      },
      async set(sid) {
        try {
          await this.$TeamSpeak.selectServer(sid)
        } catch(err) {
          this.$toast.error(err.message)
        }
      }
    }
  },
  methods: {
    async changeServerStatus(server) {
      if(this.isOffline(server.virtualserver_status)) {
        await this.startServer(server.virtualserver_id)
      } else {
        await this.stopServer(server.virtualserver_id)
      }

      try {
        this.servers = await this.getServerList();
      } catch(err) {
        this.$toast.error(err.message);
      }

      this.resetUptimeCounters()
    },
    openDeleteDialog(server) {
      this.selectedServer = server

      this.deleteDialog = true
    },
    async deleteServer() {
      try {
        await this.$TeamSpeak.execute("serverdelete", {sid: this.selectedServer.virtualserver_id})

        this.deleteDialog = false

        this.servers = await this.getServerList()
      } catch(err) {
        this.$toast.error(err.message)
      }
    },
    getQueryUserData() {
      return this.$TeamSpeak.execute("whoami").then(list => list[0])
    },
    saveQueryUserData(data) {
      this.$store.commit("saveUserInfo", data)
    },
    async startServer(sid) {
      try {
        await this.$TeamSpeak.execute("serverstart", {sid})
        await this.$TeamSpeak.selectServer(sid)
        //await this.selectServer(sid);
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async stopServer(sid) {
      try {
        await this.$TeamSpeak.execute("serverstop", {sid})

        if(this.currentServerId === sid) this.$store.commit("setServerId", null)
      } catch (err) {
        this.$toast.error(err.message);
      }

      this.stopDialog = false;
    },
    getServerList() {
      return this.$TeamSpeak.execute("serverlist");
    },
    isOffline(status) {
      return status === "offline" ? true : false;
    },
    calcUptime(seconds) {
      let time = secondsToDHMS(seconds);

      return `${time.days}:${time.hours < 10 ? "0" + time.hours : time.hours}:${
        time.minutes < 10 ? "0" + time.minutes : time.minutes
      }:${time.seconds < 10 ? "0" + time.seconds : time.seconds}`;
    },
    startUptimeCounters() {
      for (let i = 0; i < this.servers.length; i++) {
        this.servers[i].virtualserver_uptime = parseInt(
          this.servers[i].virtualserver_uptime
        );

        if (!this.isOffline(this.servers[i].virtualserver_status)) {
          this.counterIds[i] = setInterval(() => {
            this.servers[i].virtualserver_uptime += 1;
          }, 1000);
        }
      }
    },
    removeUptimeCounters() {
      for (let id of this.counterIds) {
        clearTimeout(id);
      }
    },
    resetUptimeCounters() {
      this.removeUptimeCounters();
      this.startUptimeCounters();
    }
  },
  beforeRouteLeave(from, to, next) {
    this.removeUptimeCounters();

    next();
  }
};
</script>
