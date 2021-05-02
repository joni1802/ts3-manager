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
            <!-- :disabled="!!!file || loading" :loading="!!uploadProgress" -->
            <v-btn
              color="primary"
              @click="uploadFile"


            >
              <!-- <template #loader>
                <span>{{ Math.ceil(uploadProgress) }}%</span>
              </template> -->
              Upload
            </v-btn>
            <!-- <v-btn text color="primary" @click="cancel">Cancel</v-btn>
            <v-btn @click="request.abort()">Abort</v-btn> -->
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import localForage from 'localforage'

export default {
  data() {
    return {
      path: this.$route.query.path ? this.$route.query.path : "/",
      channelId: this.$route.params.cid,
      file: undefined,
      uploadProgress: 0,
      request: {},
      uploadQueue: {},
      db: {}
    }
  },
  computed: {
    loading() {
      return !!this.uploadProgress
    }
  },
  methods: {
    uploadFile() {
      this.$store.dispatch('uploadFile', {
        blob: this.file,
        path: this.path,
        cid: this.channelId
      })
    },
    // async uploadFiles() {
    //   try {
    //     this.request = new XMLHttpRequest()
    //     let formData = new FormData()
    //
    //     let {file} = await this.saveFile(this.file, this.channelId, this.path)
    //
    //     formData.append("file", file)
    //
    //     // Send Cookies
    //     this.request.withCredentials = true
    //
    //     this.request.open("POST", this.getUploadURL(this.channelId, this.path))
    //
    //     this.request.setRequestHeader("x-file-size", file.size)
    //     this.request.setRequestHeader("x-file-name", file.name)
    //
    //     this.request.addEventListener("readystatechange", e => {
    //       // Request done
    //       if(this.request.readyState === 4) {
    //         if(this.request.status === 200) {
    //           this.$toast.success("File successfully uploaded")
    //
    //           this.removeFile(this.file, this.channelId, this.path)
    //         } else {
    //           this.request.response && this.$toast.error(this.request.response)
    //         }
    //       }
    //     })
    //
    //     this.request.upload.addEventListener("progress", this.showProgress)
    //
    //     this.request.send(formData)
    //   } catch(err) {
    //     console.log(err)
    //
    //     this.$toast.error(err.message)
    //   }
    //
    //
    // },
    // getUploadURL(cid, path) {
    //   let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin
    //   let url = new URL("/api/upload", base)
    //
    //   url.searchParams.append("path", path)
    //   url.searchParams.append("cid", cid)
    //
    //   return url.href
    // },
    // showProgress(e) {
    //   this.uploadProgress = (e.loaded / e.total) * 100
    //
    //   console.log(`${this.uploadProgress}%`);
    //
    //   if(this.uploadProgress === 100) {
    //     setTimeout(() => {
    //       this.uploadProgress = 0
    //     }, 1000)
    //   }
    // },
    // cancel() {
    //   this.request.abort && this.request.abort()
    //
    //   this.$router.go(-1)
    // },
    // saveFile(file, cid, path) {
    //   let fileId = this.getFileId(file.name, cid, path)
    //
    //   return this.db.getItem(fileId)
    //     .then(existingFile => {
    //       if(existingFile) throw new Error('The file is already in the upload queue')
    //
    //       return this.db.setItem(fileId, {file, cid, path})
    //     })
    // },
    // removeFile(file, cid, path) {
    //   let fileId = this.getFileId(file.name, cid, path)
    //
    //   return this.db.removeItem(fileId)
    // },
    // getFileId(filename, cid, path) {
    //   return btoa(`${filename}${cid}${path}`)
    // },
    // getDatabase() {
    //   return localForage.createInstance({
    //     driver: localForage.INDEXEDDB,
    //     name: 'files',
    //     storeName: 'upload-queue'
    //   })
    // }
  },
  created() {
    // this.db = this.getDatabase()
  }
}
</script>
