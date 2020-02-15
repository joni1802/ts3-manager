<template>
<v-container>
  <v-layout>
    <v-flex xs12>
      <v-card :style="{height: `calc(100vh - 96px)`, position: 'relative'}" ref="yolo">
        <v-layout wrap>
          <v-flex xs12 md3>
            <v-list subheader>

              <v-subheader>Channels</v-subheader>
              <v-list-tile v-for="channel in channelList" @click="switchTextChannel(channel.cid)" active-class="active-channel" :class="{'active-channel': channel.cid === channelId}">
                <v-list-tile-content>
                  <v-list-tile-title>{{ channel.channel_name }} ({{ channel.cid }})</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>

              <v-subheader>Clients</v-subheader>
              <v-list-tile v-for="client in clientList" @click="openTextPrivate(client)">
                <v-list-tile-content>
                  <v-list-tile-title>{{ client.client_nickname }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>

            </v-list>
          </v-flex>
          <v-flex xs12 md9>
            <v-tabs v-model="selectedTab">
              <v-tab>{{ textServerTab.name }}</v-tab>
              <v-tab>{{ textChannelTab.name }}</v-tab>
              <v-tab v-for="(textPrivateTab, index) in textPrivateTabs" :key="index + 2">
                {{ textPrivateTab.name }}
                <v-icon @click="closeTextPrivate(textPrivateTab)">close</v-icon>
              </v-tab>
            </v-tabs>
            <v-tabs-items>
              <v-tab-item>
                <div v-for="message in filteredTextMessages" class="my-2">
                  <div>
                    <v-icon v-if="message.sender === queryUser.client_nickname">arrow_upward</v-icon>
                    <v-icon v-else>arrow_downward</v-icon>
                    {{ message.timestamp }} <b>{{ message.sender }}</b>
                  </div>
                  <div>
                    {{ message.text }}
                  </div>
                </div>
              </v-tab-item>
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
    next(async vm => {
      try {
        vm.queryUser = await vm.getQueryUserInfo()

        if (!to.params.cid) {
          vm.$router.replace({
            name: 'chat',
            params: {
              cid: vm.queryUser.client_channel_id
            }
          })
        } else {
          await vm.moveClient(vm.queryUser.client_id, to.params.cid)
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
      textMessages: [],
      /**
       * The id of the currently joined channel.
       * @type {number}
       */
      channelId: +this.$route.params.cid,
      /**
       * Clientlist of opened private chats
       * @type {Array.<{clid: number, cid: number, client_database_id: number, client_nickname: string, client_type: number}>}
       */
      textPrivateTargets: [],
      selectedTab: 0,
      selectedChat: {}
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
      return this.textPrivateTargets.map(target => ({
        name: target.client_nickname,
        target: target.clid,
        targetmode: 1
      }))
    },
    filteredTextMessages() {
      switch (this.selectedTab) {
        case 0:
          this.selectedChat = this.textServerTab
          break;
        case 1:
          this.selectedChat = this.textChannelTab
          break;
        default:
          if (this.textPrivateTabs.length) {
            this.selectedChat = this.textPrivateTabs[this.selectedTab - 2]
          }
      }

      return this.textMessages.filter(message => message.target === this.selectedChat.target && message.targetmode === this.selectedChat.targetmode)
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
    closeTextPrivate(chat) {
      let index = this.textPrivateTargets.map(client => client.clid).indexOf(chat.target)

      this.textPrivateTargets.splice(index, 1)
    },
    openTextPrivate(client) {
      let openedTargets = this.textPrivateTargets.map(client => client.clid)

      // Create the chat only if it is not already open
      if (!openedTargets.includes(client.clid)) this.textPrivateTargets.push(client)
    },
    async init() {
      try {
        this.clientList = await this.getClientList()
        this.channelList = await this.getChannelList()
        this.serverInfo = await this.getServerInfo()

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
    // channelId: {
    //   immediate: true,
    //   handler(cid) {
    //     // console.log('channel id', cid);
    //   }
    // },
    // textPrivateTargets(list) {
    //   console.log(list);
    // },
    // selectedChat(val) {
    //   console.log(val);
    // }
  },
  beforeRouteUpdate(to, from, next) {
    this.channelId = +to.params.cid
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
.active-channel {
  color: rgb(25, 118, 210);
}
</style>
