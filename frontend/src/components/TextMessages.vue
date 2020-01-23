<template>
<div>
  <v-tabs v-model="selectedTab" show-arrows>
    <v-tab>{{ textServerTab.name }}</v-tab>
    <v-tab>{{ textChannelTab.name }}</v-tab>
    <v-tab v-for="(textPrivate, index) in textPrivateTabs" :key="index + 2">
      {{ textPrivate.name }}
      <v-icon @click="closeTextChat(textPrivate)">close</v-icon>
    </v-tab>
  </v-tabs>
  <v-tabs-items>
    <v-tab-item>
      <v-list dense ref="chat" :style="{height: '20vh', overflow: 'auto'}">
        <v-list-tile v-for="message in chatMessages">
          <v-list-tile-avatar>
            <v-icon>mdi-chat</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ message.text }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ message.timestamp }} <b>{{ message.sender }}</b></v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-tab-item>
  </v-tabs-items>
  <v-text-field :append-icon="'send'" label="Send Message" v-model="message" @click:append="sendMessage" @keyup="keyPressed">
  </v-text-field>
</div>
</template>

<script>
export default {
  props: {
    server: Object,
    channel: Object,
    clients: Array,
    queryUser: Object
  },
  data() {
    return {
      selectedChat: {},
      messages: [],
      message: '',
      selectedTab: 0
    }
  },
  computed: {
    chatMessages() {
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

      return this.messages.filter(message => message.target === this.selectedChat.target && message.targetmode === this.selectedChat.targetmode)
    },
    textServerTab() {
      return {
        name: this.server.virtualserver_name,
        target: this.server.virtualserver_id,
        targetmode: 3
      }
    },
    textChannelTab() {
      return {
        name: this.channel.channel_name,
        target: this.channel.cid,
        targetmode: 2
      }
    },
    textPrivateTabs() {
      return this.clients
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
      this.$TeamSpeak.on('textmessage', this.saveTextMessages)
    },
    removeTextListener() {
      this.$TeamSpeak.__proto__.removeEventListener('textmessage', this.saveTextMessage)
    },
    localeDate(value) {
      return new Date(value).toLocaleDateString(navigator.language, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    },
    addTextMessage(text, target, targetmode, sender) {
      this.messages.push({
        text,
        target,
        targetmode,
        sender,
        timestamp: this.localeDate(Date.now())
      })
    },
    saveTextMessages(e) {
      let notification = e.detail

      if (notification.invoker.clid !== this.queryUser.client_id) {
        switch (notification.targetmode) {
          case 1:
            this.$emit('privatechat', notification.invoker)

            this.addTextMessage(notification.msg, notification.invoker.clid, 1, notification.invoker.client_nickname)
            break;
          case 2:
            this.addTextMessage(notification.msg, this.channel.cid, 2, notification.invoker.client_nickname)
            break;
          case 3:
            this.addTextMessage(notification.msg, this.server.virtualserver_id, 3, notification.invoker.client_nickname)
        }
      }
    },
    async sendMessage() {
      try {
        await this.$TeamSpeak.execute('sendtextmessage', {
          targetmode: this.selectedChat.targetmode,
          target: this.selectedChat.target,
          msg: this.message
        })

        this.addTextMessage(this.message, this.selectedChat.target, this.selectedChat.targetmode, this.queryUser.client_nickname)

        this.message = ''
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    keyPressed(e) {
      if (e.keyCode === 13) this.sendMessage()
    },
    closeTextChat(chat) {
      // Go to the next sibling if a private chat gets closed to prevent errors.
      this.focusPreviousTab(chat)

      this.$emit('closetextchat', chat)
    },
    scrollBottom() {
      this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight
    },
    focusPreviousTab(chat) {
      let index = this.textPrivateTabs.map(textPrivate => textPrivate.target).indexOf(chat.target)

      this.selectedTab = index + 1
    }
  },
  created() {
    this.registerTextEvents()
    this.addTextListener()

    this.selectedTab = 0
  },
  watch: {
    chatMessages() {
      this.$nextTick(() => {
        this.scrollBottom()
      })
    }
  },
  beforeDestroy() {
    this.removeTextListener()
  }
}
</script>
