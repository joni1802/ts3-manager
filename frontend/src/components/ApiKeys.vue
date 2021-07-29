<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="6">
        <v-card>
          <v-card-title>
            <v-btn
              color="error"
              :disabled="!selectedKeys.length"
              @click="deleteDialog = true"
            >
              <v-icon left>delete</v-icon>
              Remove
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="tableItems"
              item-key="id"
              show-select
              v-model="selectedKeys"
            >
              <template #item.clientNickname="{ item }">
                <v-chip>{{ item.clientNickname }} ({{ item.cldbid }})</v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-btn fab color="primary" fixed bottom right dark @click="addApiKey">
      <v-icon>add</v-icon>
    </v-btn>
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title> Delete API Key </v-card-title>
        <v-card-text>
          Do you really want to delete the selected API key(s)?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="deleteDialog = false">No</v-btn>
          <v-btn text color="primary" @click="removeApiKeys">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          text: "Client",
          sortable: true,
          align: "start",
          value: "clientNickname",
        },
        {
          text: "Scope",
          sortable: true,
          align: "start",
          value: "scope",
        },
        {
          text: "Created At",
          sortable: true,
          align: "start",
          value: "createdAt",
        },
        {
          text: "Expires At",
          sortable: true,
          align: "start",
          value: "expiresAt",
        },
      ],
      apiKeys: [],
      dbClients: [],
      selectedKeys: [],
      deleteDialog: false,
    };
  },
  computed: {
    tableItems() {
      return this.apiKeys.map((key) => {
        let client = this.dbClients.find(
          (client) => client.cldbid === key.cldbid
        );

        return {
          id: key.id,
          clientNickname: client ? client.client_nickname : "serveradmin",
          cldbid: key.cldbid,
          scope: key.scope,
          createdAt: new Date(key.created_at * 1000).toLocaleString(),
          expiresAt: new Date(key.expires_at * 1000).toLocaleString(),
        };
      });
    },
  },
  methods: {
    addApiKey() {
      this.$router.push({ name: "apikey-add" });
    },
    getApiKeys() {
      return this.$TeamSpeak.execute("apikeylist", {
        cldbid: "*",
      });
    },
    getDbClients() {
      return this.$TeamSpeak.fullClientDBList();
    },
    async removeApiKeys() {
      try {
        for (let key of this.selectedKeys) {
          await this.$TeamSpeak.execute("apikeydel", { id: key.id });
        }

        this.deleteDialog = false;
      } catch (err) {
        this.$toast.error(err.message);
      }

      // v-model is not updating correctly when the content of the table changes.
      // Removed content is still in the selectedKeys array.
      // This is a workaround for this vuetify bug.
      this.selectedKeys = [];

      this.init();
    },
    async init() {
      try {
        this.apiKeys = await this.getApiKeys();
        this.dbClients = await this.getDbClients();
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
