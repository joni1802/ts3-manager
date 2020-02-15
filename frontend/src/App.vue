<template>
<v-app :dark="$store.state.settings.darkMode">
  <app-shell></app-shell>
  <v-content>
    <router-view></router-view>
  </v-content>
</v-app>
</template>

<script>
export default {
  components: {
    AppShell: () => import('@/components/AppShell')
  },
  computed: {
    serverId: {
      get() {
        return this.$store.state.connection.serverId
      },
      set(sid) {
        this.$store.commit('setServerId', sid)
      }
    }
  },
  methods: {
    async registerTextEvents() {
      try {
        await this.$TeamSpeak.registerEvent('textserver')
        await this.$TeamSpeak.registerEvent('textchannel')
        await this.$TeamSpeak.registerEvent('textprivate')
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    addTextListener() {
      this.$TeamSpeak.on('textmessage', this.saveTextMessage)
    },
    removeTextListener() {
      this.$TeamSpeak.__proto__.removeEventListener('textmessage', this.saveTextMessage)
    },
    saveTextMessage(e) {
      let notification = e.detail

      this.$store.commit('saveMessage', notification)
    },
    // Selects the first available server from the list and selects it as default server
    getFirstServerId() {
      return this.$TeamSpeak.execute('serverlist').then(list => list.shift().virtualserver_id)
    },
    useServer(sid) {
      return this.$TeamSpeak.execute('use', { sid })
    },
    watchConnectionState() {
      this.$store.watch((state) => {
        return state.connection.connected
      }, async (connected) => {
        try {
          if(connected) {
            if(!this.serverId) {
              this.serverId = await this.getFirstServerId()

              await this.useServer(this.serverId)
            } else {
              await this.useServer(this.$store.state.connection.serverId)
            }

            this.registerTextEvents()
          } else {
            this.removeTextListener()
          }
        } catch(err) {
          this.$toast.error(err.message)
        }
      }, {
        immediate: true
      })
    }
  },
  created() {
    this.addTextListener()
    this.watchConnectionState()
  }
}
</script>
