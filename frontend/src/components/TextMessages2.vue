<template>
<v-container fill-height>
  <v-layout justify-center fill-height>
    <v-flex lg10 md10 sm10 xs12>
      <v-card>
        <v-layout wrap justify-space-around fill-height>
          <v-flex xs12 md3 hidden-xs-only style="height: calc(100vh - 96px); overflow-y: auto;">
            <v-list subheader >

              <v-subheader>Channels</v-subheader>
              <v-list-tile v-for="channel in channelList" @click="switchTextChannel(channel.cid)" active-class="active-channel" :class="{'active-channel': channel.cid === channelId}">
                <v-list-tile-avatar>
                  <v-icon>chat_bubble</v-icon>
                </v-list-tile-avatar>
                  <v-badge color="red">
                    <template slot="badge" v-if="countUnreadMessages({target: channel.cid, targetmode: 2})">
                      {{ countUnreadMessages({target: channel.cid, targetmode: 2}) }}
                    </template>
                    <v-list-tile-content>
                      <v-list-tile-title>{{ channel.channel_name }}</v-list-tile-title>
                      <v-list-tile-sub-title>{{ channel.cid }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-badge>
              </v-list-tile>

              <v-subheader>Clients</v-subheader>
              <v-list-tile v-for="client in clientList" @click="openTextPrivate(client)">
                <v-list-tile-avatar>
                  <v-icon>fiber_manual_record</v-icon>
                </v-list-tile-avatar>
                  <v-badge color="red">
                    <template slot="badge" v-if="countUnreadMessages({target: client.clid, targetmode: 1})">
                      {{ countUnreadMessages({target: client.clid, targetmode: 1}) }}
                    </template>
                    <v-list-tile-content>
                      <v-list-tile-title>{{ client.client_nickname }}</v-list-tile-title>
                    </v-list-tile-content>
                  </v-badge>
              </v-list-tile>

            </v-list>
          </v-flex>

          <v-flex xs12 md8 >
            <v-layout column fill-height>
              <v-flex shrink>
                <v-tabs v-model="selectedTab">
                  <v-tab>
                    <v-badge color="red">
                      <template slot="badge" v-if="countUnreadMessages(textServerTab)">
                        {{ countUnreadMessages(textServerTab) }}
                      </template>
                      <span>{{ textServerTab.name }}</span>
                    </v-badge>
                  </v-tab>
                  <v-tab>
                    <v-badge color="red">
                      <template slot="badge" v-if="countUnreadMessages(textChannelTab)">
                        {{ countUnreadMessages(textChannelTab) }}
                      </template>
                      <span>{{ textChannelTab.name }}</span>
                    </v-badge>
                  </v-tab>
                  <v-tab v-for="(textPrivateTab, index) in textPrivateTabs" :key="index + 2">
                    <v-badge color="red">
                      <template slot="badge" v-if="countUnreadMessages(textPrivateTab)">
                        {{ countUnreadMessages(textPrivateTab) }}
                      </template>
                      <span>{{ textPrivateTab.name }}<v-icon @click.stop="closeTextPrivate(textPrivateTab)">close</v-icon></span>
                    </v-badge>
                  </v-tab>
                </v-tabs>
              </v-flex>

              <v-flex grow style="height: 50vh; overflow-y: auto;">
                <v-tabs-items>
                  <v-tab-item ref="chat" >
                    <div v-for="message in filteredTextMessages" class="my-2">
                      <div>
                        <v-icon v-if="message.sender.clid === queryUser.client_id">arrow_upward</v-icon>
                        <v-icon v-else>arrow_downward</v-icon>
                        {{ new Date(message.meta.timestamp).toLocaleString() }} <b>{{ message.sender.client_nickname }}</b>
                      </div>
                      <div>
                        {{ message.text }}
                      </div>
                    </div>
                  </v-tab-item>
                </v-tabs-items>
              </v-flex>
              <v-flex shrink>
                <v-text-field :append-icon="'send'" label="Send Message" v-model="message" @click:append="sendMessage" @keyup="keyPressed" ></v-text-field>
              </v-flex>
            </v-layout>
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
            },
            // Send "openTextPrivate" from ServerViewer.vue
            query: vm.$route.query
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
      selectedChat: {},
      message: ''
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

      return this.$store.state.chat.messages.filter(message => message.target === this.selectedChat.target && message.targetmode === this.selectedChat.targetmode)
    }
  },
  methods: {
    countUnreadMessages({target, targetmode}) {
      return this.$store.state.chat.messages.filter(message => message.target === target && message.targetmode === targetmode && message.meta.unread).length
    },
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

        // Focus tab
        this.selectedTab = 1
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    closeTextPrivate(chat) {
      let index = this.textPrivateTargets.map(client => client.clid).indexOf(chat.target)

      this.selectedTab =  1 + index

      this.textPrivateTargets.splice(index, 1)
    },
    openTextPrivate(client, focus = true) {
      let openedTargets = this.textPrivateTargets.map(client => client.clid)

      // Create the chat only if it is not already open
      if (!openedTargets.includes(client.clid)) this.textPrivateTargets.push(client)

      // Focus tab
      if(focus)
        this.selectedTab = 2 + this.textPrivateTargets.map(client => client.clid).indexOf(client.clid)
    },
    keyPressed(e) {
      // On press "Enter"
      if (e.keyCode === 13) this.sendMessage()
    },
    async sendMessage() {
      try {
        let {targetmode, target} = this.selectedChat
        let sender = {
          clid: this.queryUser.client_id,
          client_nickname: this.queryUser.client_nickname
        }

        await this.$TeamSpeak.execute('sendtextmessage', {
          targetmode: this.selectedChat.targetmode,
          target: this.selectedChat.target,
          msg: this.message
        })

        // targetmode = number ,  sender = {clid, client_nickname}, text = string, target = number
        this.$store.dispatch('saveTextMessage', {
          targetmode,
          target,
          sender,
          text: this.message,
          meta: {
            unread: false
          }
        })

        this.message = ''
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    async init() {
      try {
        this.clientList = await this.getClientList()
        this.channelList = await this.getChannelList()
        this.serverInfo = await this.getServerInfo()

        if(this.$route.query.client) {


          // this.openTextPrivate(this.clientList.find(client => client.clid === this.$route.query.client))
          console.log(this.clientList.find(client => client.clid === +this.$route.query.client));
        }

      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
  created() {
    this.init()
  },
  watch: {
    selectedChat(chat) {
      this.$store.commit("markMessageAsRead", chat)
    },
    "$store.state.chat.messages"(messages) {
      this.$store.commit("markMessageAsRead", this.selectedChat)
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.channelId = +to.params.cid

    next()
  }
}
</script>

<style>
.active-channel {
  color: rgb(25, 118, 210);
}
</style>
