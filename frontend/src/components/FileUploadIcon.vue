<template lang="html">
  <v-menu offset-y :close-on-content-click="false" max-width="400">
    <template #activator="{on}">
      <v-btn icon v-on="on">
        <v-badge :value="uploadQueue.length">
          <template #badge>
            <span>{{ uploadQueue.length }}</span>
          </template>
          <v-icon>mdi-upload</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-item v-if="!uploadQueue.length">
          <v-list-item-content>
            <v-list-item-title>No Uploads</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-for="file in uploadQueue" :key="file.clientftfid">
          <v-list-item-avatar>
            <v-progress-circular
              :value="file.progress"
              color="primary"
            >
            </v-progress-circular>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ file.blob.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ file.filePath }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <div class="d-flex">
              <v-btn
                v-if="file.uploading"
                icon
                @click="pauseUpload()"
              >
                <v-icon>mdi-pause</v-icon>
              </v-btn>
              <v-btn
                v-else
                icon
                :loading="loading"
                @click="startUploadLoop(file.clientftfid)"
                :disabled="$store.getters.uploading"
              >
                <v-icon>mdi-play</v-icon>
              </v-btn>

              <v-btn
                icon
                @click="removeUpload(file.clientftfid)"
                :disabled="file.uploading"
              >
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

export default {
  data() {
    return {
      queueWatcher: undefined,
      cancelUpload: {},
      loading: false,
    }
  },
  computed: {
    uploadQueue() {
      return this.$store.state.uploads.queue
    }
  },
  methods: {
    getUploadUrl(cid, path) {
      let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin
      let url = new URL("/api/upload", base)

      return url.href
    },
    getFileInfo(cid, name, cpw = '') {
      return this.$TeamSpeak.execute('ftgetfileinfo', {cid, name, cpw}).then(res => res[0])
    },
    initFileUpload(file, overwrite = 1, resume = 0, cpw = '') {
      return this.$TeamSpeak.execute('ftinitupload', {
        clientftfid: file.clientftfid,
        name: file.filePath,
        cid: file.cid,
        size: file.fileSize,
        cpw,
        overwrite,
        resume
      })
        .then(res => res[0])
    },
    watchQueue() {
      this.queueWatcher = this.$watch('$store.state.uploads.queue', () => {
        this.startUploadLoop()
      })
    },
    unwatchQueue() {
      this.queueWatcher()
    },
    getFileInQueue(clientftfid) {
      return this.uploadQueue.find(file => file.clientftfid === clientftfid)
    },
    uploadFile2(blob, clientftfid, ftkey, port, sendedBytes = 0) {
      let formData = new FormData()

      formData.append('file', blob)

      return axios({
        headers: {
          'x-file-transfer-key': ftkey,
          'x-file-transfer-port': port
        },
        method: 'POST',
        url: this.getUploadUrl(),
        withCredentials: true,
        data: formData,
        onUploadProgress: e => {
          let percentage = ((e.loaded + sendedBytes)/ (e.total + sendedBytes)) * 100

          this.$store.commit('setFileUploadProgress', {clientftfid, percentage})

          console.log(percentage);
        },
        cancelToken: new CancelToken(cancel => {
          this.cancelUpload = cancel
        })
      })
    },

    async startUploadLoop(clientTransferId) {
      try {
        this.unwatchQueue()

        let clientftfid = clientTransferId ? clientTransferId : this.uploadQueue[0].clientftfid
        let file = this.getFileInQueue(clientftfid)

        file.uploading = true

        if(file.progress) {
          let {ftkey, port} = await this.initFileUpload(file, 0, 1)
          let {size} = await this.getFileInfo(file.cid, file.filePath)

          await this.uploadFile2(file.blob.slice(size), clientftfid, ftkey, port, size)
        } else {
          let {ftkey, port} = await this.initFileUpload(file)

          await this.uploadFile2(file.blob, clientftfid, ftkey, port)
        }

        this.$store.commit('removeFileFromQueue', clientftfid)

        if(!this.uploadQueue.length) {
          this.watchQueue()
        } else {
          this.startUploadLoop()
        }
      } catch(err) {
        this.handleUploadError(err)
      }
    },

    pauseUpload() {
      this.cancelUpload()

      this.loading = true

      setTimeout(() => {
        this.loading = false
      }, 5000)
    },
    removeUpload(clientftfid) {
      this.$store.commit('removeFileFromQueue', clientftfid)
    },
    handleUploadError(err) {
      // Hide error when upload got paused
      if(err.constructor.name !== 'Cancel') {
        this.$toast.error(err.message)
      }

      this.$store.commit('resetUploadState')
    }
  },
  created() {
    this.watchQueue()
  }
}
</script>

<style lang="css" scoped>
</style>
