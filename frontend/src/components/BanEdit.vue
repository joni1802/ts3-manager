<template>
  <ban-form title="Edit Ban" @ban="save" v-model="ban"></ban-form>
</template>

<script>
  import BanForm from '@/components/BanForm'

  export default {
    components: {
      BanForm
    },
    data() {
      return {
        banid: this.$route.params.banid,
        banlist: [],
        newBanList: []
      }
    },
    computed: {
      ban() {
        return this.banlist.find(ban => ban.banid == this.banid)
      }
    },
    methods: {
      getBanList() {
        return this.$query('banlist')
      },
      addBan(currentBan) {
        return this.$query('banadd', {
          ip: currentBan.ip,
          name: currentBan.name,
          uid: currentBan.uid,
          banreason: currentBan.reason,
          time: currentBan.duration
        })
      },
      async setNewBanList() {
        this.newBanList = await this.getBanList()
      },
      getNewBanId() {
        // The array gets copied because pop() removes the last entry of an array and returns it.
        return [...this.newBanList].pop().banid
      },
      // There is no edit command for editing bans by the serverquery by default.
      // The gui just removes the old entry and adds a new one.
      // This method avoids errors by replacing the old banid in the url with the new one.
      async replaceBanId() {
        try {
          await this.setNewBanList()

          this.banid = this.getNewBanId()

          // Just using replace instead of push so the history will not be updated and the back button is working correctly
          this.$router.replace({name: 'ban-edit', params: {banid: this.banid}})

          this.banlist = this.newBanList
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      removeBan() {
        return this.$query('bandel', {banid: this.banid})
      },
      async save(data) {
        try {
          await this.addBan(data)
          await this.removeBan()

          this.$toast.success('Ban updated', {icon: 'done'})
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        this.replaceBanId()
      }
    },
    async created() {
      try {
        this.banlist = await this.getBanList()
      } catch(err) {
        this.$toast.error(err.message, {icon: 'error'})
      }
    }
  }
</script>
