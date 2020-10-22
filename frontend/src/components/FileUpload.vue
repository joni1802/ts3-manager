<template lang="html">
  <v-container>
    <v-row justify="center">
      <v-col cols="12" lg="6" md="8" sm="10">
        <v-card>
          <v-card-title>Upload File</v-card-title>
          <v-card-text>
            <v-file-input label="Upload File(s)" v-model="file" :disabled="!!uploadProgress"></v-file-input>
            <div :class="{progress: true, 'progress--visible': uploadProgress}">
              <v-progress-linear v-model="uploadProgress" striped></v-progress-linear>
              <span>{{ Math.ceil(uploadProgress) }}%</span>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="uploadFiles" :disabled="file ? false : true">Upload</v-btn>
            <v-btn text color="primary" @click="$router.go(-1)">Cancel</v-btn>
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
      path: this.$route.query.path ? `${this.$route.query.path}/` : "/",
      channelId: this.$route.params.cid,
      file: undefined,
      uploadProgress: 0
    }
  },
  methods: {
    uploadFiles() {
      let formData = new FormData()
      let req = new XMLHttpRequest()

      formData.append("file", this.file)

      // Send Cookies
      req.withCredentials = true

      req.open("POST", this.getUploadURL(this.channelId, this.path))

      req.addEventListener("readystatechange", e => {
        // Request done
        if(req.readyState === 4) {
          if(req.status === 200) {
            this.$toasted.success("File successfully uploaded")
          } else {
            this.$toasted.error(req.response)
          }
        }
      })

      req.upload.addEventListener("progress", this.showProgress)

      req.send(formData)
    },
    getUploadURL(cid, path) {
      let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin
      let url = new URL("/api/upload", base)

      url.searchParams.append("path", path)
      url.searchParams.append("cid", cid)

      return url.href
    },
    showProgress(e) {
      this.uploadProgress = (e.loaded / e.total) * 100

      if(this.uploadProgress === 100) {
        setTimeout(() => {
          this.uploadProgress = 0
        }, 1000)
      }
    }
  }
}
</script>

<style lang="css" scoped>
  .progress {
    visibility: hidden;
  }

  .progress--visible {
    visibility: visible;
  }
</style>
