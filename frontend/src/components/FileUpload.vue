<template lang="html">
  <v-container>
    <v-row justify="center">
      <v-col cols="12" lg="6" md="8" sm="10">
        <v-card>
          <v-card-title>Upload File</v-card-title>
          <v-card-text>
            <v-file-input label="Upload File(s)" v-model="file" :disabled="loading"></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="uploadFiles"
              :disabled="!!!file || loading"
              :loading="!!uploadProgress"
            >
              <template #loader>
                <span>{{ Math.ceil(uploadProgress) }}%</span>
              </template>
              Upload
            </v-btn>
            <v-btn text color="primary" @click="cancel">Cancel</v-btn>
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
      file: undefined,
      uploadProgress: 0,
      request: {}
    }
  },
  computed: {
    loading() {
      return !!this.uploadProgress
    }
  },
  methods: {
    uploadFiles() {
      let formData = new FormData()
      this.request = new XMLHttpRequest()

      formData.append("file", this.file)

      // Send Cookies
      this.request.withCredentials = true

      this.request.open("POST", this.getUploadURL(this.channelId, this.path))

      this.request.addEventListener("readystatechange", e => {
        // Request done
        if(this.request.readyState === 4) {
          if(this.request.status === 200) {
            this.$toast.success("File successfully uploaded")
          } else {
            this.$toast.error(this.request.response)
          }
        }
      })

      this.request.upload.addEventListener("progress", this.showProgress)

      this.request.send(formData)
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
    },
    cancel() {
      this.request.abort && this.request.abort()

      this.$router.go(-1)
    }
  }
}
</script>
