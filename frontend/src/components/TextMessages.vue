<template>
  <v-container>
  <v-layout>
  <v-flex xl10 lg12 md12 sm12 xs12 offset-xl1 >

  <v-sheet elevation="2" rounded class="textmessages__wrapper">
    <div :class="{'textmessages__users': true, 'd-none': hideChatTargets, 'd-md-flex': true }">
      <v-list subheader class="my-2">
        <v-subheader>Channels</v-subheader>
        <v-list-item-group :value="selectedChannelItem">
          <channel
            v-for="channel in channelList"
            :key="channel.cid"
            :channel="channel"
            @click="switchTextChannel(channel.cid)"
            :badgeValue="countUnreadMessages({target: channel.cid, targetmode: 2})"
          >
          </channel>
        </v-list-item-group>

        <v-subheader>Clients</v-subheader>
        <client
          v-for="client in clientList"
          :client="client"
          :badgeValue="countUnreadMessages({target: client.clid, targetmode: 1})"
          @click="openTextPrivate(client)"
        >
        </client>
      </v-list>
    </div>

    <div :class="{'textmessages__chat': true, 'd-none': hideChat, 'd-md-flex': true}">
      <div class="d-md-none" style="padding: 10px 0;">
        <v-btn icon @click="closeChatOnMobile">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <div>
        <v-tabs v-model="selectedTab" fixed-tabs show-arrows>
          <!-- Currently used server text messages (not closeable)-->
          <v-tab>
            <v-badge color="error" :value="countUnreadMessages(textServerTab)">
              <template #badge>
                {{ countUnreadMessages(textServerTab) }}
              </template>
              <span>{{ textServerTab.name }}</span>
            </v-badge>
          </v-tab>
          <!-- Currently joined channel text messages (not closeable)-->
          <v-tab>
            <v-badge color="error" :value="countUnreadMessages(textChannelTab)">
              <template #badge>
                {{ countUnreadMessages(textChannelTab) }}
              </template>
              <span>{{ textChannelTab.name }}</span>
            </v-badge>
          </v-tab>
          <!-- Private client text messages (closeable) -->
          <v-tab v-for="(textPrivateTab, index) in textPrivateTabs" :key="index + 2">
            <v-badge color="error" :value="countUnreadMessages(textPrivateTab)">
              <template #badge>
                {{ countUnreadMessages(textPrivateTab) }}
              </template>
              <span>{{ textPrivateTab.name }}<v-icon @click.stop="closeTextPrivate(textPrivateTab)">close</v-icon></span>
            </v-badge>
          </v-tab>
        </v-tabs>
      </div>

      <div class="textmessages__chat--history" ref="chat">
        <v-tabs-items v-model="selectedTab"  >
          <!-- Server text message history -->
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <p class="text-center text--secondary">Server Text Messages</p>
            <div v-for="message in serverTextMessages">
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
          <!-- Channel text message history -->
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <p class="text-center text--secondary">Channel Text Messages</p>
            <div v-for="message in channelTextMessages">
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
          <!-- Private text message histories -->
          <v-tab-item
            v-for="(textPrivateTab, index) in textPrivateTabs"
            :key="index + 2" :transition="false"
            :reverse-transition="false"
          >
            <p class="text-center text--secondary">Private Text Messages</p>
            <div v-for="message in privateTextMessages">
              <div v-if="message.target === textPrivateTab.target">
                <div>
                  <v-icon v-if="message.sender.clid === queryUser.client_id">arrow_upward</v-icon>
                  <v-icon v-else>arrow_downward</v-icon>
                  {{ new Date(message.meta.timestamp).toLocaleString() }} <b>{{ message.sender.client_nickname }}</b>
                </div>
                <div>
                  {{ message.text }}
                </div>
              </div>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>

      <div>
        <v-text-field :append-icon="'send'" label="Send Message" v-model="message" @click:append="sendMessage" @keyup="keyPressed" ></v-text-field>
      </div>

    </div>
  </v-sheet>

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
  components: {
    Client: () => import("@/components/TextMessageClient"),
    Channel: () => import("@/components/TextMessageChannel")
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
      message: '',
      hideChatTargets: false,
      hideChat: false,
    }
  },
  computed: {
    selectedChannelItem() {
      return this.channelList.findIndex(channel => channel.cid === this.channelId)
    },
    currentJoinedChannel() {
      return this.channelList.find(channel => channel.cid === this.channelId)
    },
    textServerTab() {
      return {
        name: this.serverInfo.virtualserver_name,
        target: this.serverInfo.virtualserver_id,
        targetmode: 3
      }
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
    serverTextMessages() {
      return this.$store.state.chat.messages.filter(message => {
        return (
          message.targetmode === 3 &&
          message.serverId === this.$store.state.query.serverId
        )
      })
    },
    channelTextMessages() {
      return this.$store.state.chat.messages.filter(message => {
        return (
          message.targetmode === 2 &&
          message.target === this.textChannelTab.target &&
          message.serverId === this.$store.state.query.serverId
        )
      })
    },
    privateTextMessages() {
      return this.$store.state.chat.messages.filter(message => {
        return (
          message.targetmode === 1 &&
          message.serverId === this.$store.state.query.serverId
        )
      })
    },
    selectedChat() {
      switch (this.selectedTab) {
        case 0: return this.textServerTab
        case 1: return this.textChannelTab
        default:
          if (this.textPrivateTabs.length) {
            return this.textPrivateTabs[this.selectedTab - 2]
          }
      }
    }
  },
  methods: {
    openChatOnMobile() {
      this.hideChatTargets = true

      this.hideChat = false
    },
    closeChatOnMobile() {
      this.hideChat = true

      this.hideChatTargets = false
    },
    clientStatusIcon(client) {
      if (client.client_away === 1) {
        return 'cancel_presentation'
      } else if (client.client_output_muted === 1) {
        return 'volume_off'
      } else if (client.client_input_muted === 1) {
        return 'mic_off'
      } else {
        return 'fiber_manual_record'
      }
    },
    countUnreadMessages(textChannel) {
      let {target, targetmode} = textChannel

      return this.$store.state.chat.messages.filter(message => {
        return message.target === target &&
          message.targetmode === targetmode &&
          message.meta.unread
      }).length
    },
    getClientList() {
      return this.$TeamSpeak.execute('clientlist', {}, ['-voice', '-away'])
    },
    async updateClientList(_e) {
      try {
        this.clientList = await this.getClientList()
      } catch(err) {
        this.$toast.error(err.message)
      }
    },
    getChannelList() {
      return this.$TeamSpeak.execute('channellist')
    },
    async updateChannelList() {
      try {
        this.channelList = await this.getChannelList()
      } catch(err) {
        this.$toast.error(err.message)
      }
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
        this.openChatOnMobile()

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
      this.openChatOnMobile()

      let openedTargets = this.textPrivateTargets.map(client => client.clid)

      // Create the chat only if it is not already open
      if (!openedTargets.includes(client.clid)) this.textPrivateTargets.push(client)

      // Focus tab
      if(focus)
        this.selectedTab = 2 + this.textPrivateTargets.map(client => client.clid).indexOf(client.clid)
    },
    scrollBottom() {
      // Timeout is a workaround.
      // Otherwise scrollTop is not updating corretly when switching between tabs.
      setTimeout(() => {
        this.$refs.chat.scrollTop =  this.$refs.chat.scrollHeight
      }, 100)
    },
    addEventListeners() {
      this.$TeamSpeak.on("clientconnect", this.updateClientList)
      this.$TeamSpeak.on('clientconnect', this.getSingleClientAvatar)
      this.$TeamSpeak.on("clientdisconnect", this.updateClientList)
      this.$TeamSpeak.on("channeledit", this.updateChannelList)
      this.$TeamSpeak.on("channelcreate", this.updateChannelList)
      this.$TeamSpeak.on("channeldelete", this.updateChannelList)
    },
    removeEventListeners() {
      this.$TeamSpeak.__proto__.removeEventListener("clientconnect", this.updateClientList)
      this.$TeamSpeak.__proto__.removeEventListener('clientconnect', this.getSingleClientAvatar)
      this.$TeamSpeak.__proto__.removeEventListener("clientdisconnect", this.updateClientList)
      this.$TeamSpeak.__proto__.removeEventListener("channeledit", this.updateChannelList)
      this.$TeamSpeak.__proto__.removeEventListener("channelcreate", this.updateChannelList)
      this.$TeamSpeak.__proto__.removeEventListener("channeldelete", this.updateChannelList)
    },
    getSingleClientAvatar(e) {
      this.$store.dispatch('getClientAvatars', [e.detail.client.client_database_id])
    },
    getAllClientAvatars() {
      this.$store.dispatch('getClientAvatars', this.clientList.map(client => client.client_database_id))
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
          targetmode,
          target,
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
          this.openTextPrivate(this.clientList.find(client => client.clid === +this.$route.query.client))
        }

        this.addEventListeners()

        this.getAllClientAvatars()
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
      this.$nextTick(() => {
        this.scrollBottom()
      })

      this.$store.commit("markMessageAsRead", chat)
    },
    "$store.state.chat.messages"(messages) {
      this.$nextTick(() => {
        this.scrollBottom()
      })

      this.$store.commit("markMessageAsRead", this.selectedChat)
    },
    "$vuetify.breakpoint.smAndDown": {
      immediate: true,
      handler(smAndDown) {
        this.hideChat = true

        this.hideChatTargets = false
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.channelId = +to.params.cid

    next()
  },
  beforeRouteLeave(from, to, next) {
    this.removeEventListeners()

    next()
  }
}
</script>

<style scoped>
  .textmessages__wrapper {
    display: flex;
    height: calc(100vh - 90px);
  }

  .textmessages__users {
    overflow-y: auto;
    width: 400px;
    flex-grow: 1;
  }

  .textmessages__chat {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    padding: 0 20px;
    flex-grow: 1;
  }

  .textmessages__chat--history {
    flex-grow: 1;
    overflow-y: auto;
  }
</style>
