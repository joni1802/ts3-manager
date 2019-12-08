<template>

</template>

<script>
  export default {
    methods: {
      quit() {
        return this.$TeamSpeak.execute('quit')
      },
      clearStorage() {
        this.$store.dispatch('clearConnection')
      }
    },
    async created() {
      try {
        await this.quit()
        // Clearing the local storage and redirecting to the login page is handled by the socket event "TeamSpeak connection closed"
      } catch(err) {
        this.$toast.error(err.message, {icon: 'error'})

        this.clearStorage()
      }
    }
  }
</script>
