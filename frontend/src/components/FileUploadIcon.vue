<template lang="html">
  <v-menu offset-y :close-on-content-click="false" max-width="400">
    <template #activator="{on}">
      <v-btn icon v-on="on">
        <v-badge :value="countFiles">
          <template #badge>
            <span>{{ countFiles }}</span>
          </template>
          <v-icon>mdi-upload</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-item v-for="(file, index) in queue" :key="file.id">
          <v-list-item-avatar>
            <v-progress-circular
              :value="index === 0 ? progress : 0"
              color="primary"
            >
            </v-progress-circular>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ file.blob.name }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <div class="d-flex">
              <v-btn icon @click="pauseUpload()" :disabled="index !== 0">
                <v-icon>mdi-pause</v-icon>
              </v-btn>
              <v-btn icon @click="removeUpload(file.id)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
import axios, {CancelToken} from 'axios'

// To-Do:
// - show placeholder when there are no files
// - save file in indexeddb
// - pause file uploads (axios cancel token)
// - cancel file uploads (axios cancel token)

export default {
  data() {
    return {
      queue: [],
      progress: 0,
      queueWatcher: undefined,
      cancelUpload: {}
    }
  },
  computed: {
    countFiles() {
      return this.queue.length
    }
  },
  methods: {
    getUploadUrl(cid, path) {
      let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin
      let url = new URL("/api/upload", base)

      url.searchParams.append("path", path)
      url.searchParams.append("cid", cid)

      return url.href
    },
    watchQueue() {
      this.queueWatcher = this.$watch('queue', () => {
        this.uploadFile()
      })
    },
    unwatchQueue() {
      this.queueWatcher()
    },
    async uploadFile() {
      try {
        this.unwatchQueue()

        console.log(`Uploading ${this.queue[0].blob.name}`);

        let {blob, cid, path} = this.queue[0]
        let formData = new FormData()

        formData.append('file', blob)

        await axios({
          headers: {
            'x-file-size': blob.size,
            'x-file-name': blob.name
          },
          method: 'POST',
          url: this.getUploadUrl(cid, path),
          withCredentials: true,
          data: formData,
          onUploadProgress: e => {
            let percentage = (e.loaded / e.total) * 100

            this.progress = percentage

            console.log(percentage);
          },
          cancelToken: new CancelToken(cancel => {
            this.cancelUpload = cancel
          })
        })

        this.queue.splice(0, 1)

        if(!this.queue.length) {
          this.watchQueue()
        } else {
          this.uploadFile()
        }
      } catch(err) {
        console.log(err)

        // Hide error when upload got canceled
        if(err.constructor.name !== 'Cancel') {
          this.$toast.error(err.message)
        }
      }
    },
    pauseUpload() {
      this.cancelUpload()
    },
    removeUpload(fileId) {
      // this.pauseUpload()

      let index = this.queue.IndexOf(file => file.id === fileId)

      this.queue.splice(index, 1)

    }
  },
  created() {
    this.watchQueue()
  },
  watch: {
    '$store.state.uploads.queue'(files) {
      this.queue.push(...files)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
