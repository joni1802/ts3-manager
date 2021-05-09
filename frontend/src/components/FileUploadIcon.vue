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
        <v-list-item v-for="(file, index) in uploadQueue" :key="file.serverftfid">
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
              <v-btn icon @click="pauseUpload(file.serverftfid)" :disabled="index !== 0">
                <v-icon>mdi-pause</v-icon>
              </v-btn>
              <v-btn icon @click="removeUpload(file.serverftfid)">
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
      // queue: [],
      progress: 0,
      queueWatcher: undefined,
      cancelUpload: {}
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

      // url.searchParams.append("path", path)
      // url.searchParams.append("cid", cid)

      return url.href
    },
    getFileInfo(cid, path, cpw = '') {
      return this.$TeamSpeak.execute('ftgetfileinfo', {cid, path, cpw})
    },
    initFileUpload() {

    },
    watchQueue() {
      this.queueWatcher = this.$watch('$store.state.uploads.queue', () => {
        this.uploadFile()
      })
    },
    unwatchQueue() {
      this.queueWatcher()
    },
    async uploadFile() {
      try {
        this.unwatchQueue()

        console.log(`Uploading ${this.$store.state.uploads.queue[0].blob.name}`);

        let {blob, ftkey, serverftfid, port} = this.$store.state.uploads.queue[0]
        let formData = new FormData()

        formData.append('file', blob)


        // {
        //   clientftfid: 7811,
        //   serverftfid: 4,
        //   ftkey: '+LXuKfqhaiq22VjE3yLAlDfx1dmI4hPt',
        //   port: 30033,
        //   seekpos: '0',
        //   proto: 0
        // }


        console.log(this.$store.state.uploads.queue[0]);

        await axios({
          headers: {
            'x-file-transfer-key': ftkey,
            'x-file-transfer-port': port
          },
          method: 'POST',
          url: this.getUploadUrl(),
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

        this.$store.commit('removeFileFromQueue', serverftfid)

        if(!this.uploadQueue.length) {
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

      // let file = this.uploadQueue.find(file => file.serverftfid === serverftfid)
      //
      // this.$store.commit('removeFileFromQueue', serverftfid)
    },
    async resumeUpload(serverftfid) {
      try {
        let [fileInfo] = this.getFileInfo(this.uploadQueue[0].cid, this.uploadQueue[0].path)

        let newBlob = file.blob.slice(fileInfo.size)

        this.$store.commit('setFileInQueue', )
      } catch(err) {

      }

    },
    removeUpload(fileId) {
      // this.pauseUpload()

      // let index = this.queue.IndexOf(file => file.id === fileId)
      //
      // this.queue.splice(index, 1)

    }
  },
  created() {
    this.watchQueue()
  },
  // watch: {
  //   '$store.state.uploads.queue'(files) {
  //     this.queue.push(...files)
  //   }
  // }
}
</script>

<style lang="css" scoped>
</style>
