<template lang="html">
  <v-autocomplete :value="value" @input="changeValue" :items="items"  chips multiple :label="label" :disabled="disabled">
    <template slot="selection" slot-scope="{index, item}">
      <v-chip v-if="index < maxVisibleChips" close @input="removeChip(item.value)">
        <span>{{ item.text }}</span>
      </v-chip>
      <span v-if="index == maxVisibleChips" class="grey--text caption">
        (+{{ value.length - maxVisibleChips}} others)
      </span>
    </template>
    <template slot="item" slot-scope="{item, tile}">
      <v-list-tile-action>
        <v-checkbox v-model="tile.props.value"></v-checkbox>
      </v-list-tile-action>
      <v-list-tile-content>
        <span>{{ item.text }}</span>
        <span v-if="item.uid" class="grey--text caption">{{ item.uid }}</span>
      </v-list-tile-content>
    </template>
  </v-autocomplete>
</template>

<script>
// This just a customized select element with chips and autocompletion.
// Property "value" needs to be called otherwise v-model would no work. 
export default {
  props: {
    value: Array, // selectedElements
    items: Array, // availableElements
    label: String,
    maxVisibleChips: Number,
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  methods: {
    removeChip(value) {
      let index = this.value.indexOf(value)

      this.value.splice(index, 1)
    },
    changeValue(array) {
      this.$emit('input', array)
    }
  }
}
</script>
