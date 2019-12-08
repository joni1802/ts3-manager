<template>
  <v-container>
    <v-layout>
      <v-flex md6 sm8 xs12 offset-md3 offset-sm2>
        <v-alert :value="channelGroupId === guestChannelGroupId" type="info">
          The guest channel group will always give you an empty result even though it contains clients
        </v-alert>

        <v-card>
          <v-card-title>
            Channel Group Edit
          </v-card-title>
          <v-card-text>
            <v-text-field label="Channel Group Name" v-model="channelGroupName"></v-text-field>
            <v-autocomplete :items="channelSelection" label="Channel" v-model="selectedChannel"></v-autocomplete>
            <autocomplete-select-chips :disabled="disabled" v-model="selectedClients" :items="clientSelection" :maxVisibleChips="maxVisibleClients" label="Members"></autocomplete-select-chips>
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
        channelGroup: {},
        channelGroupId: this.$route.params.cgid,
        guestChannelGroupId: 8, // for deleting the clients
        channels: [],
        selectedChannel: undefined, // current cid
        clients: [],
        selectedClients: [],
        currentClients: [],
        disabled: true,
        maxVisibleClients: 11
      }
    },
    computed: {
      channelGroupName: {
        get() {
          return this.channelGroup.name
        },
        set(name) {
          this.channelGroup.name = name
        }
      },
      channelSelection() {
        return this.channels.map(channel => {
          return {text: channel.channel_name, value: channel.cid}
        })
      },
      clientSelection() {
        return this.clients.map(client => {
          return {text: `${client.client_nickname} (${client.cldbid})`, value: client.cldbid, uid: client.client_unique_identifier}
        })
      }
    },
    methods: {
      getChannelGroup() {
        return this.$TeamSpeak.execute('channelgrouplist').then(list => list.find(group => group.cgid == this.channelGroupId)) // just double '==' cause this.$route.params.cgid is always a string
      },
      getChannelList() {
        return this.$TeamSpeak.execute('channellist')
      },
      getClientDbList() {
        return this.$TeamSpeak.fullClientDBList()
      },
      getChannelGroupClientList() {
        return this.$TeamSpeak.execute('channelgroupclientlist', {
          cgid: this.channelGroupId,
          cid: this.selectedChannel
        })
      },
      async renameChannelGroupName() {
        try {
          await this.$TeamSpeak.execute('channelgrouprename', {
            cgid: this.channelGroupId,
            name: this.channelGroupName,
          })
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      async changeMembers(list, cgid) {
        for(let clientDbId of list) {
          try {
            await this.$TeamSpeak.execute('setclientchannelgroup', {
              cgid: cgid,
              cid: this.selectedChannel,
              cldbid: clientDbId
            })
          } catch(err) {
            this.$toast.error(err.message, {icon: 'error'})
          }
        }
      },
      // Remove means: put client in the guest channel group of the selected channel
      async removeMembers() {
        let clientRemoveList = this.currentClients.filter(cldbid => !this.selectedClients.includes(cldbid))

        await this.changeMembers(clientRemoveList, this.guestChannelGroupId)
      },
      async addMembers() {
        let clientAddList = this.selectedClients.filter(cldbid => !this.currentClients.includes(cldbid))

        await this.changeMembers(clientAddList, this.channelGroupId)
      },
      async getMemberDbIds() {
        let channelGroupClients = await this.getChannelGroupClientList()

        return channelGroupClients.map(client => client.cldbid)
      },
      async save() {
        try {
          await this.renameChannelGroupName()
          await this.removeMembers()
          await this.addMembers()

          this.$toast.success('Channel Group updated', {icon: 'done'})
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        try {
          this.channelGroup = await this.getChannelGroup()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        try {
          // It is possible to just rename the group without selecting a specific channel
          if(this.selectedChannel) {
            this.selectedClients = await this.getMemberDbIds()
            this.currentClients = [...this.selectedClients]
          }
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      }
    },
    async created() {
      try {
        this.channelGroup = await this.getChannelGroup()
        this.channels = await this.getChannelList()
        this.clients = await this.getClientDbList()
      } catch(err) {
        this.$toast.error(err.message, {icon: 'error'})
      }
    },
    watch: {
      async selectedChannel() {
        this.disabled = false

        this.selectedClients = await this.getMemberDbIds()
        this.currentClients = [...this.selectedClients]
      }
    }
  }
</script>
