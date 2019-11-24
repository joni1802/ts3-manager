<template>
  <ban-form title="Add Ban" @ban="addBan" v-model="ban"></ban-form>
</template>

<script>
  import BanForm from '@/components/BanForm'

  export default {
    components: {
      BanForm
    },
    data() {
      return {
        ban: {
          ip: null,
          name: null,
          uid: null,
          reason: '',
          duration: 0 // default is permanent
        }
      }
    },
    methods: {
      async addBan(data) {
        try {
          await this.$query('banadd', {
            ip: data.ip,
            name: data.name,
            uid: data.uid,
            banreason: data.reason,
            time: data.duration
          })

          this.$router.push({name: 'bans'})
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      }
    }
  }
</script>
