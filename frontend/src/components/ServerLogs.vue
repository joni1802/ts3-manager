<template lang="html">
  <v-container>
    <v-layout>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-layout wrap justify-space-between>
              <v-flex xs12 sm5 md4>
                <v-layout wrap>
                  <v-flex>
                    <v-checkbox v-model="levels.critical" label="Critical"></v-checkbox>
                  </v-flex>
                  <v-flex>
                    <v-checkbox v-model="levels.errors" label="Errors"></v-checkbox>
                  </v-flex>
                  <v-flex>
                    <v-checkbox v-model="levels.warning" label="Warning"></v-checkbox>
                  </v-flex>
                  <v-flex>
                    <v-checkbox v-model="levels.info" label="Info"></v-checkbox>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs12 sm5 md3>
                <v-select :items="timezones" v-model="selectedTimezone" label="Timestamp"></v-select>
              </v-flex>
              <v-flex xs12 sm5 md3>
                <v-text-field label="Filter" v-model="filter"></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :items="logItems"
              :headers="headers"
              :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText"
              :rows-per-page-items="rowsPerPage"
              :search="filter"
            >
              <template slot="items" slot-scope="{item}">
                <td>{{ item.timestamp }}</td>
                <td>{{ item.level }}</td>
                <td>{{ item.channel }}</td>
                <td>{{ item.msg }}</td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      logs: [],
      rowsPerPage: [
        100,
        150,
        200,
        {
          "text": "$vuetify.dataIterator.rowsPerPageAll",
          "value": -1
        }
      ],
      filter: '',
      headers: [
        {
          text: 'Timestamp',
          value: 'timestamp'
        },
        {
          text: 'Level',
          value: 'level'
        },
        {
          text: 'Channel',
          value: 'channel'
        },
        {
          text: 'Message',
          value: 'msg',
        },
      ],
      levels: {
        critical: true,
        errors: true,
        warning: true,
        info: true
      },
      selectedTimezone: 'local',
      timezones: [
        {
          text: 'UTC Time',
          value: 'utc'
        },
        {
          text: 'Locale Time',
          value: 'local'
        }
      ]
    }
  },
  computed: {
    /**
     * Parse original log string into a javascript object.
     * @return {Array}
     */
    logItems() {
      let allLogs = this.logs.map(({l}) => {
        let [timestamp, level, channel, sid, msg] = l.split('|')

        return {
          timestamp: this.selectedTimezone === 'utc' ?
            this.getUTCDateString(timestamp) : this.getLocaleDateString(timestamp),
          level,
          channel,
          sid,
          msg
        }
      })

      // Filter array by level
      return allLogs.filter(log => {
        switch(log.level.trim().toLowerCase()) {
          case 'critical':
            return this.levels.critical
          case 'errors':
            return this.levels.errors
          case 'warning':
            return this.levels.warning
          case 'info':
            return this.levels.info
        }
      })
    }
  },
  methods: {
    getServerLogs() {
      return this.$TeamSpeak.execute('logview')
    },
    /**
     * Add the local timezone offset to the Javascript date object.
     * The TeamSpeak timestamp is always the UTC time.
     * The problem is that the constructor of the Javascript date object always creates date in the locale time.
     * This method adds the timezone offset to the date object and returns it.
     * @param  {string} timestamp UTC timestamp from TeamSpeak
     * @return {Object}           Javascript Date object
     */
    getLocaleDate(timestamp) {
      let localeDate = new Date(timestamp)
      let milliseconds = localeDate.getTime() + (-localeDate.getTimezoneOffset() * 60 * 1000)

      localeDate.setTime(milliseconds)

      return localeDate
    },
    getUTCDateString(timestamp) {
      let date = this.getLocaleDate(timestamp)

      let year = date.getUTCFullYear()
      let month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
      let day = date.getUTCDate().toString().padStart(2, '0')

      let hours = date.getUTCHours().toString().padStart(2, '0')
      let minutes = date.getUTCMinutes().toString().padStart(2, '0')
      let seconds = date.getUTCSeconds().toString().padStart(2, '0')

      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
    },
    getLocaleDateString(timestamp) {
      let date = this.getLocaleDate(timestamp)

      let year = date.getFullYear()
      let month = (date.getMonth() + 1).toString().padStart(2, '0')
      let day = date.getDate().toString().padStart(2, '0')

      let hours = date.getHours().toString().padStart(2, '0')
      let minutes = date.getMinutes().toString().padStart(2, '0')
      let seconds = date.getSeconds().toString().padStart(2, '0')

      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
    }
  },
  async created() {
    try {
      this.logs = await this.getServerLogs()
    } catch(err) {
      this.$toast.error(err.message)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
