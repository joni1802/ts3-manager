<template lang="html">
  <v-menu offset-y :close-on-content-click="false">
    <template #activator="{on}">
      <v-btn icon v-on="on">
        <v-badge :value="1">
          <template #badge>
            <span>1</span>
          </template>
          <v-icon>mdi-upload</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-item v-for="file in files" :key="file.fileId">
          <v-list-item-action>
            {{ $store.state.uploads.progress[file.fileId] }}%
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ file.blob.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  computed: {
    files() {
      return this.$store.state.uploads.files
    }
  },
  created() {
    this.$store.dispatch('setUploadFiles')
  }
}
</script>

<style lang="css" scoped>
</style>
