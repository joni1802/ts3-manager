<template>
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title>
            Edit Client
          </v-card-title>
          <v-card-text>
            <v-text-field label="Nickname" :placeholder="client.client_nickname" disabled></v-text-field>
            <v-textarea label="Description" v-model="description"></v-textarea>
            <v-autocomplete :items="availableGroups" chips label="Servergroups" multiple v-model="selectedGroups"></v-autocomplete>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click="$router.go(-1)" color="primary"><v-icon>arrow_back</v-icon>Back</v-btn>
            <v-btn flat @click="save" color="primary">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    data() {
      return {
        client: {},
        clientId: this.$route.params.clid,
        servergroups: [],
        selectedGroups: [],
        description: '',
        redirection: ''
      }
    },
    computed: {
      standardGroups() {
        return this.servergroups.filter(group => group.type === 1)
      },
      availableGroups() {
        return this.standardGroups.map(group => {
          return {
            text: group.name,
            value: group.sgid,
            disabled: group.sgid === 8 ? true : false, // Disable the Guest Group to prevent errors
          }
        })
      }
    },
    methods: {
      getClientInfo() {
        return this.$TeamSpeak.execute('clientinfo', {clid: this.clientId}).then(clientinfo => clientinfo[0])
      },
      getServergroupList() {
        return this.$TeamSpeak.execute('servergrouplist')
      },
      save() {
        try {
          this.changeDescription()
          this.addServergroups()
          this.removeServergroups()

          this.$toast.success('Client updated', {icon: 'done'})
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        // This timeout is needed because the teamspeak server is to slow and will give you wrong result back
        setTimeout(() => {
          this.init()
        }, 1000)
      },
      getClientServergroups() {
        return this.client.client_servergroups
      },
      getClientDescription() {
        // if not null
        return this.client.client_description ? this.client.client_description : ''
      },
      addServergroups() {
        let groupAddList = this.selectedGroups.filter(sgid => !this.getClientServergroups().includes(sgid))

        return this.changeMemberships('add', groupAddList)
      },
      removeServergroups() {
        let groupRemoveList = this.getClientServergroups().filter(sgid => !this.selectedGroups.includes(sgid))

        return this.changeMemberships('remove', groupRemoveList)
      },
      async changeMemberships(type, list) {
        let command = ''

        switch(type) {
          case 'add':
            command = 'servergroupaddclient'
            break;
          case 'remove':
            command = 'servergroupdelclient'
        }

        for(let sgid of list) {
          await this.$TeamSpeak.execute(command, {
            sgid: sgid,
            cldbid: this.client.client_database_id
          })
        }
      },
      async changeDescription() {
        await this.$TeamSpeak.execute('clientedit', {
          clid: this.clientId,
          client_description: this.description
        })
      },
      async init() {
        try {
          this.client = await this.getClientInfo()

          this.servergroups = await this.getServergroupList()
          this.selectedGroups = this.getClientServergroups()
          this.description = this.getClientDescription()
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
