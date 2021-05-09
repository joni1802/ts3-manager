<template lang="html">
  <v-container>
    <v-row justify="center">
      <v-col cols="12" lg="6" md="8" sm="10">
        <v-card>
          <v-card-title>Upload File</v-card-title>
          <v-card-text>
            <v-file-input label="Upload File(s)" v-model="files" multiple></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="addFilesToUploadQueue" :disabled="!files.length">Upload</v-btn>
            <v-btn text @click="close">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      path: this.$route.query.path ? this.$route.query.path : "/",
      channelId: this.$route.params.cid,
      files: [],
    }
  },
  methods: {
    getFileId(filename) {
      return `${filename}-${this.channelId}-${this.path}-${Date.now()}`
    },
    addFilesToUploadQueue() {
      let files = this.files.map(file => ({
        id: this.getFileId(file.name),
        blob: file,
        path: this.path,
        cid: this.channelId
      }))

      this.$store.commit('addFilesToQueue', files)

      this.$router.push({name: 'files'})
    },
    close() {
      this.$router.push({name: 'files'})
    }
  },
  watch: {
    files(files) {
      console.log(this.getFileId(files[0].name));
    }
  }
}
</script>
