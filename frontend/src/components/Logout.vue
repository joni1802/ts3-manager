<template>

</template>

<script>
  export default {
    methods: {
      quit() {
        return this.$TeamSpeak.execute('quit')
      }
    },
    async created() {
      try {
        await this.quit()

        // Logout is handled by the "teamspeak-disconnect" event.
      } catch(err) {
        this.$toasted.error(err.message)
      }
    }
  }
</script>
