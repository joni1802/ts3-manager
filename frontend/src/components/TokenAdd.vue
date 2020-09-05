<template>
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title>
            Add Token
          </v-card-title>
          <v-card-text>
            <v-select :items="tokenTypes" label="Type" v-model="selectedType" :disabled="$store.state.query.loading"></v-select>
            <v-autocomplete :items="availableGroups" label="Group" v-model="selectedGroup" :disabled="typeof selectedType === 'undefined' || $store.state.query.loading"></v-autocomplete>
            <v-autocomplete :items="availableChannels" label="Channel" v-model="selectedChannel" :disabled="selectedType === 0 || typeof selectedType === 'undefined' || $store.state.query.loading"></v-autocomplete>
            <v-textarea label="Description" v-model="tokenDescription"></v-textarea>
            <token-display v-model="token"></token-display>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="createToken" color="primary" :disabled="typeof selectedType === 'undefined'">Create</v-btn>
            <v-btn text @click="$router.go(-1)" color="primary">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  components: {
    TokenDisplay: () => import("@/components/TokenDisplay")
  },
  data() {
    return {
      token: undefined,
      tokenTypes: [
        {text: "Server Group", value: 0},
        {text: "Channel Group", value: 1}
      ],
      selectedType: undefined,
      selectedGroup: undefined,
      selectedChannel: undefined,
      tokenDescription: "",
      groups: [],
      channels: []
    }
  },
  computed: {
    availableGroups() {
      return this.groups.map(group => {
        return {
          text: group.name,
          value: group.sgid || group.cgid
        }
      })
    },
    availableChannels() {
      return this.channels.map(channel => {
        return {
          text: channel.channel_name,
          value: channel.cid
        }
      })
    }
  },
  methods: {
    copyToClipboard() {
      this.$clipboard(this.token)

      this.$toasted.info("Token Copied To Clipboard")
    },
    async createToken() {
      try {
        let [response] = await this.$TeamSpeak.execute("tokenadd", {
          tokentype: this.selectedType,
          tokenid1: this.selectedGroup,
          tokenid2: this.selectedType === 1 ? this.selectedChannel : 0,
          tokendescription: this.tokenDescription
        })

        this.$toasted.success("Token successfully created")

        this.token = response.token
      } catch(err) {
        this.$toasted.error(err.message)
      }
    },
    getServerGroupList() {
      return this.$TeamSpeak.execute("servergrouplist").then(groups => groups.filter(group => group.type === 1))
    },
    getChannelGroupList() {
      return this.$TeamSpeak.execute("channelgrouplist").then(groups => groups.filter(group => group.type === 1))
    },
    getChannelList() {
      return this.$TeamSpeak.execute("channellist")
    }
  },
  watch: {
    async selectedType(tokenType) {
      try {
        if(tokenType === 0) {
          this.groups = await this.getServerGroupList()

          this.selectedGroup = this.groups[0].sgid
        }
        if(tokenType === 1) {
          this.groups = await this.getChannelGroupList()
          this.channels = await this.getChannelList()

          this.selectedGroup = this.groups[0].cgid
          this.selectedChannel = this.channels[0].cid
        }
      } catch(err) {
        this.$toasted.error(err.message)
      }
    }
  }
}
</script>
