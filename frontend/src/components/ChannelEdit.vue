<template>
  <div>
    <channel-form :applyButton="true" title="Channel Edit" :channel="channel" @save="save"></channel-form>

    <v-dialog v-model="temporaryChannelWarning" max-width="500px">
      <v-card>
        <v-card-title>
          Temporary Channel
        </v-card-title>
        <v-card-text>
          If there are no clients inside the channel and you change it to temporary, the channel will be deleted.
          Do you want to continue?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="saveAndLeave">Yes</v-btn>
          <v-btn flat color="primary" @click="temporaryChannelWarning = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  components: {
    ChannelForm: () => import('@/components/ChannelForm')
  },
  data() {
    return {
      channelId: this.$route.params.cid,
      channel: {},
      temporaryChannelWarning: false,
      pendingChanges: null
    }
  },
  methods: {
    getChannelInfo() {
      return this.$TeamSpeak.execute('channelinfo', {
        cid: this.channelId
      }).then(channelinfo => channelinfo[0])
    },
    channelIsTemporary(channelProps) {
      let newChannelProps = {...this.channel, ...channelProps}

      if (
        newChannelProps.channel_flag_permanent === 0 &&
        newChannelProps.channel_flag_semi_permanent === 0
      ) {
        return true
      } else {
        return false
      }
    },
    editChannel(channelProps) {
      return Object.keys(channelProps).length && this.$TeamSpeak.execute('channeledit', {
        cid: this.channelId,
        ...channelProps
      })
    },
    async save(channelProps, e) {
      try {
        if(this.channelIsTemporary(channelProps)) {
          this.temporaryChannelWarning = true

          this.pendingChanges = channelProps
        } else {
          switch(e.target.textContent.toLowerCase()) {
            case "apply":
              await this.editChannel(channelProps)

              this.init()

              break;
            case "ok":
              await this.editChannel(channelProps)

              this.$router.go(-1)
          }
        }
      } catch(err) {
        this.$toast.error(err.message)
      }
    },
    async saveAndLeave() {
      try {
        await this.editChannel(this.pendingChanges)

        this.$router.go(-1)
      } catch(err) {
        this.$toast.error(err.message)
      }
    },
    async init() {
      try {
        this.channel = await this.getChannelInfo()
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  },
  created() {
    this.init()
  }
}
</script>
