<template>
  <v-container>
    <v-layout>
      <v-flex md10 xs12 offset-md1>
        <v-card>
          <v-card-title>
            <v-btn
              color="error"
              :disabled="!Boolean(selectedTableItems.length)"
              @click="openDeleteDialog(selectedTableItems)"
            >
              <v-icon left>delete</v-icon>
              Remove
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :no-data-text="
                $store.state.query.loading ? '...loading' : $vuetify.noDataText
              "
              :headers="headers"
              :items="tokens"
              :footer-props="{ 'items-per-page-options': rowsPerPage }"
              show-select
              v-model="selectedTableItems"
              item-key="token"
            >
              <template #item.actions="{ item }">
                <v-menu>
                  <template #activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="openDeleteDialog([item])">
                      <v-list-item-title> Delete Token </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="copyToClipboard(item.token)">
                      <v-list-item-title> Copy Token </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template #item.tokenCreated="{ item }">
                {{ new Date(item.tokenCreated * 1000).toLocaleString() }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title> Delete Token </v-card-title>
          <v-card-text> Do you really want to delete this token? </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="dialog = false">No</v-btn>
            <v-btn text color="primary" @click="deleteToken">Yes</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-btn
        fab
        color="primary"
        fixed
        bottom
        right
        dark
        :to="{ name: 'token-add' }"
      >
        <v-icon>add</v-icon>
      </v-btn>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      tokens: [],
      headers: [
        { text: "", value: "actions", align: "start", sortable: false },
        { text: "Privilege Key", value: "token" },
        { text: "Type", value: "tokenType" },
        { text: "Group", value: "tokenId1" },
        { text: "Channel", value: "tokenId2" },
        { text: "Created", value: "tokenCreated" },
        { text: "Description", value: "tokenDescription" },
      ],
      rowsPerPage: [25, 50, 75, -1],
      selectedTableItems: [],
      tokenRemoveList: [],
    };
  },
  methods: {
    getTokenList() {
      return this.$TeamSpeak.execute("tokenlist");
    },
    openDeleteDialog(tokens) {
      this.tokenRemoveList = tokens;

      this.dialog = true;
    },
    async deleteToken() {
      try {
        for (let token of this.tokenRemoveList) {
          await this.$TeamSpeak.execute("tokendelete", { token: token.token });
        }

        this.dialog = false;
      } catch (err) {
        this.$toast.error(err.message);
      }

      // v-model is not updating correctly when the content of the table changes.
      // Removed content is still in the selectedTableItems array.
      // This is a workaround for this vuetify bug.
      this.selectedTableItems = [];

      this.init();
    },
    copyToClipboard(token) {
      this.$clipboard(token);

      this.$toast.info("Token Copied To Clipboard");
    },
    async init() {
      try {
        this.tokens = await this.getTokenList();
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
