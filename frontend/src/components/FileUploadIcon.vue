<template lang="html">
  <v-menu offset-y :close-on-content-click="false" max-width="400">
    <template #activator="{on}">
      <v-btn icon v-on="on">
        <v-badge :value="countUploadingFiles">
          <template #badge>
            <span>{{ countUploadingFiles }}</span>
          </template>
          <v-icon>mdi-upload</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <v-card>
      <file-upload-list v-if="countUploadingFiles"></file-upload-list>
      <v-list v-else>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>No Files</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  components: {
    FileUploadList: () => import('@/components/FileUploadList')
  },
  computed: {
    countUploadingFiles() {
      return this.$store.state.uploads.files.length
    }
  },
  created() {
    this.$store.dispatch('setUploadFiles')
  }
}
</script>

<style lang="css" scoped>
</style>
