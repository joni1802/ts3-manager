<template>
<v-container>
  <v-layout>
    <v-flex xs12>
      <permission-table :grantedPermissions="permissions" type="Channel Client Permissions" :editableContent="['permvalue']" @save="savePermission" @remove="removePermission" @loaded="init">
        <template slot="selectMenu">
          <v-flex sm3 xs12>
            <v-autocomplete :items="channelSelection" v-model="selectedChannel" label="Channel" @change="changeChannel" :disabled="$store.state.query.loading"></v-autocomplete>
          </v-flex xs12>
          <v-flex sm3>
            <v-autocomplete :items="clientSelection" v-model="selectedClient" label="Client" @change="changeClient" :disabled="$store.state.query.loading"></v-autocomplete>
          </v-flex>
        </template>
      </permission-table>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
  components: {
    PermissionTable: () => import('@/components/PermissionTable')
  },
  data() {
    return {
      permissions: [],
      channelId: this.$route.params.cid,
      clientDbId: this.$route.params.cldbid,
      clients: [],
      channels: []
    }
  },
  computed: {
    channelSelection() {
      return this.channels.map(channel => {
        return {
          text: channel.channel_name,
          value: channel.cid
        }
      })
    },
    selectedChannel: {
      get() {
        let channel = this.channels.find(channel => channel.cid == this.channelId)

        return channel && channel.cid
      },
      set() {
        // Empty
      }
    },
    clientSelection() {
      return this.clients.map(client => {
        return {
          text: client.client_nickname,
          value: client.cldbid
        }
      })
    },
    selectedClient: {
      get() {
        let client = this.clients.find(client => client.cldbid == this.clientDbId)

        return client && client.cldbid
      },
      set() {
        // Empty
      }
    }
  },
  methods: {
    getChannelClientPermList() {
      return this.$TeamSpeak.execute('channelclientpermlist', {
        cid: this.channelId,
        cldbid: this.clientDbId
      })
    },
    getClientDbList() {
      return this.$TeamSpeak.fullClientDBList()
    },
    getChannelList() {
      return this.$TeamSpeak.execute('channellist')
    },
    async savePermission(permission) {
      let {
        permid,
        permvalue
      } = permission

      try {
        await this.$TeamSpeak.execute('channelclientaddperm', {
          cid: this.channelId,
          cldbid: this.clientDbId,
          permid: permid,
          permvalue: permvalue
        })
      } catch (err) {
        this.$toasted.error(err.message, {
          icon: 'error'
        })
      }

      try {
        this.permissions = await this.getChannelClientPermList()
      } catch (err) {
        this.$toasted.error(err.message, {
          icon: 'error'
        })
      }
    },
    async removePermission(permission) {
      let {
        permid
      } = permission

      try {
        await this.$TeamSpeak.execute('channelclientdelperm', {
          cid: this.channelId,
          cldbid: this.clientDbId,
          permid: permid,
        })
      } catch (err) {
        this.$toasted.error(err.message, {
          icon: 'error'
        })
      }

      try {
        this.permissions = await this.getChannelClientPermList()
      } catch (err) {
        this.$toasted.error(err.message, {
          icon: 'error'
        })
      }
    },
    changeClient(cldbid) {
      this.$router.push({
        name: 'permissions-channelclient',
        params: {
          cid: this.channelId,
          cldbid: cldbid
        }
      })
    },
    changeChannel(cid) {
      this.$router.push({
        name: 'permissions-channelclient',
        params: {
          cid: cid,
          cldbid: this.clientDbId
        }
      })
    },
    async init() {
      try {
        this.clients = await this.getClientDbList()
        this.channels = await this.getChannelList()

        if (this.channelId === '0' && this.clientDbId === '0') {
          this.$router.replace({
            name: 'permissions-channelclient',
            params: {
              cid: this.channels[0].cid,
              cldbid: this.clients[0].cldbid
            }
          })
        }

        this.permissions = await this.getChannelClientPermList()
      } catch (err) {
        this.$toasted.error(err.message, {
          icon: 'error'
        })
      }
    }
  },
  async beforeRouteUpdate(to, from, next) {
    this.channelId = to.params.cid
    this.clientDbId = to.params.cldbid
    this.permissions = await this.getChannelClientPermList()

    next()
  },
}
</script>
