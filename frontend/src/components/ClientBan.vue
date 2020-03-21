<template>
<ban-form title="Ban Client" @addban="banClient" :ban="form"></ban-form>
</template>

<script>
import BanForm from '@/components/BanForm'

export default {
  components: {
    BanForm
  },
  data() {
    return {
      clientDbInfo: {},
      clientDbId: this.$route.params.cldbid,
      form: {
        ip: '',
        name: '',
        uid: '',
        reason: '',
        time: 86400 // default is 1 day
      }
    }
  },
  methods: {
    getClientDbInfo() {
      return this.$TeamSpeak.execute('clientdbinfo', {
        cldbid: this.clientDbId
      }).then(clientdbinfo => {

        

        return clientdbinfo[0]
      })
    },
    async banClient(data) {
      try {
        await this.$TeamSpeak.execute('banadd', {
          ip: data.ip,
          name: data.name,
          uid: data.uid,
          banreason: data.reason,
          time: data.time
        })
      } catch (err) {
        this.$toast.error(err.message)
      }

      this.$router.go(-1)
    },
  },
  async created() {
    try {
      this.clientDbInfo = await this.getClientDbInfo()

      this.form.ip = this.clientDbInfo.client_lastip
      this.form.uid = this.clientDbInfo.client_unique_identifier
    } catch (err) {
      this.$toast.error(err.message)
    }
  }
}
</script>
