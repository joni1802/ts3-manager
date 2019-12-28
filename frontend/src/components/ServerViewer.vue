<template>
  <v-container>
    <v-layout>
      <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
        <v-card>
          <v-card-text>
            <v-subheader><v-icon>dns</v-icon>{{ serverInfo.virtualserver_name }}</v-subheader>
            <v-treeview :items="channelTree" :open="itemIDs" :style="{maxHeight: '50vh', overflow: 'auto'}">
              <template slot="label" slot-scope="{item}">
                <channel v-if="item.channel_name" :channel="item" :queryUser="queryUser"></channel>
                <client v-else :client="item" :queryUser="queryUser" @privatechat="openTextPrivate"></client>
              </template>
            </v-treeview>
            <v-divider></v-divider>
            <text-messages :queryUser="queryUser" :server="serverInfo" :channel="currentChannel" :clients="textPrivates" @closetextchat="closeTextPrivate" @privatechat="openTextPrivate"></text-messages>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
  export default {
    components: {
      Channel: () => import('@/components/Channel'),
      Client: () => import('@/components/ChannelClients'),
      TextMessages: () => import('@/components/TextMessages')
    },
    data() {
      return {
        serverInfo: {},
        channelList: [],
        clientList: [],
        itemIDs: [],
        queryUser: {},
        channelTree: [],
        currentChannel: {},
        textPrivates: []
      }
    },
    methods: {
      closeTextPrivate(chat) {
        let index = this.textPrivates.map(tab => tab.target).indexOf(chat.target)

        this.textPrivates.splice(index, 1)
      },
      openTextPrivate(client) {
        let openedTargets = this.textPrivates.map(textPrivate => textPrivate.target)

        // Create the chat only if it is not already open
        if(!openedTargets.includes(client.clid)) {
          this.textPrivates.push({name: client.client_nickname, target: client.clid, targetmode: 1})
        }
      },
      // Props to http://oskarhane.com/create-a-nested-array-recursively-in-javascript/
      createNestedList(list, itemID = 0) {
        let out = []

        for(let item of list) {
          if(item.parent_item_id == itemID) {
            let children = this.createNestedList(list, item.item_id)

            if(children.length) {
              item.children = children
            }

            out.push(item)
          }
        }

        return out
      },
      async registerChannelEvent(id) {
        try {
          await this.$TeamSpeak.registerEvent('channel', id)
        } catch(err) {
          this.$toast.error(err.message)
        }
      },
      registerServerNotifications() {
        this.registerChannelEvent(0)
      },
      addEventListeners() {
        this.$TeamSpeak.on('clientmoved', this.loadChannelTree)
        this.$TeamSpeak.on('clientconnect', this.loadChannelTree)
        this.$TeamSpeak.on('clientdisconnect', this.loadChannelTree)
        this.$TeamSpeak.on('channeldelete', this.loadChannelTree)
      },
      removeEventListeners() {
        this.$TeamSpeak.__proto__.removeEventListener('clientmoved', this.loadChannelTree)
        this.$TeamSpeak.__proto__.removeEventListener('clientconnect', this.loadChannelTree)
        this.$TeamSpeak.__proto__.removeEventListener('clientdisconnect', this.loadChannelTree)
        this.$TeamSpeak.__proto__.removeEventListener('channeldelete', this.loadChannelTree)
      },
      openAllChannels() {
        this.channelList.forEach(channel => this.itemIDs.push(`${channel.cid}-channel`))
      },
      getServerInfo() {
        return this.$TeamSpeak.execute('serverinfo').then(serverinfo => serverinfo[0])
      },
      getChannelList() {
        return this.$TeamSpeak.execute('channellist')
      },
      getClientList() {
        return this.$TeamSpeak.execute('clientlist', {}, ['-voice', '-away'])
      },
      whoAmI() {
        return this.$TeamSpeak.execute('whoami').then(list => list[0])
      },
      mergedList(clientlist, channellist) {
        return [...clientlist, ...channellist].map(item => {
          if(item.client_nickname) {
            return {
              id: `${item.clid}-client`,
              name: item.client_nickname,
              parent_item_id: item.cid,
              item_id: null,
              ...item
            }
          } else {
            return {
              id: `${item.cid}-channel`,
              name: item.channel_name,
              item_id: item.cid,
              parent_item_id: item.pid,
              ...item
            }
          }
        })
      },
      getCurrentChannel(channelList, queryUser) {
        return channelList.find(channel => channel.cid === queryUser.client_channel_id)
      },
      async updateCurrentChannel() {
        try {
          this.queryUser = await this.whoAmI()

          this.currentChannel = this.getCurrentChannel(this.channelList, this.queryUser)
        } catch(err) {
          this.$toast.error(err.message)
        }
      },
      async loadChannelTree() {
        try {
          this.channelList = await this.getChannelList()
          this.clientList = await this.getClientList()

          this.channelTree = this.createNestedList(this.mergedList(this.clientList, this.channelList))

          this.openAllChannels()
        } catch(err) {
          this.$toast.error(err.message)
        }

        this.updateCurrentChannel()
      },
    },
    async created() {
      try {
        this.serverInfo = await this.getServerInfo()
        this.serverInfo.unread_messages = 0
        this.channelList = await this.getChannelList()
        this.clientList = await this.getClientList()
        this.queryUser = await this.whoAmI()
        this.channelTree = this.createNestedList(this.mergedList(this.clientList, this.channelList))
        this.currentChannel = this.getCurrentChannel(this.channelList, this.queryUser)

        this.openAllChannels()

        this.addEventListeners()
        this.registerServerNotifications()
      } catch(err) {
        this.$toast.error(err.message)
      }
    },
    watch: {
      currentTab(index) {
        switch(index) {
          case 0:
            this.notification.textServer = 0
            break;
          case 1:
            this.notification.textChannel = 0
            break;
          default:

        }
      }
    },
    beforeRouteLeave(from, to, next) {
      this.removeEventListeners()

      next()
    }
  }

</script>
