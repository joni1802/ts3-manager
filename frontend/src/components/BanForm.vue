<template>
<v-container>
  <v-layout justify-center>
    <v-flex lg6 md8 sm8 xs12>
      <v-card>
        <v-form>
          <v-card-title>
            {{ title }}
          </v-card-title>
          <v-card-text>
            <v-layout wrap justify-space-between>
              <v-flex xs12>
                <v-text-field label="IP" :disabled="$store.state.query.loading" v-model="ip"></v-text-field>
                <v-text-field label="Name" :disabled="$store.state.query.loading" v-model="name"></v-text-field>
                <v-text-field label="Unique ID" :disabled="$store.state.query.loading" v-model="uid"></v-text-field>
                <v-textarea label="Reason" v-model="reason" :disabled="$store.state.query.loading">
                </v-textarea>
              </v-flex>
              <v-flex sm5 xs12>
                <v-text-field type="number" label="Duration" :disabled="!selectedUnit || $store.state.query.loading" v-model="time"></v-text-field>
              </v-flex>
              <v-flex sm5 xs12>
                <v-autocomplete :items="timeUnits" :disabled="$store.state.query.loading" v-model="selectedUnit"></v-autocomplete>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click="addBan" :disabled="disabledButton" color="primary">OK</v-btn>
            <v-btn flat @click="$router.go(-1)" color="primary">Cancle</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
  props: {
    title: String,
    ban: Object, // client or ban object
  },
  data() {
    return {
      timeUnits: [{
          text: 'seconds',
          value: 1
        }, // value = seconds
        {
          text: 'minutes',
          value: 60
        },
        {
          text: 'hours',
          value: 3600
        },
        {
          text: 'days',
          value: 86400
        },
        {
          text: 'permanent',
          value: 0
        },
      ],
      selectedUnit: 1,
    }
  },
  computed: {
    ip: {
      get() {
        return this.ban.ip
      },
      set(ip) {
        this.ban.ip = ip
      }
    },
    name: {
      get() {
        return this.ban.name
      },
      set(name) {
        this.ban.name = name
      }
    },
    uid: {
      get() {
        return this.ban.uid
      },
      set(uid) {
        this.ban.uid = uid
      }
    },
    reason: {
      get() {
        return this.ban.reason
      },
      set(reason) {
        this.ban.reason = reason
      }
    },
    time: {
      get() {
        return this.ban.time
      },
      set(time) {
        this.ban.time = +time
      }
    },
    disabledButton() {
      if (this.ip || this.name || this.uid) return false

      return true
    }
  },
  methods: {
    addBan() {
      this.$emit('addban', {
        ...this.ban,
        time: this.time * this.selectedUnit
      })
    },
    getOptimalTimeUnit(seconds) {
      let unit = ''

      if (!seconds) {
        unit = 'permanent'
      } else if (Number.isInteger((seconds / 86400))) {
        unit = 'days'
      } else if (Number.isInteger((seconds / 3600))) {
        unit = 'hours'
      } else if (Number.isInteger((seconds / 60))) {
        unit = 'minutes'
      } else {
        unit = 'seconds'
      }

      return unit
    },
    setOptimalTimeUnit(seconds) {
      let timeUnit = this.getOptimalTimeUnit(seconds)

      switch (timeUnit) {
        case 'permanent':
          this.selectedUnit = 0
          break;
        case 'days':
          this.selectedUnit = 86400
          break;
        case 'hours':
          this.selectedUnit = 3600
          break;
        case 'minutes':
          this.selectedUnit = 60
          break;
        default:
          this.selectedUnit = 1
      }
    },
    init() {
      let unwatchTime = this.$watch('time', seconds => {
        if (seconds !== undefined) {
          this.setOptimalTimeUnit(seconds)

          // because of the "immediate" option
          this.$nextTick(() => {
            unwatchTime()

            this.ban.time = seconds / this.selectedUnit
          })
        }
      }, {
        immediate: true
      })
    }
  },
  created() {
    this.init()
  }
}
</script>
