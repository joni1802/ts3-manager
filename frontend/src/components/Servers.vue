<template>
<v-container>
  <v-layout>
    <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
      <v-card>
        <v-card-text>
          <v-data-table :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText" :headers="headers" :items="servers" item-key="virtualserver_id" :rows-per-page-items="rowsPerPage">
            <template slot="items" slot-scope="props">
              <td>
                <v-radio-group v-model="serverId" hide-details>
                  <v-radio :value="props.item.virtualserver_id" :disabled="isOffline(props.item.virtualserver_status)"></v-radio>
                </v-radio-group>
              </td>
              <td>{{ props.item.virtualserver_name }}</td>
              <td>{{ props.item.virtualserver_port }}</td>
              <td>{{ props.item.virtualserver_clientsonline }}/{{ props.item.virtualserver_maxclients }}</td>
              <td>{{ calcUptime(props.item.virtualserver_uptime) }}</td>
              <td justify-center align-center layout px-0>
                <v-switch hide-details :input-value="!isOffline(props.item.virtualserver_status)" @click.stop.prevent="changeServerStatus(props.item)"></v-switch>
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
</v-container>
</template>

<script>
import {
  secondsToDHMS
} from '@/utils'

export default {
  data() {
    return {
      headers: [{
          text: 'Selection',
          align: 'left',
          value: 'selection',
          sortable: false
        },
        {
          text: 'Name',
          align: 'left',
          value: 'virtualserver_name',
          sortable: false
        },
        {
          text: 'Port',
          align: 'left',
          value: 'virtualserver_port',
          sortable: false
        },
        {
          text: 'Clients',
          align: 'left',
          value: 'virtualserver_clientsonline_maxclients',
          sortable: false
        },
        {
          text: 'Uptime (d:h:m:s)',
          align: 'left',
          value: 'virtualserver_uptime',
          sortable: false
        },
        {
          text: 'Status',
          align: 'left',
          value: 'virtualserver_status',
          sortable: false
        },
      ],
      serverId: null,
      servers: [],
      stopDialog: false,
      selectedServer: {},
      counterIds: [],
      rowsPerPage: [
        25,
        50,
        75,
        {
          "text": "$vuetify.dataIterator.rowsPerPageAll",
          "value": -1
        }
      ],
    }
  },
  methods: {
    changeServerStatus(server) {
      this.selectedServer = {
        ...server
      }

      if (this.isOffline(this.selectedServer.virtualserver_status)) {
        this.startServer()
      } else {
        this.stopDialog = true
      }
    },
    async serverAction(action) {
      return this.$TeamSpeak.execute(action, {
        sid: this.selectedServer.virtualserver_id
      })
    },
    async startServer() {
      try {
        await this.serverAction('serverstart')
      } catch (err) {
        this.$toast.error(err.msg, {
          icon: 'error'
        })
      }

      try {
        this.servers = await this.getServerList()

        this.resetUptimeCounters()

        await this.useServer() // After server start you have to select the server again
      } catch (err) {
        this.$toast.error(err.msg, {
          icon: 'error'
        })
      }
    },
    async stopServer() {
      try {
        await this.serverAction('serverstop')
      } catch (err) {
        this.$toast.error(err.msg, {
          icon: 'error'
        })
      }

      this.stopDialog = false

      try {
        this.servers = await this.getServerList()

        this.resetUptimeCounters()
      } catch (err) {
        this.$toast.error(err.msg, {
          icon: 'error'
        })
      }
    },
    getServerList() {
      return this.$TeamSpeak.execute('serverlist')
    },
    // Selects the first available server from the list and selects its as default server
    setServerId() {
      this.serverId = [...this.servers].shift().virtualserver_id
    },
    useServer() {
      return this.$TeamSpeak.execute('use', {
        sid: this.serverId
      })
    },
    isOffline(status) {
      return status === 'offline' ? true : false
    },
    calcUptime(seconds) {
      let time = secondsToDHMS(seconds)

      return `${time.days}:${time.hours < 10 ? '0' + time.hours : time.hours}:${time.minutes < 10 ? '0' + time.minutes : time.minutes}:${time.seconds < 10 ? '0' + time.seconds : time.seconds}`
    },
    startUptimeCounters() {
      for (let i = 0; i < this.servers.length; i++) {
        this.servers[i].virtualserver_uptime = parseInt(this.servers[i].virtualserver_uptime)

        if (!this.isOffline(this.servers[i].virtualserver_status)) {
          this.counterIds[i] = setInterval(() => {
            this.servers[i].virtualserver_uptime += 1
          }, 1000)
        }
      }
    },
    removeUptimeCounters() {
      for (let id of this.counterIds) {
        clearTimeout(id)
      }
    },
    resetUptimeCounters() {
      this.removeUptimeCounters()
      this.startUptimeCounters()
    },
  },
  async created() {
    try {
      this.servers = await this.getServerList()

      this.setServerId()
      this.startUptimeCounters()
    } catch (err) {
      this.$toast.error(err.message, {
        icon: 'error'
      })
    }
  },
  watch: {
    async serverId(val) {
      try {
        await this.useServer()

        this.$store.commit('setServerId', this.serverId)
      } catch (err) {
        this.$toast.error(err.msg, {
          icon: 'error'
        })
      }
    }
  },
  beforeRouteLeave(from, to, next) {
    this.removeUptimeCounters()

    next()
  }
}
</script>
