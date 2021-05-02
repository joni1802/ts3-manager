<template lang="html">
  <v-list>
    <v-list-item v-for="file in files" :key="file.fileId">
      <v-list-item-avatar>
        <v-progress-circular
          :value="$store.state.uploads.progress[file.fileId]"
          color="primary"
        >
        </v-progress-circular>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>{{ file.blob.name }}</v-list-item-title>
        <!-- <v-list-item-subtitle>
          {{ getFullPath(file.cid, file.path) }}
        </v-list-item-subtitle> -->
      </v-list-item-content>
      <v-list-item-action>
        <div class="d-flex">
          <v-btn icon @click="$emit('pause', file.fileId)">
            <v-icon>mdi-pause</v-icon>
          </v-btn>
          <v-btn icon @click="$emit('remove', file.fileId)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  computed: {
    files() {
      return this.$store.state.uploads.files
    }
  }
}
</script>

<style lang="css" scoped>
</style>
