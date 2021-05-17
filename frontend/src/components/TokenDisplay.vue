<template>
  <v-text-field
    class="mt-5"
    label="Generated Privilege Key"
    :value="value"
    @input="$emit('input', $event)"
    readonly
  >
    <template #append v-if="value">
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon v-on="on" @click="copyToClipboard">mdi-content-copy</v-icon>
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
      this.$clipboard(this.value);

      this.$toast.info("Token Copied To Clipboard");
    },
  },
};
</script>
