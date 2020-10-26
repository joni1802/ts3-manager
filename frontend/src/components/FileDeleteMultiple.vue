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
    selectedFiles: Array
  },
  data() {
    return {
      dialog: false
    }
  },
  methods: {
    async deleteFiles() {
      try {
        for(let file of this.selectedFiles) {
          // if it is not a channel
          if(file.path !== undefined) {
            await this.$TeamSpeak.execute("ftdeletefile", {
              cid: file.cid,
              cpw: "",
              name: Path.join(file.path, file.name)
            })

            this.$emit("filedelete", file)
          }
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
