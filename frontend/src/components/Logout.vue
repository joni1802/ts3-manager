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
        this.quit()
      } catch(err) {
        this.$toast.error(err.message)
      }

      this.logout()
    }
  }
</script>
