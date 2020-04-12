<template>
  <channel-form :applyButton="true" title="Channel Edit" :channel="channel" @okay="save" @apply="saveAndUpdate"></channel-form>
</template>

<script>
export default {
  components: {
    ChannelForm: () => import('@/components/ChannelForm')
  },
  data() {
    return {
      channelId: this.$route.params.cid,
      channel: {}
    }
  },
  methods: {
    getChannelInfo() {
      return this.$TeamSpeak.execute('channelinfo', {
        cid: this.channelId
      }).then(channelinfo => channelinfo[0])
    },
    async saveAndUpdate(channelProps) {
      try {
        if(Object.keys(channelProps).length) {
          await this.$TeamSpeak.execute('channeledit', {
            cid: this.channelId,
            ...channelProps
          })
        }

        this.$toast.success("Channel edited")

        this.init()
      } catch(err) {
        this.$toast.error(err.message)
      }
    },
    async save(channelProps) {
      try {
        if(Object.keys(channelProps).length) {
          await this.$TeamSpeak.execute('channeledit', {
            cid: this.channelId,
            ...channelProps
          })
        }

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
