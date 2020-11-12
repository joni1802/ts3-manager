<template lang="html">
  <div>
    <v-btn color="error" @click="dialog = true" :disabled="!!!selectedFiles.length">
      <v-icon left>delete</v-icon>
      Remove
    </v-btn>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>Delete Selected Files/Folders</v-card-title>
        <v-card-text>
          Do you really want to delete all selected files and folders?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteFiles" color="primary">Yes</v-btn>
          <v-btn text @click="dialog = false" color="primary">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Path from "path-browserify"

export default {
  props:{
    /**
     * All selected files, folder and channels
     * @type {Array.<TreeItem>}
     */
    selectedFiles: Array
  },
  data() {
    return {
      dialog: false
    }
  },
  methods: {
    /**
     * Remove all selected child items if a the parent item is selected.
     * If a folder and a file inside that folder are selected, only the delete command for
     * the folder will be send to the ServerQuery.
     * @return {Array.<TreeItem>} - selected parent items
     */
    getRemoveList() {
      let removeList = [...this.selectedFiles]

      this.selectedFiles.forEach((file, index, array) => {
        let parentFile = array.find(selectedFile => file.pid === selectedFile.id)

        if(parentFile) {
          delete removeList[index]
        }
      })

      // reindex array
      return removeList.filter(file => file)
    },

    /**
     * Send delete command for each file/folder to the ServerQuery and emit
     * an event to update the directory.
     */
    async deleteFiles() {
      let fileRemoveList = this.getRemoveList()

      try {
        for(let file of fileRemoveList) {
          // if it is a file or folder
          if(file.path !== undefined) {
            await this.$TeamSpeak.execute("ftdeletefile", {
              cid: file.cid,
              cpw: "",
              name: Path.join(file.path, file.name)
            })

          // if it is a channel
          } else {
            for(let childFile of file.children) {
              await this.$TeamSpeak.execute("ftdeletefile", {
                cid: file.cid,
                cpw: "",
                name: Path.join(childFile.path, childFile.name)
              })
            }
          }

          this.$emit("filedelete", file)
        }
      } catch(err) {
        this.$toasted.error(err.message)
      }

      this.dialog = false
    }
  }
}
</script>

<style lang="css" scoped>
</style>
