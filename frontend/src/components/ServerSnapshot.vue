<template>
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title primary-title>
            <div>
              <span class="grey--text">Backup</span><br>
              <span>Download a backup file which contains all the necessary data to restore the virtual server</span>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-btn text color="blue" @click="createSnapshot">
              Create Snapshot
              <v-icon right>
                mdi-file-download-outline
              </v-icon>
            </v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-title primary-title>
            <div>
              <span class="grey--text">Restore</span><br>
              <span>Upload a backup file to restore the virtual server</span>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-layout justify-space-between wrap>
              <v-flex xs12 sm12 md6>
                <input type="file" style="display: none" ref="hiddenFileSelector" @change="readFile" accept=".backup">
                <v-text-field label="Select Backup File" @click="selectFile" v-model="fileName" prepend-icon="attach_file"></v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md5>
                <v-btn text color="red" :disabled="filePicked" @click="deploySnapshot">
                  Deploy Snapshot
                  <v-icon right>
                    mdi-file-upload-outline
                  </v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import {saveAs} from 'file-saver'

  export default {
    data() {
      return {
        fileName: '',
        fileContent: {}
      }
    },
    computed: {
      filePicked() {
        return this.fileName ? false : true
      }
    },
    methods: {
      async createSnapshot() {
        try {
          let response = await this.$TeamSpeak.createSnapshot()

          this.saveFile(response[0].data)
        } catch(err) {
          this.$toasted.error(err.message)
        }
      },
      generateFileName() {
        return `${new Date().toISOString()}.backup`
      },
      saveFile(snapshot) {
        saveAs(new Blob([snapshot]), this.generateFileName())
      },
      selectFile() {
        // In this version of vuetify there is no component for input type file
        // See: https://github.com/vuetifyjs/vuetify/issues/238
        this.$refs.hiddenFileSelector.click()
      },
      async readFile(e) {
        let file = e.target.files[0]

        if(file) {
          this.fileName = file.name

          try {
            // https://developer.mozilla.org/en-US/docs/Web/API/Blob/text
            let text = await file.text()

            this.fileContent = new Blob([text])
          } catch(err) {
            this.$toasted.error(err.message)
          }
        }
      },
      async deploySnapshot() {
        try {
          let response = await this.$TeamSpeak.deploySnapshot(this.fileContent)

          this.$toasted.success('Snapshot successfully restored')

          await this.$TeamSpeak.selectServer(this.$store.state.query.serverId) // After snapshot deployment server needs to be selected again

          this.clearFileSelector()
        } catch(err) {
          this.$toasted.error(err.message)
        }
      },
      clearFileSelector() {
        this.fileName = ''
        this.fileContent = {}
        this.$refs.hiddenFileSelector.value = ''
      }
    }
  }
</script>
