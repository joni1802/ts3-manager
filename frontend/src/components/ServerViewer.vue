<template>
  <v-container>
    <v-layout>
      <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
        <v-card>
          <v-card-title>
            <v-checkbox v-model="refresh" label="Liveview"></v-checkbox>
          </v-card-title>
          <v-card-text>
            <v-icon>dns</v-icon>
            <span>{{ serverinfo.virtualserver_name }}</span>
            <sub-channels :subchannels="nestedChannellist" :clients="clientlist"></sub-channels>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
  export default {
    components: {
      SubChannels: () => import('@/components/SubChannels.vue')
    },
    data() {
      return {
        channellist: [],
        clientlist: [],
        serverinfo: {},
        refresh: false,
        refreshInterval: 2000,
        timeoutID: null,
        antiFlootingTimer: 60000
      }
    },
    computed: {
      nestedChannellist() {
        return this.orderChannels(this.channellist)
      }
    },
    methods: {
      // Props to http://oskarhane.com/create-a-nested-array-recursively-in-javascript/
      orderChannels(channellist, pid = 0) {
        let out = []

        for(let channel of channellist) {
          if(channel.pid == pid) {
            let subchannels = this.orderChannels(channellist, channel.cid)

            if(subchannels.length) {
              channel.subchannels = subchannels
            }

            out.push(channel)
          }
        }

        return out
      },
      getServerInfo() {
        return this.$TeamSpeak.execute('serverinfo').then(serverinfo => serverinfo[0])
      },
      getClientList() {
        return this.$TeamSpeak.execute('clientlist', {}, ['-voice', '-away'])
      },
      getChannelList() {
        return this.$TeamSpeak.execute('channellist')
      },
      // Set a timeout when auto refresh is enabled to prevent a flooting ban by teamspeak
      preventFlooting() {
        setTimeout(() => {
          this.refresh = false
        }, this.antiFlootingTimer)
      },
      autoRefresh() {
        if(!this.refresh) return

        this.timeoutID = setTimeout(async () => {
          try {
            this.channellist = await this.getChannelList()
            this.clientlist = await this.getClientList()
          } catch(err) {
            this.$toast.error(err.message, {icon: 'error'})
          }

          this.autoRefresh()
        }, 1000)
      },
      async init() {
        try {
          this.serverinfo = await this.getServerInfo()
          this.channellist = await this.getChannelList()
          this.clientlist = await this.getClientList()

          
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        this.autoRefresh()
      }
    },
    created() {
      this.init()

      // When a child component call an event globally
      this.$eventBus.$on('update', this.init)
    },
    watch: {
      refresh(enabled) {
        if(enabled) {
          this.autoRefresh()
          this.preventFlooting()
        }
      }
    },
    beforeRouteLeave(from, to, next) {
      clearTimeout(this.timeoutID)

      next()
    }
  }

</script>

<style scoped>
  span{
    padding: 0.4rem 0.5rem;
  }
</style>
