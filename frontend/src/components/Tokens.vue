<template>
  <v-container>
    <v-layout>
      <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
        <v-card>
          <v-card-text>
            <v-data-table :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText" :headers="headers" :items="tokens" :rows-per-page-items="rowsPerPage">
              <template slot="items" slot-scope="props">
                <td>{{ props.item.token }}</td>
                <td>{{ props.item.token_type }}</td>
                <td>{{ props.item.token_id1 }}</td>
                <td>{{ props.item.token_id2 }}</td>
                <td>{{ new Date(props.item.token_created * 1000).toLocaleString() }}</td>
                <td>{{ props.item.token_description }}</td>
                <td>
                  <v-icon small class="mr-2" @click="openDeleteDialog(props.item)">delete</v-icon>
                  <v-icon small @click="copyToClipboard(props.item.token)">mdi-content-copy</v-icon>
                </td>
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
            <v-btn flat color="primary" @click="dialog = false">No</v-btn>
            <v-btn flat color="primary" @click="deleteToken">Yes</v-btn>
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
        {text: "Privilege Key", value: "token"},
        {text: "Type", value: "token_type"},
        {text: "Group", value: "token_id1"},
        {text: "Channel", value: "token_id2"},
        {text: "Created", value: "token_created"},
        {text: "Description", value: "token_description"},
        {text: "Action", value: "delete", align: 'right', sortable: false},
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
        this.$toast.error(err.message)
      }

      this.init()
    },
    copyToClipboard(token) {
      this.$clipboard(token)

      this.$toast.info("Token Copied To Clipboard")
    },
    async init() {
      try {
        this.tokens = await this.getTokenList()
      } catch(err) {
        this.$toast.error(err.message)
      }
    }
  },
  created() {
    this.init()
  }
}
</script>
