<template>
<ban-form title="Edit Ban" @addban="save" :ban="ban"></ban-form>
</template>

<script>
export default {
  components: {
    BanForm: () => import('@/components/BanForm')
  },
  data() {
    return {
      banid: this.$route.params.banid,
      banlist: [],
      newBanList: [],
      initialBan: {},
      ban: {}
    }
  },
  methods: {
    getBanList() {
      return this.$TeamSpeak.execute('banlist')
    },
    getBan(banlist) {
      return banlist.find(ban => ban.banid == this.banid)
    },
    addBan(currentBan) {
      return this.$TeamSpeak.execute('banadd', {
        ip: currentBan.ip,
        name: currentBan.name,
        uid: currentBan.uid,
        banreason: currentBan.reason,
        time: currentBan.time
      })
    },
    removeBan() {
      return this.$TeamSpeak.execute('bandel', {
        banid: this.banid
      })
    },
    async save(data) {
      try {
        await this.addBan(data)
        await this.removeBan()
      } catch (err) {
        this.$toast.error(err.message)
      }

      this.$router.go(-1)
    },
    async init() {
      try {
        this.banlist = await this.getBanList()
        this.ban = this.getBan(this.banlist)

        this.$set(this.ban, 'time', this.ban.duration)
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  },
  created() {
    this.init()
  },
}
</script>
