<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-layout wrap justify-space-between>
              <v-flex sm6 xs12>
                <v-btn
                  color="error"
                  :disabled="!Boolean(selectedTableItems.length)"
                  @click="openRemoveDialog(selectedTableItems)"
                >
                  <v-icon left>delete</v-icon>
                  Remove
                </v-btn>
              </v-flex>
              <v-flex md4 sm6 xs12>
                <v-text-field
                  append-icon="search"
                  label="Search"
                  v-model="search"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :no-data-text="
                $store.state.query.loading ? '...loading' : $vuetify.noDataText
              "
              :headers="headers"
              :items="clientdblist"
              :search="search"
              :footer-props="{ 'items-per-page-options': rowsPerPage }"
              v-model="selectedTableItems"
              show-select
              item-key="cldbid"
            >
              <template #item.name="{ item }">
                <v-menu>
                  <template #activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item :to="`/client/${item.cldbid}/ban`">
                      <v-list-item-title> Ban Client </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openRemoveDialog([item])">
                      <v-list-item-title> Delete Client </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template #item.client_created="{ item }">
                {{ new Date(item.client_created * 1000).toLocaleString() }}
              </template>
              <template #item.client_lastconnected="{ item }">
                {{
                  new Date(item.client_lastconnected * 1000).toLocaleString()
                }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-dialog max-width="500px" v-model="dialog">
        <v-card>
          <v-card-title> Delete Client </v-card-title>
          <v-card-text>
            Do you really want to delete
            <b v-if="clientRemoveList.length === 1">{{
              clientRemoveList[0].client_nickname
            }}</b>
            <b v-else>all selected clients</b> from the list?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog = false" color="primary">No</v-btn>
            <v-btn text @click="deleteClient" color="primary">Yes</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          text: "",
          value: "name",
          align: "start",
          sortable: false,
        },
        {
          text: "Last Nickname",
          value: "client_nickname",
        },
        {
          text: "Unique Identifier",
          value: "client_unique_identifier",
        },
        {
          text: "Created",
          value: "client_created",
        },
        {
          text: "Last",
          value: "client_lastconnected",
        },
        {
          text: "Total",
          value: "client_totalconnections",
        },
        {
          text: "Last IP",
          value: "client_lastip",
        },
        {
          text: "Description",
          value: "client_description",
        },
      ],
      clientdblist: [],
      search: "",
      rowsPerPage: [25, 50, 75, -1],
      dialog: false,
      clientRemoveList: [],
      selectedTableItems: [],
      clientAvatarDialog: false,
    };
  },
  methods: {
    openRemoveDialog(clients) {
      this.clientRemoveList = clients;

      this.dialog = true;
    },
    getClientDbList() {
      return this.$TeamSpeak.fullClientDBList();
    },
    async deleteClient() {
      try {
        for (let client of this.clientRemoveList) {
          await this.$TeamSpeak.execute("clientdbdelete", {
            cldbid: client.cldbid,
          });
        }
      } catch (err) {
        this.$toast.error(err.message);
      }

      // v-model is not updating correctly when the content of the table changes.
      // Removed content is still in the selectedTableItems array.
      // This is a workaround for this vuetify bug.
      this.selectedTableItems = [];

      this.dialog = false;

      this.init();
    },
    async init() {
      try {
        this.clientdblist = await this.getClientDbList();
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
