<template>
  <v-text-field class="mt-5" label="Generated Privilege Key" :value="value" @input="$emit('input', $event)" readonly>
    <template slot="append">
      <v-tooltip bottom>
        <template slot="activator" v-if="value">
          <v-icon @click="copyToClipboard">mdi-content-copy</v-icon>
        </template>
        <span>Copy Token To Clipboard</span>
      </v-tooltip>
    </template>
  </v-text-field>
</template>

<script>
export default {
  props: ["value"],
  methods: {
    copyToClipboard() {
      this.$clipboard(this.value)

      this.$toasted.info("Token Copied To Clipboard")
    },
  }
}
</script>
