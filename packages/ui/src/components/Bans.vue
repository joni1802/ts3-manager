<template>
  <v-container>
    <v-layout>
      <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
        <v-card>
          <v-card-title>
            <v-layout wrap justify-space-between>
              <v-flex sm6 xs12>
                <v-btn
                  color="error"
                  :disabled="!Boolean(selectedTableItems.length)"
                  @click="openDialog(selectedTableItems)"
                >
                  <v-icon left>delete</v-icon>
                  Remove
                </v-btn>
              </v-flex>
              <v-flex md4 sm6 xs12>
                <v-text-field
                  append-icon="search"
                  label="Search"
                  v-model="filter"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :no-data-text="loading ? '...loading' : $vuetify.noDataText"
              :headers="headers"
              :items="preparedBanlist"
              v-model="selectedTableItems"
              item-key="banid"
              show-select
              :footer-props="{ 'items-per-page-options': rowsPerPage }"
              :search="filter"
            >
              <template #item.actions="{ item }">
                <v-menu>
                  <template #activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      :to="{ name: 'ban-edit', params: { banid: item.banid } }"
                    >
                      <v-list-item-title> Edit Ban </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openDialog([item])">
                      <v-list-item-title> Remove Ban </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template #item.name_ip_uid="{ item }">
                <span v-if="item.ip">ip = {{ item.ip }}, </span>
                <span v-if="item.name">name = {{ item.name }}, </span>
                <span v-if="item.uid">uid = {{ item.uid }}, </span>
              </template>
              <template #item.duration="{ item }">
                {{
                  item.duration === 0
                    ? "infinite"
                    : calcExpiryDate(item.created, item.duration)
                }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-btn fab color="primary" fixed bottom right dark @click="addBan">
        <v-icon>add</v-icon>
      </v-btn>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title> Delete Ban </v-card-title>
          <v-card-text>
            Do you really want to delete the selected ban(s)?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="dialog = false">No</v-btn>
            <v-btn text color="primary" @click="deleteBans">Yes</v-btn>
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
          algin: "start",
          value: "actions",
        },
        {
          text: "Name/IP/UID",
          value: "name_ip_uid",
        },
        {
          text: "Reason",
          value: "reason",
        },
        {
          text: "Expires",
          value: "duration",
        },
      ],
      banlist: [],
      selectedTableItems: [],
      dialog: false,
      rowsPerPage: [25, 50, 75, -1],
      filter: "",
      banRemoveList: [],
    };
  },
  computed: {
    loading() {
      return !!this.$store.state.query.loading;
    },
    // To enable the search for the column "Name/IP/UID"
    preparedBanlist() {
      return this.banlist.map((ban) => {
        return {
          ...ban,
          name_ip_uid: `${ban.name} ${ban.uid} ${ban.ip}`,
        };
      });
    },
  },
  methods: {
    openDialog(bans) {
      this.banRemoveList = bans;

      this.dialog = true;
    },
    getBanList() {
      return this.$TeamSpeak.execute("banlist");
    },
    calcExpiryDate(created, duration) {
      return new Date(created * 1000 + duration * 1000).toLocaleString();
    },
    addBan() {
      this.$router.push({
        path: "/ban/add",
      });
    },
    async deleteBans() {
      try {
        for (let ban of this.banRemoveList) {
          await this.$TeamSpeak.execute("bandel", {
            banid: ban.banid,
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
        this.banlist = await this.getBanList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
  async created() {
    this.init();
  },
};
</script>
