<template>
<v-container>
  <v-layout>
    <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
      <v-card>
        <v-card-title>
          <v-layout wrap justify-space-between>
            <v-flex sm6 xs12>
              <v-btn color="error" :disabled="!Boolean(selected.length)" @click="dialog = true">
                <v-icon left>delete</v-icon>
                Remove
              </v-btn>
            </v-flex>
            <v-flex md4 sm6 xs12>
              <v-text-field append-icon="search" label="Search" v-model="filter"></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText"
            :headers="headers"
            :items="preparedBanlist"
            v-model="selected"
            item-key="banid"
            show-select
            :footer-props="{'items-per-page-options': rowsPerPage}"
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
                  <v-list-item :to="{name: 'ban-edit', params: {banid: item.banid}}">
                    <v-list-item-title>
                      Edit Ban
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="dialog = true">
                    <v-list-item-title>
                      Remove Ban
                    </v-list-item-title>
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
              {{ item.duration === 0 ? 'infinite' : calcExpiryDate(item.created, item.duration) }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-btn fab color="pink" fixed bottom right dark @click="addBan">
      <v-icon>add</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          Delete Ban
        </v-card-title>
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
          text: '',
          algin: 'start',
          value: 'actions'
        },
        {
          text: 'Name/IP/UID',
          value: 'name_ip_uid'
        },
        {
          text: 'Reason',
          value: 'reason'
        },
        {
          text: 'Expires',
          value: 'duration'
        }
      ],
      banlist: [],
      selected: [],
      dialog: false,
      rowsPerPage: [
        25,
        50,
        75,
        {
          "text": "$vuetify.dataIterator.rowsPerPageAll",
          "value": -1
        }
      ],
      filter: ''
    }
  },
  computed: {
    // To enable the search for the column "Name/IP/UID"
    preparedBanlist() {
      return this.banlist.map(ban => {
        return {
          ...ban,
          'name_ip_uid': `${ban.name} ${ban.uid} ${ban.ip}`
        }
      })
    }
  },
  methods: {
    getBanList() {
      return this.$TeamSpeak.execute('banlist')
    },
    calcExpiryDate(created, duration) {
      return new Date((created * 1000) + (duration * 1000)).toLocaleString()
    },
    addBan() {
      this.$router.push({
        path: '/ban/add'
      })
    },
    async deleteBans() {
      try {
        for (let ban of this.selected) {
          await this.$TeamSpeak.execute('bandel', {
            banid: ban.banid
          })
        }
      } catch (err) {
        this.$toasted.error(err.message)
      }

      this.dialog = false

      try {
        this.banlist = await this.getBanList()
      } catch (err) {
        this.$toasted.error(err.message)
      }
    }
  },
  async created() {
    try {
      this.banlist = await this.getBanList()
    } catch (err) {
      this.$toasted.error(err.message)
    }
  }
}
</script>
