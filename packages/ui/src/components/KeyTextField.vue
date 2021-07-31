<template>
  <v-text-field
    class="mt-5"
    :label="label"
    :value="value"
    @input="$emit('input', $event)"
    readonly
    outlined
  >
    <template #append v-if="value">
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon v-on="on" @click="copyToClipboard">mdi-content-copy</v-icon>
        </template>
        <span>Copy To Clipboard</span>
      </v-tooltip>
    </template>
  </v-text-field>
</template>

<script>
export default {
  props: {
    value: String,
    label: String,
  },
  methods: {
    copyToClipboard() {
      this.$clipboard(this.value);

      this.$toast.info("Copied To Clipboard");
    },
  },
};
</script>
