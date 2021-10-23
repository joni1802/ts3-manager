<template>
  <v-container>
    <v-layout>
      <v-flex md6 sm8 xs12 offset-md3 offset-sm2>
        <v-card>
          <v-card-title> Channel Group Edit </v-card-title>
          <v-card-text>
            <v-text-field
              label="Channel Group Name"
              v-model="channelGroupName"
              :disabled="loading"
            ></v-text-field>
            <v-autocomplete
              :items="channelSelection"
              label="Channel"
              v-model="selectedChannel"
              :disabled="loading"
            ></v-autocomplete>
            <group-client-list
              v-model="selectedClients"
              :clientDbList="clients"
              :disabled="disabled || loading"
            ></group-client-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="save" color="primary">OK</v-btn>
            <v-btn text @click="$router.go(-1)" color="primary">Cancel</v-btn>
            <v-btn text @click="save" color="primary">Apply</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  components: {
    GroupClientList: () => import("@/components/GroupClientList"),
  },
  data() {
    return {
      channelGroup: {},
      channelGroupId: this.$route.params.cgid,
      defaultChannelGroupId: undefined, // for removing clients
      channels: [],
      selectedChannel: undefined, // current cid
      clients: [],
      selectedClients: [],
      currentClients: [],
      disabled: true,
      maxVisibleClients: 11,
      initChannelGroupName: undefined,
    };
  },
  computed: {
    loading() {
      return !!this.$store.state.query.loading;
    },
    channelGroupName: {
      get() {
        return this.channelGroup.name;
      },
      set(name) {
        this.channelGroup.name = name;
      },
    },
    channelSelection() {
      return this.channels.map((channel) => {
        return {
          text: channel.channel_name,
          value: channel.cid,
        };
      });
    },
    clientSelection() {
      return this.clients.map((client) => {
        return {
          text: `${client.client_nickname} (${client.cldbid})`,
          value: client.cldbid,
          uid: client.client_unique_identifier,
        };
      });
    },
  },
  methods: {
    getDefaultChannelGroup() {
      return this.$TeamSpeak
        .execute("serverinfo")
        .then((info) => info[0].virtualserver_default_channel_group);
    },
    getChannelGroup() {
      return this.$TeamSpeak
        .execute("channelgrouplist")
        .then((list) =>
          list.find((group) => group.cgid == this.channelGroupId)
        ); // just double '==' cause this.$route.params.cgid is always a string
    },
    getChannelList() {
      return this.$TeamSpeak.execute("channellist");
    },
    getClientDbList() {
      return this.$TeamSpeak.fullClientDBList();
    },
    getChannelGroupClientList() {
      return this.$TeamSpeak.execute("channelgroupclientlist", {
        cgid: this.channelGroupId,
        cid: this.selectedChannel,
      });
    },
    async renameChannelGroupName() {
      try {
        /** @see {@link https://github.com/joni1802/ts3-manager/issues/27} */
        if (this.channelGroupName !== this.initChannelGroupName) {
          await this.$TeamSpeak.execute("channelgrouprename", {
            cgid: this.channelGroupId,
            name: this.channelGroupName,
          });
        }
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async changeMembers(list, cgid) {
      for (let client of list) {
        try {
          await this.$TeamSpeak.execute("setclientchannelgroup", {
            cgid: cgid,
            cid: this.selectedChannel,
            cldbid: client.cldbid,
          });
        } catch (err) {
          this.$toast.error(err.message);
        }
      }
    },
    // Remove means: put client in the default channel group of the virtual server
    async removeMembers() {
      let clientRemoveList = this.currentClients.filter((currentClient) => {
        return !this.selectedClients.find(
          (client) => client.cldbid === currentClient.cldbid
        );
      });

      await this.changeMembers(clientRemoveList, this.defaultChannelGroupId);
    },
    async addMembers() {
      let clientAddList = this.selectedClients.filter((client) => {
        return !this.currentClients.find(
          (currentClient) => currentClient.cldbid === client.cldbid
        );
      });

      await this.changeMembers(clientAddList, this.channelGroupId);
    },
    async save(e) {
      try {
        await this.renameChannelGroupName();
        await this.removeMembers();
        await this.addMembers();
      } catch (err) {
        this.$toast.error(err.message);
      }

      switch (e.target.textContent) {
        case "OK":
          this.$router.go(-1);
          break;
        case "Apply":
          try {
            this.channelGroup = await this.getChannelGroup();
          } catch (err) {
            this.$toast.error(err.message);
          }

          try {
            // It is possible to just rename the group without selecting a specific channel
            if (this.selectedChannel) {
              this.selectedClients = await this.getChannelGroupClientList();
              this.currentClients = [...this.selectedClients];
            }
          } catch (err) {
            this.$toast.error(err.message);
          }
      }
    },
  },
  async created() {
    try {
      this.defaultChannelGroupId = await this.getDefaultChannelGroup();
      this.channelGroup = await this.getChannelGroup();
      this.initChannelGroupName = this.channelGroup.name;
      this.channels = await this.getChannelList();
      this.clients = await this.getClientDbList();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
  watch: {
    async selectedChannel() {
      this.disabled = false;

      this.selectedClients = await this.getChannelGroupClientList();
      this.currentClients = [...this.selectedClients];
    },
  },
};
</script>
