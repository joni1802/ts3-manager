<template>
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title> Edit Client </v-card-title>
          <v-card-text>
            <v-text-field
              label="Nickname"
              :placeholder="client.client_nickname"
              disabled
            ></v-text-field>
            <v-textarea label="Description" v-model="description"></v-textarea>
            <v-autocomplete
              :items="availableServerGroups"
              item-text="name"
              item-value="sgid"
              :item-disabled="checkDefaultGroup"
              chips
              label="Servergroups"
              multiple
              v-model="selectedGroups"
            ></v-autocomplete>
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
    // Only show server groups based on the client type
    availableServerGroups() {
      // normale client
      if (this.client.client_type === 0) {
        return this.servergroups.filter(({ type }) => type === 1);
      }

      // ServerQuery client
      if (this.client.client_type === 1) {
        return this.servergroups.filter(({ type }) => type === 2);
      }
    },
  },
  methods: {
    checkDefaultGroup({ sgid }) {
      return sgid === this.defaultServerGroupId;
    },
    getDefaultServerGroupId() {
      return this.$TeamSpeak
        .execute("serverinfo")
        .then((info) => info[0].virtualserver_default_server_group);
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
      return this.client.client_servergroups;
    },
    getClientDescription() {
      // if not null
      return this.client.client_description
        ? this.client.client_description
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
          cldbid: this.client.client_database_id,
        });
      }
    },
    async changeDescription() {
      await this.$TeamSpeak.execute("clientedit", {
        clid: this.clientId,
        client_description: this.description,
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
