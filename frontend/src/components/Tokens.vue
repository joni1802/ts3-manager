<template>
  <v-container>
    <v-layout>
      <v-flex md10 xs12 offset-md1>
        <v-card>
          <v-card-text>
            <v-data-table
              :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText"
              :headers="headers"
              :items="tokens"
              :footer-props="{'items-per-page-options': rowsPerPage}"
            >
              <template #item.actions="{ item }">
                <v-menu>
                  <template #activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="openDeleteDialog(item)">
                      <v-list-item-title>
                        Delete Token
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="copyToClipboard(item.token)">
                      <v-list-item-title>
                        Copy Token
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template #item.token_created="{ item }">
                {{ new Date(item.token_created * 1000).toLocaleString() }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            Delete Token
          </v-card-title>
          <v-card-text>
            Do you really want to delete this token?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="dialog = false">No</v-btn>
            <v-btn text color="primary" @click="deleteToken">Yes</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-btn fab color="pink" fixed bottom right dark :to="{name: 'token-add'}">
        <v-icon>add</v-icon>
      </v-btn>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      selectedToken: {},
      dialog: false,
      tokens: [],
      headers: [
        {text: "", value: "actions", align: 'start', sortable: false},
        {text: "Privilege Key", value: "token"},
        {text: "Type", value: "token_type"},
        {text: "Group", value: "token_id1"},
        {text: "Channel", value: "token_id2"},
        {text: "Created", value: "token_created"},
        {text: "Description", value: "token_description"},
      ],
      rowsPerPage: [
        25,
        50,
        75,
        {
          "text": "$vuetify.dataIterator.rowsPerPageAll",
          "value": -1
        }
      ],
    }
  },
  methods: {
    getTokenList() {
      return this.$TeamSpeak.execute("tokenlist")
    },
    openDeleteDialog(token) {
      this.selectedToken = token

      this.dialog = true
    },
    async deleteToken() {
      try {
        await this.$TeamSpeak.execute("tokendelete", {token: this.selectedToken.token})

        this.dialog = false
      } catch(err) {
        this.$toasted.error(err.message)
      }

      this.init()
    },
    copyToClipboard(token) {
      this.$clipboard(token)

      this.$toasted.info("Token Copied To Clipboard")
    },
    async init() {
      try {
        this.tokens = await this.getTokenList()
      } catch(err) {
        this.$toasted.error(err.message)
      }
    }
  },
  created() {
    this.init()
  }
}
</script>
