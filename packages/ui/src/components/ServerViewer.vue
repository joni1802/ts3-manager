<template>
  <v-container>
    <v-layout>
      <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
        <v-card>
          <v-card-title>{{ serverInfo.virtualserverName }}</v-card-title>
          <v-card-text>
            <v-treeview :items="channelTree" :open="itemIDs" dense>
              <template #label="{ item }">
                <channel
                  v-if="item.channelName"
                  :channel="item"
                  :queryUser="queryUser"
                ></channel>
                <client v-else :client="item"></client>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-speed-dial right bottom fixed>
      <template #activator>
        <v-btn fab color="primary" dark>
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <v-btn fab color="primary" dark small :to="{ name: 'channel-add' }">
        <v-icon>mdi-hexagon-slice-4</v-icon>
      </v-btn>
      <v-btn fab color="primary" dark small :to="{ name: 'spacer-add' }">
        <v-icon>mdi-keyboard-space</v-icon>
      </v-btn>
    </v-speed-dial>
  </v-container>
</template>
<script>
export default {
  components: {
    Channel: () => import("@/components/ServerViewerChannel"),
    Client: () => import("@/components/ServerViewerClient"),
  },
  data() {
    return {
      serverInfo: {},
      channelList: [],
      clientList: [],
      itemIDs: [],
      channelTree: [],
      currentChannel: {},
      textPrivates: [],
    };
  },
  computed: {
    queryUser: {
      get() {
        return this.$store.state.query.queryUser;
      },
      set(value) {
        this.$store.commit("saveUserInfo", value);
      },
    },
  },
  methods: {
    // Props to http://oskarhane.com/create-a-nested-array-recursively-in-javascript/
    createNestedList(list, itemID = 0) {
      let out = [];

      for (let item of list) {
        if (item.parentItemId == itemID) {
          let children = this.createNestedList(list, item.itemId);

          if (children.length) {
            item.children = children;
          }

          out.push(item);
        }
      }

      return out;
    },
    addEventListeners() {
      this.$TeamSpeak.on("clientmoved", this.loadChannelTree);
      this.$TeamSpeak.on("clientconnect", this.loadChannelTree);
      this.$TeamSpeak.on("clientconnect", this.getSingleClientAvatar);
      this.$TeamSpeak.on("clientdisconnect", this.loadChannelTree);
      this.$TeamSpeak.on("channeldelete", this.loadChannelTree);
    },
    removeEventListeners() {
      this.$TeamSpeak.__proto__.removeEventListener(
        "clientmoved",
        this.loadChannelTree
      );
      this.$TeamSpeak.__proto__.removeEventListener(
        "clientconnect",
        this.loadChannelTree
      );
      this.$TeamSpeak.__proto__.removeEventListener(
        "clientconnect",
        this.getSingleClientAvatar
      );
      this.$TeamSpeak.__proto__.removeEventListener(
        "clientdisconnect",
        this.loadChannelTree
      );
      this.$TeamSpeak.__proto__.removeEventListener(
        "channeldelete",
        this.loadChannelTree
      );
    },
    openAllChannels() {
      this.channelList.forEach((channel) =>
        this.itemIDs.push(`${channel.cid}-channel`)
      );
    },
    getSingleClientAvatar(e) {
      this.$store.dispatch("getClientAvatars", [
        e.detail.client.clientDatabaseId,
      ]);
    },
    getAllClientAvatars() {
      this.$store.dispatch(
        "getClientAvatars",
        this.clientList.map((client) => client.clientDatabaseId)
      );
    },
    getServerInfo() {
      return this.$TeamSpeak
        .execute("serverinfo")
        .then((serverinfo) => serverinfo[0]);
    },
    getChannelList() {
      return this.$TeamSpeak.execute("channellist");
    },
    getClientList() {
      return this.$TeamSpeak.execute("clientlist", {}, ["-voice", "-away"]);
    },
    whoAmI() {
      return this.$TeamSpeak.execute("whoami").then((list) => list[0]);
    },
    mergedList(clientlist, channellist) {
      return [...clientlist, ...channellist].map((item) => {
        if (item.clientNickname) {
          return {
            id: `${item.clid}-client`,
            name: item.clientNickname,
            parentItemId: item.cid,
            itemId: null,
            ...item,
          };
        } else {
          return {
            id: `${item.cid}-channel`,
            name: item.channelName,
            itemId: item.cid,
            parentItemId: item.pid,
            ...item,
          };
        }
      });
    },
    getCurrentChannel(channelList, queryUser) {
      return channelList.find(
        (channel) => channel.cid === queryUser.clientChannelId
      );
    },
    async updateCurrentChannel() {
      try {
        this.queryUser = await this.whoAmI();

        this.currentChannel = this.getCurrentChannel(
          this.channelList,
          this.queryUser
        );
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async loadChannelTree() {
      try {
        this.channelList = await this.getChannelList();
        this.clientList = await this.getClientList();

        this.channelTree = this.createNestedList(
          this.mergedList(this.clientList, this.channelList)
        );

        this.openAllChannels();
      } catch (err) {
        this.$toast.error(err.message);
      }

      this.updateCurrentChannel();
    },
  },
  async created() {
    try {
      this.serverInfo = await this.getServerInfo();
      this.serverInfo.unreadMessages = 0;
      this.channelList = await this.getChannelList();
      this.clientList = await this.getClientList();
      this.queryUser = await this.whoAmI();
      this.channelTree = this.createNestedList(
        this.mergedList(this.clientList, this.channelList)
      );
      this.currentChannel = this.getCurrentChannel(
        this.channelList,
        this.queryUser
      );

      this.openAllChannels();

      this.addEventListeners();

      this.getAllClientAvatars();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
  beforeRouteLeave(from, to, next) {
    this.removeEventListeners();

    next();
  },
};
</script>
