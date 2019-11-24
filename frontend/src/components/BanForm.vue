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
                  <v-text-field label="IP" :disabled="notEditable"  v-model="model.ip"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="Name" :disabled="notEditable" v-model="model.name"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="Unique ID" :disabled="notEditable" v-model="model.uid"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-textarea label="Reason" v-model="model.reason">
                  </v-textarea>
                </v-flex>
                <v-flex sm5 xs12>
                  <v-text-field type="number" label="Duration" :disabled="isPermanent" v-model="model.duration"></v-text-field>
                </v-flex>
                <v-flex sm5 xs12>
                  <v-autocomplete :items="timeUnits" v-model="selectedUnit"></v-autocomplete>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat @click="$router.go(-1)" color="primary"><v-icon>arrow_back</v-icon>Back</v-btn>
              <v-btn flat @click="ban" :disabled="disabledButton" color="primary">OK</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    // See https://vuejs.org/v2/guide/components-custom-events.html#Customizing-Component-v-model
    // The problem is that the v-model data in this component is loaded async
    // With this solution the v-model gets updated.
    // Honestly I do not quite understand it yet but it works
    model: {
      prop: 'item',
      event: 'change'
    },
    props: {
      title: String,
      // client or ban object
      item: {
        type: Object,
        default() {
          return {}
        }
      },
      notEditable: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        timeUnits: [
          {text: 'seconds', value: 1}, // value = seconds
          {text: 'minutes', value: 60},
          {text: 'hours', value: 3600},
          {text: 'days', value: 86400},
          {text: 'permanent', value: 0},
        ],
        selectedUnit: 1,
        isPermanent: false,
      }
    },
    computed: {
      model: {
        get() {
          return this.item
        },
        set(value) {
          this.$emit('change', value)
        }
      },
      disabledButton() {
        if((this.model.ip === '' || this.model.ip === null) && (this.model.name === '' || this.model.name === null) && (this.model.uid === '' || this.model.uid === null)) {
          return true
        } else {
          return false
        }
      },
    },
    methods: {
      ban() {
        this.$emit('ban', {
          ...this.model,
          duration: this.model.duration * this.selectedUnit
        })
      },
      setOptimalTimeUnit(seconds) {
        if(seconds == 0) { // Zero means permanent
          this.selectedUnit = 0
        } else if(Number.isInteger((seconds / 86400))) { // Convert to days
          this.selectedUnit = 86400

          this.model.duration = seconds / 86400
        } else if(Number.isInteger((seconds / 3600))) { // Convert to hours
          this.selectedUnit = 3600

          this.model.duration = seconds / 3600
        } else if(Number.isInteger((seconds / 60))) { // Convert to minutes
          this.selectedUnit = 60

          this.model.duration = seconds / 60
        } else { // Convert to seconds
          this.selectedUnit = 1

          this.model.duration = seconds
        }
      },
      checkIfPermanent(unit) {
        // If selected unit is permanent disable duration text field
        if(unit === 0) {
          this.isPermanent = true
        } else {
          this.isPermanent = false
        }
      }
    },
    watch: {
      selectedUnit(unit) {
        this.checkIfPermanent(unit)
      },
      model(ban) {
        // Once the data is loaded or changed calculate the seconds in a more readable time unit
        this.selectedUnit = 1

        this.setOptimalTimeUnit(ban.duration)
      }
    }

  }
</script>
