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
              <v-btn @click="editBan" :disabled="!Boolean(selected.length)">
                <v-icon left>edit</v-icon>
                Edit
              </v-btn>
            </v-flex>
            <v-flex md4 sm6 xs12>
              <v-text-field append-icon="search" label="Search" v-model="filter"></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-data-table :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText" :headers="headers" :items="preparedBanlist" v-model="selected" item-key="banid" select-all :rows-per-page-items="rowsPerPage" :search="filter">
            <template slot="headers" slot-scope="props">
              <th>
                <v-checkbox :input-value="props.all" hide-details @click.stop="toggleAll"></v-checkbox>
              </th>
              <th v-for="header in props.headers" :key="header.text" class="text-xs-left">
                {{ header.text }}
              </th>
            </template>
            <template slot="items" slot-scope="props">
              <tr :active="props.selected" @click="props.selected = !props.selected">
                <td>
                  <v-checkbox :input-value="props.selected" hide-details></v-checkbox>
                </td>
                <td>
                  <span v-if="props.item.ip">ip = {{ props.item.ip }}, </span>
                  <span v-if="props.item.name">name = {{ props.item.name }}, </span>
                  <span v-if="props.item.uid">uid = {{ props.item.uid }}, </span>
                </td>
                <td>{{ props.item.reason }}</td>
                <td>{{ props.item.duration === 0 ? 'infinite' : calcExpiryDate(props.item.created, props.item.duration) }}</td>
              </tr>
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
      headers: [{
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
    toggleAll() {
      // I do not understand this method at all but it works
      if (this.selected.length) {
        this.selected = []
      } else {
        this.selected = this.banlist.slice()
      }
    },
    calcExpiryDate(created, duration) {
      return new Date((created * 1000) + (duration * 1000)).toLocaleString()
    },
    addBan() {
      this.$router.push({
        path: '/ban/add'
      })
    },
    editBan() {
      this.$router.push({
        name: 'ban-edit',
        params: {
          banid: this.selected[0].banid
        }
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
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }

      this.dialog = false

      try {
        this.banlist = await this.getBanList()
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }
    }
  },
  async created() {
    try {
      this.banlist = await this.getBanList()
    } catch (err) {
      this.$toast.error(err.message, {
        icon: 'error'
      })
    }
  }
}
</script>
