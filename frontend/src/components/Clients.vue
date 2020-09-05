<template>
<v-container>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-card-title>
          <v-layout>
            <v-flex md4 sm6 xs12>
              <v-text-field v-model="search" append-icon="search" label="Search"></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-data-table :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText" :headers="headers" :items="clientdblist" :search="search" :rows-per-page-items="rowsPerPage">
            <template slot="items" slot-scope="props">
              <td>{{ props.item.client_nickname }}</td>
              <td>{{ props.item.client_unique_identifier }}</td>
              <td>{{ new Date(props.item.client_created * 1000).toLocaleString() }}</td>
              <td>{{ new Date(props.item.client_lastconnected * 1000).toLocaleString() }}</td>
              <td>{{ props.item.client_totalconnections }}</td>
              <td>{{ props.item.client_lastip }}</td>
              <td>{{ props.item.client_description }}</td>
              <td>
                <v-menu bottom left>
                  <template slot="activator" slot-scope="{ on }">
                    <v-btn v-on="on" icon>
                      <v-icon color="grey lighten-1">more_vert</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item :to="`/client/${props.item.cldbid}/ban`">
                      <v-list-item-title>
                        Ban Client
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openDialog(props.item)">
                      <v-list-item-title>
                        Delete Client
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-dialog max-width="500px" v-model="dialog">
      <v-card>
        <v-card-title>
          Delete Client
        </v-card-title>
        <v-card-text>
          Do you really want to delete <b>{{ selectedClient.client_nickname }}</b> from the list?
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
      headers: [{
          text: 'Last Nickname',
          value: 'client_nickname'
        },
        {
          text: 'Unique Identifier',
          value: 'client_unique_identifier'
        },
        {
          text: 'Created',
          value: 'client_created'
        },
        {
          text: 'Last',
          value: 'client_lastconnected'
        },
        {
          text: 'Total',
          value: 'client_totalconnections'
        },
        {
          text: 'Last IP',
          value: 'client_lastip'
        },
        {
          text: 'Description',
          value: 'client_description'
        },
        {
          text: 'Actions',
          value: 'name',
          sortable: false
        }
      ],
      clientdblist: [],
      search: '',
      rowsPerPage: [
        25,
        50,
        75,
        {
          "text": "$vuetify.dataIterator.rowsPerPageAll",
          "value": -1
        }
      ],
      dialog: false,
      selectedClient: {}
    }
  },
  methods: {
    openDialog(client) {
      this.selectedClient = client
      this.dialog = true
    },
    getClientDbList() {
      return this.$TeamSpeak.fullClientDBList()
    },
    async deleteClient() {
      try {
        await this.$TeamSpeak.execute('clientdbdelete', {
          cldbid: this.selectedClient.cldbid
        })
      } catch (err) {
        this.$toasted.error(err.message, {
          icon: 'error'
        })
      }

      this.dialog = false

      try {
        this.clientdblist = await this.getClientDbList()
      } catch (err) {
        this.$toasted.error(err.message, {
          icon: 'error'
        })
      }
    }
  },
  async created() {
    try {
      this.clientdblist = await this.getClientDbList()
    } catch (err) {
      this.$toasted.error(err.message, {
        icon: 'error'
      })
    }
  }
}
</script>
