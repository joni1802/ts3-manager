<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <permission-table :grantedPermissions="permissions" type="Channel Client Permissions" :editableContent="['permvalue']" @save="savePermission" @remove="removePermission" @loaded="init">
          <template slot="selectMenu">
            <v-flex sm3 xs12>
              <v-autocomplete :items="channelSelection" v-model="selectedChannel" label="Channel" @change="changeChannel"></v-autocomplete>
            </v-flex xs12>
            <v-flex sm3>
              <v-autocomplete :items="clientSelection" v-model="selectedClient" label="Client" @change="changeClient"></v-autocomplete>
            </v-flex>
          </template>
        </permission-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import PermissionTable from '@/components/PermissionTable'

  export default {
    components: {
      PermissionTable
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
          return {text: channel.channel_name, value: channel.cid}
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
          return {text: client.client_nickname, value: client.cldbid}
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
        return this.$query('channelclientpermlist', {
          cid: this.channelId,
          cldbid: this.clientDbId
        })
      },
      getClientDbList() {
        return this.$fullClientDbList()
      },
      getChannelList() {
        return this.$query('channellist')
      },
      async savePermission(permission) {
        let {permid, permvalue} = permission

        try {
          await this.$query('channelclientaddperm', {
            cid: this.channelId,
            cldbid: this.clientDbId,
            permid: permid,
            permvalue: permvalue
          })
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        try {
          this.permissions = await this.getChannelClientPermList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      async removePermission(permission) {
        let {permid} = permission

        try {
          await this.$query('channelclientdelperm', {
            cid: this.channelId,
            cldbid: this.clientDbId,
            permid: permid,
          })
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        try {
          this.permissions = await this.getChannelClientPermList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      changeClient(cldbid) {
        this.$router.push({name: 'permissions-channelclient', params: {cid: this.channelId, cldbid: cldbid}})
      },
      changeChannel(cid) {
        this.$router.push({name: 'permissions-channelclient', params: {cid: cid, cldbid: this.clientDbId}})
      },
      async init() {
        try {
          this.clients = await this.getClientDbList()
          this.channels = await this.getChannelList()
          this.permissions = await this.getChannelClientPermList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
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
