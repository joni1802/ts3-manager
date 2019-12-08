<template>
  <v-container>
    <v-layout>
      <v-flex md8 sm10 xs12 offset-md2 offset-sm1>
        <v-card>
          <v-card-title>
            <v-btn color="error" :disabled="!Boolean(selected.length)" @click="openDialog(selected)">
              <v-icon left>delete</v-icon>
              Remove
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="complaints" v-model="selected" item-key="timestamp" :rows-per-page-items="rowsPerPage">
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
                  <td>{{ props.item.tname }}</td>
                  <td>{{ props.item.fname }}</td>
                  <td><i>"{{ props.item.message }}"</i></td>
                  <td>
                    <v-menu bottom left>
                      <template slot="activator" slot-scope="{ on }">
                        <v-btn v-on="on" icon @click.native.stop.prevent >
                          <v-icon color="grey lighten-1">more_vert</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-tile :to="`/client/${props.item.tcldbid}/ban`">
                          <v-list-tile-title>
                            Ban <b>{{ props.item.tname }}</b>
                          </v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile :to="`/client/${props.item.fcldbid}/ban`">
                          <v-list-tile-title>
                            Ban <b>{{ props.item.fname }}</b>
                          </v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile @click="openDialog([props.item])" >
                          <v-list-tile-title>
                            Remove
                          </v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            Remove Complaints
          </v-card-title>
          <v-card-text>
            Do you really want to remove the selected complaint(s)?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="dialog = false">No</v-btn>
            <v-btn flat color="primary" @click="removeComplaints">Yes</v-btn>
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
          {text: 'Target Nickname', value: 'tname'},
          {text: 'From Nickname', value: 'fname'},
          {text: 'Reason', value: 'message'},
          {text: 'Actions', value: 'actions'}
        ],
        complaints: [],
        selected: [],
        dialog: false,
        selectedComplaints: [],
        rowsPerPage: [
          25,
          50,
          75,
          {"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}
        ],
      }
    },
    methods: {
      getComplainList() {
        return this.$TeamSpeak.execute('complainlist')
      },
      toggleAll() {
        // I do not understand this method at all but it works
        if(this.selected.length) {
          this.selected = []
        } else {
          this.selected = this.complaints.slice()
        }
      },
      openDialog(complaints) {
        this.selectedComplaints = complaints
        this.dialog = true
      },
      async removeComplaints() {
        try {
          for(let complaint of this.selectedComplaints) {
            await this.$TeamSpeak.execute('complaindel', {
              tcldbid: complaint.tcldbid,
              fcldbid: complaint.fcldbid,
            })
          }
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        this.dialog = false

        try {
          this.complaints = await this.getComplainList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

      }
    },
    async created() {
      try {
        this.complaints = await this.getComplainList()
      } catch(err) {
        this.$toast.error(err.message, {icon: 'error'})
      }
    }
  }
</script>
