<template>

</template>

<script>
  export default {
    methods: {
      quit() {
        return this.$TeamSpeak.execute('quit')
      },
      logout() {
        this.$store.dispatch('clearConnection')

        this.$router.push({name: 'login'})
      }
    },
    async created() {
      try {
        this.quit()

        this.logout()
      } catch(err) {
        this.$toast.error(err.message, {icon: 'error'})

        this.logout()
      }
    }
  }
</script>
