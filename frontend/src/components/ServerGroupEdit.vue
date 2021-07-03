<template>
  <v-container>
    <v-layout>
      <v-flex xs12 sm6 offset-sm3>
        <v-card>
          <v-card-title> Edit Servergroup </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="serverGroupName"
              label="Name"
              :disabled="$store.state.query.loading"
            ></v-text-field>
            <group-client-list
              v-model="serverGroupClients"
              :clientDbList="clients"
              :disabled="$store.state.query.loading"
            ></group-client-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text
              @click="save"
              :disabled="$store.state.query.loading"
              color="primary"
              >OK</v-btn
            >
            <v-btn text @click="$router.go(-1)" color="primary">Cancel</v-btn>
            <v-btn
              text
              @click="save"
              :disabled="$store.state.query.loading"
              color="primary"
              >Apply</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-dialog v-model="swag"> </v-dialog>
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
      serverGroupId: this.$route.params.sgid,
      serverGroup: {},
      serverGroupClients: [],
      currentServerGroupClients: [],
      clients: [],
      maxVisibleClients: 11,
      swag: false,
      initServerGroupName: undefined,
    };
  },
  computed: {
    availableClients() {
      return this.clients.map((client) => {
        return {
          text: `${client.client_nickname} (${client.cldbid})`,
          value: client.cldbid,
          uid: client.client_unique_identifier,
        };
      });
    },
    serverGroupName: {
      get() {
        return this.serverGroup.name;
      },
      set(name) {
        this.serverGroup.name = name;
      },
    },
  },
  methods: {
    getServerGroup() {
      return this.$TeamSpeak
        .execute("servergrouplist")
        .then((list) => list.find((group) => group.sgid == this.serverGroupId));
    },
    getServerGroupClientList() {
      return this.$TeamSpeak.execute(
        "servergroupclientlist",
        {
          sgid: this.serverGroupId,
        },
        ["-names"]
      );
    },
    getClientDbList() {
      return this.$TeamSpeak.fullClientDBList();
    },
    async renameServerGroup() {
      /** @see {@link https://github.com/joni1802/ts3-manager/issues/27} */
      if (this.serverGroup.name !== this.initServerGroupName) {
        await this.$TeamSpeak.execute("servergrouprename", {
          sgid: this.serverGroupId,
          name: this.serverGroup.name,
        });
      }
    },
    async removeMembers() {
      let clientRemoveList = this.currentServerGroupClients.filter(
        (currentClient) => {
          return !this.serverGroupClients.find(
            (client) => currentClient.cldbid === client.cldbid
          );
        }
      );

      for (let client of clientRemoveList) {
        await this.$TeamSpeak.execute("servergroupdelclient", {
          sgid: this.serverGroupId,
          cldbid: client.cldbid,
        });
      }
    },
    async addMembers() {
      let clientAddList = this.serverGroupClients.filter((client) => {
        return !this.currentServerGroupClients.find(
          (currentClient) => client.cldbid === currentClient.cldbid
        );
      });

      for (let client of clientAddList) {
        await this.$TeamSpeak.execute("servergroupaddclient", {
          sgid: this.serverGroupId,
          cldbid: client.cldbid,
        });
      }
    },
    async save(e) {
      try {
        await this.renameServerGroup();
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
          this.init();
      }
    },
    async init() {
      try {
        this.serverGroup = await this.getServerGroup();
        this.initServerGroupName = this.serverGroup.name;
        this.clients = await this.getClientDbList();
        this.serverGroupClients = await this.getServerGroupClientList();

        this.currentServerGroupClients = [...this.serverGroupClients];
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
  created() {
    this.init();
  },
};
</script>
