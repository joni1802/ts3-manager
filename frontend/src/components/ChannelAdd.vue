<template>
  <channel-form title="Channel Add" @save="save"></channel-form>
</template>

<script>
export default {
  components: {
    ChannelForm: () => import('@/components/ChannelForm')
  },
  methods: {
    createChannel(props) {
      return this.$TeamSpeak.execute("channelcreate", props)
    },
    async save(channelProps) {
      try {
        await this.createChannel({...channelProps, cpid: +this.$route.query.pid})

        this.$router.go(-1)
      } catch(err) {
        this.$toast.error(err.message)
      }
    }
  }
}
</script>
