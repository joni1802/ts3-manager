<template>
<v-container>
  <v-layout>
    <v-flex xs12>
      <v-card :style="{height: `calc(100vh - 96px)`, position: 'relative'}" ref="yolo">
        <v-layout>
          <v-flex xs12 md3>
            <v-list subheader>
              <v-subheader>Channels</v-subheader>
              <v-list-tile v-for="channel in channelList" @click="switchTextChannel(channel.cid)" active-class="yolo" :class="{'yolo': channel.cid === +$route.params.cid}">
                <!-- <v-list-tile v-for="channel in channelList" :replace="true" :to="{name: 'chat', params: {cid: channel.cid}}"> -->

                <v-list-tile-content>
                  <v-list-tile-title>{{ channel.channel_name }} ({{ channel.cid }})</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>

              <v-subheader>Clients</v-subheader>
              <v-list-tile v-for="client in clientList" @click="">
                <v-list-tile-content>
                  <v-list-tile-title>{{ client.client_nickname }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-flex>
          <v-flex xs12 md9>
            <v-tabs>
              <v-tab>{{ textServerTab.name }}</v-tab>
              <v-tab>{{ textChannelTab.name }}</v-tab>
              <v-tab v-for="(textPrivateTab, index) in textPrivateTabs" :key="index + 2">
                {{ textPrivateTab.name }}
                <v-icon @click="">close</v-icon>
              </v-tab>
            </v-tabs>
            <v-tabs-items>
              <v-tab-item></v-tab-item>
            </v-tabs-items>

            <v-text-field>
            </v-text-field>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    console.log('entered route');

    next(async vm => {
      try {
        let {
          client_channel_id,
          client_id
        } = await vm.getQueryUserInfo()

        if (!to.params.cid) {
          vm.$router.replace({
            name: 'chat',
            params: {
              cid: client_channel_id
            }
          })
        } else {
          await vm.moveClient(client_id, to.params.cid)
        }
      } catch (err) {
        vm.$toast.error(err.message)
      }
    });
  },
  data() {
    return {
      clientList: [],
      channelList: [],
      serverInfo: {},
      queryUser: {},
      selectedClients: [],
      channelId: this.$route.params.cid
    }
  },
  computed: {
    textServerTab() {
      return {
        name: this.serverInfo.virtualserver_name,
        target: this.serverInfo.virtualserver_id,
        targetmode: 3
      }
    },
    currentJoinedChannel() {
      return this.channelList.find(channel => channel.cid === this.channelId)
    },
    textChannelTab() {
      return {
        name: this.currentJoinedChannel && this.currentJoinedChannel.channel_name,
        target: this.currentJoinedChannel && this.currentJoinedChannel.cid,
        targetmode: 2
      }
    },
    textPrivateTabs() {

    }
  },
  methods: {
    getClientList() {
      return this.$TeamSpeak.execute('clientlist')
    },
    getChannelList() {
      return this.$TeamSpeak.execute('channellist')
    },
    getServerInfo() {
      return this.$TeamSpeak.execute('serverinfo').then(list => list[0])
    },
    getQueryUserInfo() {
      return this.$TeamSpeak.execute('whoami').then(list => list[0])
    },
    moveClient(clid, cid) {
      return this.$TeamSpeak.execute('clientmove', {
        // clid: this.queryUser.client_id,
        clid,
        cid
      })
    },
    async switchTextChannel(cid) {
      try {
        await this.moveClient(this.queryUser.client_id, cid)

        this.$router.replace({
          name: 'chat',
          params: {
            cid
          }
        })
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    // closeTextPrivate(chat) {
    //   let index = this.textPrivates.map(tab => tab.target).indexOf(chat.target)
    //
    //   this.textPrivates.splice(index, 1)
    // },
    openTextPrivate(client) {
      let openedTargets = this.textPrivates.map(textPrivate => textPrivate.target)

      // Create the chat only if it is not already open
      if (!openedTargets.includes(client.clid)) {
        this.textPrivates.push({
          name: client.client_nickname,
          target: client.clid,
          targetmode: 1
        })
      }
    },
    async init() {
      try {
        this.clientList = await this.getClientList()
        this.channelList = await this.getChannelList()
        this.serverInfo = await this.getServerInfo()
        this.queryUser = await this.getQueryUserInfo()

        // console.log(this.channelList.find(channel => channel.cid === this.queryUser.client_channel_id));
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  },
  created() {
    this.init()
  },
  watch: {
    channelId: {
      immediate: true,
      handler(cid) {
        console.log('channel id', cid);
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.channelId = to.params.cid
    //
    // try {
    //   this.serverGroupPermissions = await this.getServergroupPermissions()
    // } catch (err) {
    //   this.$toast.error(err.message, {
    //     icon: 'error'
    //   })
    // }


    next()
  },
}
</script>

<style>
.yolo {
  background: blue;
}
</style>
