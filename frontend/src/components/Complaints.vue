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
          <v-data-table
            :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText"
            :headers="headers"
            :items="complaints"
            v-model="selected"
            item-key="timestamp"
            :footer-props="{'items-per-page-options': rowsPerPage}"
            show-select
          >
            <template #item.actions="{ item }">
              <v-menu>
                <template #activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item :to="`/client/${item.tcldbid}/ban`">
                    <v-list-item-title>
                      Ban <b>{{ item.tname }}</b>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item :to="`/client/${item.fcldbid}/ban`">
                    <v-list-item-title>
                      Ban <b>{{ item.fname }}</b>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openDialog([item])">
                    <v-list-item-title>
                      Remove Complaint
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <template #item.message="{ item }">
              <i>"{{ item.message }}"</i>
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
          <v-btn text color="primary" @click="dialog = false">No</v-btn>
          <v-btn text color="primary" @click="removeComplaints">Yes</v-btn>
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
          align: 'start',
          value: 'actions'
        },
        {
          text: 'Target Nickname',
          value: 'tname'
        },
        {
          text: 'From Nickname',
          value: 'fname'
        },
        {
          text: 'Reason',
          value: 'message'
        },
      ],
      complaints: [],
      selected: [],
      dialog: false,
      selectedComplaints: [],
      rowsPerPage: [
        25,
        50,
        75,
        -1
      ],
    }
  },
  methods: {
    getComplainList() {
      return this.$TeamSpeak.execute('complainlist')
    },
    openDialog(complaints) {
      this.selectedComplaints = complaints
      this.dialog = true
    },
    async removeComplaints() {
      try {
        for (let complaint of this.selectedComplaints) {
          await this.$TeamSpeak.execute('complaindel', {
            tcldbid: complaint.tcldbid,
            fcldbid: complaint.fcldbid,
          })
        }
      } catch (err) {
        this.$toasted.error(err.message)
      }

      this.dialog = false

      try {
        this.complaints = await this.getComplainList()
      } catch (err) {
        this.$toasted.error(err.message)
      }

    }
  },
  async created() {
    try {
      this.complaints = await this.getComplainList()
    } catch (err) {
      this.$toasted.error(err.message)
    }
  }
}
</script>
