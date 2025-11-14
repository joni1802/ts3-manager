<template>
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title> Edit Client </v-card-title>
          <v-card-text>
            <v-text-field
              label="Nickname"
              :placeholder="client.clientNickname"
              disabled
            ></v-text-field>
            <v-textarea label="Description" v-model="description"></v-textarea>
            <v-autocomplete
              :items="availableServerGroups"
              item-text="name"
              item-value="sgid"
              :item-disabled="notSelectableGroup"
              chips
              label="Servergroups"
              multiple
              v-model="selectedGroups"
            >
              <template #item="{ item, attrs }">
                <v-list-item-action>
                  <v-checkbox v-model="attrs.inputValue"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    getServerGroupTypeName(item.type)
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="save" color="primary">OK</v-btn>
            <v-btn text @click="$router.go(-1)" color="primary">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      client: {},
      clientId: this.$route.params.clid,
      servergroups: [],
      selectedGroups: [],
      description: "",
      redirection: "",
      defaultServerGroupId: undefined,
    };
  },
  computed: {
    // Clients can only be member of a regular or a ServerQuery group.
    // Order the groups by the type. Regular groups are listed first.
    availableServerGroups() {
      return this.servergroups
        .filter(({ type }) => type === 1 || type === 2)
        .sort((a, b) => a.type - b.type);
    },
  },
  methods: {
    getServerGroupTypeName(num) {
      switch (num) {
        case 1:
          return "Regular Group";
        case 2:
          return "ServerQuery Group";
      }
    },
    /**
     * You can only add clients to regular server groups. Except the default guest group.
     * @see {@link https://forum.teamspeak.com/threads/125241-Regular-Group-Type-VS-Server-Query-Group-Type-What-Is-It-Used-For?p=431057#post431057}
     * @see {@link https://community.teamspeak.com/t/how-can-i-add-a-group-template/9390/2}
     */
    notSelectableGroup({ sgid, type }) {
      if (sgid === this.defaultServerGroupId) {
        return true;
      } else if (type === 2) {
        return true;
      } else {
        return false;
      }
    },
    getDefaultServerGroupId() {
      return this.$TeamSpeak
        .execute("serverinfo")
        .then((info) => info[0].virtualserverDefaultServerGroup);
    },
    getClientInfo() {
      return this.$TeamSpeak
        .execute("clientinfo", { clid: this.clientId })
        .then((clientinfo) => clientinfo[0]);
    },
    getServergroupList() {
      return this.$TeamSpeak.execute("servergrouplist");
    },
    async save() {
      try {
        await this.changeDescription();
        await this.addServergroups();
        await this.removeServergroups();

        this.$toast.success("Client updated");
      } catch (err) {
        this.$toast.error(err.message);
      }

      this.init();
    },
    getClientServergroups() {
      return this.client.clientServergroups;
    },
    getClientDescription() {
      // if not null
      return this.client.clientDescription
        ? this.client.clientDescription
        : "";
    },
    addServergroups() {
      let groupAddList = this.selectedGroups.filter(
        (sgid) => !this.getClientServergroups().includes(sgid)
      );

      return this.changeMemberships("add", groupAddList);
    },
    removeServergroups() {
      let groupRemoveList = this.getClientServergroups().filter(
        (sgid) => !this.selectedGroups.includes(sgid)
      );

      return this.changeMemberships("remove", groupRemoveList);
    },
    async changeMemberships(type, list) {
      let command = "";

      switch (type) {
        case "add":
          command = "servergroupaddclient";
          break;
        case "remove":
          command = "servergroupdelclient";
      }

      for (let sgid of list) {
        await this.$TeamSpeak.execute(command, {
          sgid: sgid,
          cldbid: this.client.clientDatabaseId,
        });
      }
    },
    async changeDescription() {
      await this.$TeamSpeak.execute("clientedit", {
        clid: this.clientId,
        clientDescription: this.description,
      });
    },
    async init() {
      try {
        this.client = await this.getClientInfo();

        this.servergroups = await this.getServergroupList();
        this.defaultServerGroupId = await this.getDefaultServerGroupId();

        this.selectedGroups = this.getClientServergroups();
        this.description = this.getClientDescription();
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
