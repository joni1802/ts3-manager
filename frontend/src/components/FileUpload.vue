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
      temp: []
    }
  },
  methods: {
    getFileId(filename) {
      return `${filename}-${this.channelId}-${this.path}-${Date.now()}`
    },
    getFilePath(filename) {
      return `${this.path}${filename}`
    },
    initFileUpload(file) {
      return this.$TeamSpeak.execute('ftinitupload', {
        clientftfid: 1,
        name: this.getFilePath(file.name),
        cid: this.channelId,
        size: file.size,
        cpw: '',
        overwrite: 1,
        resume: 0
      })
    },
    async addFilesToUploadQueue() {
      try {
        for(let file of this.files) {
          let [uploadData] = await this.initFileUpload(file)

          this.$store.commit('addFileToQueue', {
            ...uploadData,
            cid: this.channelId,
            path: this.getFilePath(file.name),
            blob: file
          })
        }
      } catch(err) {
        console.log(err);

        this.$toast.error(err.message)
      }

      // Maybe add Loading state 

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
