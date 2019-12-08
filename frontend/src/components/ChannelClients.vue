<template>
  <div>
    <ul>
      <li v-for="client in channelClients" :key="client.clid">
        <v-menu offset-x>
          <template slot="activator">
            <div>
              <v-icon>{{ statusIcon(client) }}</v-icon>
              <span class="client" >{{ client.client_nickname }}</span>
            </div>
          </template>
          <v-list>
            <v-list-tile :to="`/client/${client.clid}/edit`">
              <v-list-tile-action>
                <v-icon>edit</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  Edit Client
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile @click="openKickDialog(4, client)">
              <v-list-tile-action>
                <v-icon>forward</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  Kick Client from Channel
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile @click="openKickDialog(5, client)">
              <v-list-tile-action>
                <v-icon>forward</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  Kick Client from Server
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="`/client/${client.client_database_id}/ban`">
              <v-list-tile-action>
                <v-icon>not_interested</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  Ban Client
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
      </li>
    </ul>
    <v-dialog v-model="kickClientDialog" max-width="500px">
      <v-card>
        <v-card-title>Kick from {{ destination }}</v-card-title>
        <v-card-text>
          <v-text-field label="Kick Message" v-model="reason"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="kickClientDialog = false" color="primary">Cancel</v-btn>
          <v-btn flat @click="kick" color="primary">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    props: {
      clients: Array, // All clients that are online
      channel: Object //
    },
    data() {
      return {
        reasonid: null,
        selectedClient: {},
        kickClientDialog: false,
        reason: '',
        destination: '',
      }
    },
    computed: {
      channelClients() {
        return this.clients.filter(client => this.channel.cid === client.cid && client.client_database_id !== 1)
      }
    },
    methods: {
      updateView() {
        this.$eventBus.$emit('update')
      },
      statusIcon(client) {
        let iconName = 'fiber_manual_record'

        if(client.client_away === 1) {
          iconName = 'cancel_presentation'
        } else if(client.client_output_muted === 1) {
          iconName = 'volume_off'
        } else if(client.client_input_muted === 1) {
          iconName = 'mic_off'
        }

        return iconName
      },
      openKickDialog(reasonid, client) {
        // reasonid :
        // 4 = kick form current channel into default channel
        // 5 = kick from server
        this.reasonid = reasonid

        switch(this.reasonid) {
          case 4:
            this.destination = 'Channel'
            break;
          case 5:
            this.destination = 'Server'
        }

        this.selectedClient = {...client}

        this.kickClientDialog = true
      },
      async kick() {
        // clientkick reasonid={4|5} [reasonmsg={text}] clid={clientID}...
        let {clid} = this.selectedClient

        try {
          await this.$TeamSpeak.execute('clientkick', {
            reasonid: this.reasonid,
            reasonmsg: this.reason,
            clid: clid
          })
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        this.kickClientDialog = false

        this.updateView()
      },
    }
  }
</script>

<style scoped>
  ul {
    list-style: none;
  }

  li {
    padding: 0.25rem;
  }

  span{
    padding: 0.4rem 0.5rem;
  }

  span:hover {
    background: #bdc3c7;
    border-radius: 0.5rem;
  }
</style>
