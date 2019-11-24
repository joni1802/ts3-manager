<template>
  <v-container>
    <v-layout>
      <v-flex xs12 sm6 offset-sm3>
        <v-alert :value="serverGroupId === 8" type="info">
          You can not add clients to the default guest server group. However, you can change the name.
        </v-alert>
        <v-card>
          <v-card-title>
            Edit Servergroup
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="serverGroup.name" label="Name"></v-text-field>
            <autocomplete-select-chips v-model="selectedClients" :items="availableClients" :maxVisibleChips="maxVisibleClients" label="Members"></autocomplete-select-chips>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click="$router.go(-1)" color="primary"><v-icon>arrow_back</v-icon>Back</v-btn>
            <v-btn flat @click="save" color="primary">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    components: {
      AutocompleteSelectChips: () => import('@/components/AutocompleteSelectChips')
    },
    data() {
      return {
        serverGroupId: this.$route.params.sgid,
        serverGroup: {},
        serverGroupClients: [],
        currentServerGroupClients: [],
        clients: [],
        maxVisibleClients: 11
      }
    },
    computed: {
      selectedClients: {
        get() {
          return this.serverGroupClients.map(client => client.cldbid)
        },
        set(clientDbIds) {
          this.serverGroupClients = this.clients.filter(client => clientDbIds.includes(client.cldbid))
        }
      },
      availableClients() {
        return this.clients.map(client => {
          return {text: `${client.client_nickname} (${client.cldbid})`, value: client.cldbid, uid: client.client_unique_identifier}
        })
      }
    },
    methods: {
      removeSelectedClient(cldbid) {
        let index = this.selectedClients.indexOf(cldbid)

        this.selectedClients.splice(index, 1)
      },
      getServerGroup() {
        return this.$query('servergrouplist').then(list => list.find(group => group.sgid == this.serverGroupId))
      },
      getServerGroupClientList() {
        return this.$query('servergroupclientlist', {
          sgid: this.serverGroupId
        }, ['-names'])
      },
      getClientDbList() {
        return this.$fullClientDbList()
      },
      async renameServerGroup() {
        await this.$query('servergrouprename', {
          sgid: this.serverGroupId,
          name: this.serverGroup.name
        })
      },
      async removeMembers() {
        let clientRemoveList = this.currentServerGroupClients.filter(client => !this.selectedClients.includes(client.cldbid))

        for(let client of clientRemoveList) {
          await this.$query('servergroupdelclient', {
            sgid: this.serverGroupId,
            cldbid: client.cldbid
          })
        }
      },
      async addMembers() {
        let currentClientDbIds = this.currentServerGroupClients.map(client => client.cldbid)
        let clientAddList = this.serverGroupClients.filter(client => !currentClientDbIds.includes(client.cldbid))

        for(let client of clientAddList) {
          await this.$query('servergroupaddclient', {
            sgid: this.serverGroupId,
            cldbid: client.cldbid
          })
        }
      },
      async save() {
        try {
          // you have to set await otherwise an error would not be thrown correctly
          await this.renameServerGroup()
          await this.removeMembers()
          await this.addMembers()

          this.$toast.success('Server Group updated', {icon: 'done'})
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        try {
          this.init()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      async init() {
        try {
          this.serverGroup = await this.getServerGroup()
          this.clients = await this.getClientDbList()
          this.serverGroupClients = await this.getServerGroupClientList()



          this.currentServerGroupClients = [...this.serverGroupClients]
        } catch(err) {


          this.$toast.error(err.message, {icon: 'error'})
        }
      }
    },
    created() {
      this.init()
    }
  }

</script>
