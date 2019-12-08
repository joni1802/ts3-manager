<template>
  <ban-form title="Ban Client" @ban="banClient" v-model="form" notEditable></ban-form>
</template>

<script>
  import BanForm from '@/components/BanForm'

  export default {
    components: {
      BanForm
    },
    data() {
      return {
        clientdbinfo: {},
        clientDbId: this.$route.params.cldbid,
        form: {
          ip: '',
          name: '',
          uid: '',
          reason: '',
          duration: undefined
        }
      }
    },
    methods: {
      getClientDbInfo() {
        return this.$TeamSpeak.execute('clientdbinfo', {cldbid: this.clientDbId}).then(clientdbinfo => clientdbinfo[0])
      },
      async banClient(data) {
        try {
          await this.$TeamSpeak.execute('banclient', {
            uid: data.uid,
            banreason: data.reason,
            time: data.duration
          })

          this.$toast.success('Client banned', {icon: 'done'})
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        this.$router.go(-1)
      },
    },
    async created() {
      try {
        this.clientdbinfo = await this.getClientDbInfo()

        this.form.ip = this.clientdbinfo.client_lastip
        this.form.name = this.clientdbinfo.client_nickname
        this.form.uid = this.clientdbinfo.client_unique_identifier
      } catch(err) {
        this.$toast.error(err.message, {icon: 'error'})
      }
    }
  }
</script>
