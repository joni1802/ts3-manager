<template>
  <v-container>
    <v-layout>
      <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
        <v-card>
          <v-card-text>
            <v-data-table
              :no-data-text="
                $store.state.query.loading ? '...loading' : $vuetify.noDataText
              "
              :headers="headers"
              :items="servers"
              item-key="virtualserver_id"
              :footer-props="{ 'items-per-page-options': rowsPerPage }"
            >
              <!-- show-select
          single-select v-model="selectedServer" -->
              <template #item.actions="{ item }">
                <v-menu>
                  <template #activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      :to="{ name: 'server-edit' }"
                      :disabled="isOffline(item.virtualserver_status)"
                    >
                      <v-list-item-title> Edit Server </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openDeleteDialog(item)">
                      <v-list-item-title> Delete Server </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template #item.selected_sid="{ item }">
                <v-radio-group v-model="joinedServerId">
                  <v-radio
                    :value="item.virtualserver_id"
                    :disabled="
                      item.virtualserver_status === 'offline' ||
                      $store.state.query.loading
                    "
                  >
                  </v-radio>
                </v-radio-group>
              </template>
              <template #item.virtualserver_clientsonline_maxclients="{ item }">
                {{ item.virtualserver_clientsonline }}/{{
                  item.virtualserver_maxclients
                }}
              </template>
              <template #item.virtualserver_uptime="{ item }">
                {{ calcUptime(item.virtualserver_uptime) }}
              </template>
              <template #item.virtualserver_status="{ item }">
                <!-- <v-switch v-model="onlineServerIds" :value="item.virtualserver_id"></v-switch> -->
                <v-switch
                  :input-value="!isOffline(item.virtualserver_status)"
                  readonly
                  @click="changeServerStatus(item)"
                >
                  <!-- @click.native.stop="changeServerStatus(item)" -->
                </v-switch>
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
          <v-btn text @click="stopDialog = false" color="primary">Cancel</v-btn>
          <v-btn text @click="stopServer" color="primary">Stop</v-btn>
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
          <v-btn text @click="deleteDialog = false" color="primary"
            >Cancel</v-btn
          >
          <v-btn text @click="deleteServer" color="primary">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn
      fab
      color="primary"
      fixed
      bottom
      right
      :to="{ name: 'server-create' }"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      try {
        vm.servers = await vm.getServerList();

        // Pick the first virtual server after login
        if (from.name === "login") {
          let onlineServer = vm.servers.find(
            (server) => server.virtualserver_status === "online"
          );

          if (onlineServer)
            await vm.$TeamSpeak.selectServer(onlineServer.virtualserver_id);
        }

        // Is primary needed to get the used server id
        vm.queryUser = await vm.getQueryUserData();

        vm.startUptimeCounters();
      } catch (err) {
        vm.$toast.error(err.message);
      }
    });
  },
  data() {
    return {
      headers: [
        {
          text: "",
          align: "start",
          value: "actions",
          sortable: false,
        },
        {
          text: "Select",
          align: "start",
          value: "selected_sid",
          sortable: false,
        },
        {
          text: "Name",
          value: "virtualserver_name",
          sortable: false,
        },
        {
          text: "Port",
          value: "virtualserver_port",
          sortable: false,
        },
        {
          text: "Clients",
          value: "virtualserver_clientsonline_maxclients",
          sortable: false,
        },
        {
          text: "Uptime (d:h:m:s)",
          value: "virtualserver_uptime",
          sortable: false,
        },
        {
          text: "Status",
          value: "virtualserver_status",
          sortable: false,
        },
      ],
      servers: [],
      stopDialog: false,
      deleteDialog: false,
      counterIds: [],
      rowsPerPage: [25, 50, 75, -1],
      queryUser: {},
    };
  },
  computed: {
    joinedServerId: {
      get() {
        return this.queryUser.virtualserver_id;
      },
      async set(sid) {
        try {
          await this.$TeamSpeak.selectServer(sid);
          this.queryUser = await this.getQueryUserData();
        } catch (err) {
          this.$toast.error(err.message);
        }
      },
    },
  },
  methods: {
    secondsToDHMS(seconds) {
      return {
        days: (seconds / 86400) >> 0,
        hours: ((seconds % 86400) / 3600) >> 0,
        minutes: ((seconds % 3600) / 60) >> 0,
        seconds: seconds % 60 >> 0,
      };
    },
    async changeServerStatus(server) {
      if (this.isOffline(server.virtualserver_status)) {
        await this.startServer(server.virtualserver_id);
      } else {
        this.openStopDialog(server);
      }

      try {
        this.servers = await this.getServerList();
      } catch (err) {
        this.$toast.error(err.message);
      }

      this.resetUptimeCounters();
    },
    openStopDialog(server) {
      this.selectedServer = server;

      this.stopDialog = true;
    },
    openDeleteDialog(server) {
      this.selectedServer = server;

      this.deleteDialog = true;
    },
    async deleteServer() {
      try {
        await this.$TeamSpeak.execute("serverdelete", {
          sid: this.selectedServer.virtualserver_id,
        });

        this.deleteDialog = false;

        this.servers = await this.getServerList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    getQueryUserData() {
      return this.$TeamSpeak.execute("whoami").then((list) => list[0]);
    },
    async startServer(sid) {
      try {
        await this.$TeamSpeak.execute("serverstart", { sid });
        await this.$TeamSpeak.selectServer(sid);

        this.queryUser = await this.getQueryUserData();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async stopServer() {
      try {
        await this.$TeamSpeak.execute("serverstop", {
          sid: this.selectedServer.virtualserver_id,
        });

        this.stopDialog = false;

        this.servers = await this.getServerList();

        if (this.joinedServerId === this.selectedServer.virtualserver_id)
          this.$store.dispatch("removeServerId");
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    getServerList() {
      return this.$TeamSpeak.execute("serverlist");
    },
    isOffline(status) {
      return status === "offline" ? true : false;
    },
    calcUptime(seconds) {
      let time = this.secondsToDHMS(seconds);

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
    },
  },
  beforeRouteLeave(from, to, next) {
    this.removeUptimeCounters();

    next();
  },
};
</script>
