<template>
<ban-form title="Add Ban" @addban="addBan" :ban="ban"></ban-form>
</template>

<script>
export default {
  components: {
    BanForm: () => import('@/components/BanForm')
  },
  data() {
    return {
      ban: {
        ip: null,
        name: null,
        uid: null,
        reason: '',
        time: 86400 // default is 1 day
      }
    }
  },
  methods: {
    async addBan(data) {
      try {
        await this.$TeamSpeak.execute('banadd', {
          ip: data.ip,
          name: data.name,
          uid: data.uid,
          banreason: data.reason,
          time: data.time
        })

        this.$router.push({
          name: 'bans'
        })
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  }
}
</script>
