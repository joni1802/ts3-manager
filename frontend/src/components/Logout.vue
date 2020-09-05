<template>

</template>

<script>
  export default {
    methods: {
      quit() {
        return this.$TeamSpeak.execute('quit')
      },
      logout() {
        this.$store.dispatch('clearStorage')

        this.$router.push({name: 'login'})
      }
    },
    async created() {
      try {
        await this.quit()

        this.logout()
      } catch(err) {
        this.$toasted.error(err.message)
      }
    }
  }
</script>
